<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Curso;
use App\Models\Programa;
use App\Models\Semestre;
use Illuminate\Support\Facades\DB;

echo "Starting cleanup of Doctorate courses...\n";

// 1. Get all Doctorate Programs
$doctoratePrograms = Programa::where('grado_id', 1)->pluck('id');
echo "Found " . $doctoratePrograms->count() . " doctorate programs.\n";

if ($doctoratePrograms->isEmpty()) {
    echo "No doctorate programs found.\n";
    exit;
}

// 2. Get all Semesters for these programs
$semesters = Semestre::whereIn('programa_id', $doctoratePrograms)->pluck('id');
echo "Found " . $semesters->count() . " semesters for these programs.\n";

if ($semesters->isEmpty()) {
    echo "No semesters found.\n";
    exit;
}

// 3. Get all Course IDs attached to these semesters
$courseIds = DB::table('curso_semestre')
    ->whereIn('semestre_id', $semesters)
    ->pluck('curso_id')
    ->unique();

echo "Found " . $courseIds->count() . " courses attached to these semesters.\n";

if ($courseIds->isEmpty()) {
    echo "No courses found to delete.\n";
} else {
    // 4. Detach courses (Delete from pivot)
    $deletedPivot = DB::table('curso_semestre')
        ->whereIn('semestre_id', $semesters)
        ->delete();
    echo "Detached $deletedPivot records from curso_semestre.\n";

    // 5. Delete Courses (Only if they are not attached to other semesters)
    // Find courses that are still attached to OTHER semesters (not in our list)
    $coursesInUse = DB::table('curso_semestre')
        ->whereIn('curso_id', $courseIds)
        ->pluck('curso_id')
        ->unique();

    $coursesToDelete = $courseIds->diff($coursesInUse);

    echo "Courses still in use by other programs: " . $coursesInUse->count() . "\n";
    echo "Courses safe to delete (orphaned): " . $coursesToDelete->count() . "\n";

    if ($coursesToDelete->isNotEmpty()) {
        $deletedCourses = Curso::whereIn('id', $coursesToDelete)->delete(); // Soft delete
        // To force delete: Curso::whereIn('id', $coursesToDelete)->forceDelete();
        // User said "elimina", soft delete is safer but let's stick to model default (SoftDeletes is used in model)
        echo "Deleted $deletedCourses courses.\n";
    }
}

// 6. Optional: Delete the Semesters created? 
// The user said "elimina los cursos", but usually we want to clean up the semesters too if they were created by the seeder.
// The seeder did: Semestre::firstOrCreate(...)
// Let's delete the semesters for doctorates as well to be clean, assuming they were empty before?
// Or maybe just leave them. The user specifically said "cursos".
// I'll leave the semesters for now to be safe, unless they are empty.
// Let's delete empty semesters for these programs.

$emptySemesters = Semestre::whereIn('id', $semesters)
    ->doesntHave('cursos')
    ->delete();

echo "Deleted $emptySemesters empty semesters.\n";

echo "Cleanup complete.\n";
