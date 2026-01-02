<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Curso;
use App\Models\Programa;
use App\Models\Semestre;
use Illuminate\Support\Facades\DB;

class CursosSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = base_path('DOCTORADOS, SEMESTRES CURSOS.txt');

        if (!file_exists($filePath)) {
            $this->command->error("File not found: $filePath");
            return;
        }

        $content = file_get_contents($filePath);
        // Normalize newlines
        $content = str_replace(["\r\n", "\r"], "\n", $content);

        // Split by separator (5 or more equals signs)
        $sections = preg_split('/={5,}/', $content);

        // Mapping from Text File Name (partial match) to Database Name
        $nameMapping = [
            'ADMINISTRACIÓN' => 'Administración',
            'CIENCIAS AMBIENTALES' => 'Ciencias Ambientales',
            'ENFERMERÍA' => 'Ciencias de Enfermería',
            'INGENIERÍA MECÁNICA' => 'Ciencias de la Ingeniería Mecánica y Eléctrica con mención en Energía',
            'DERECHO Y CIENCIA' => 'Derecho y Ciencia Política',
            'TERRITORIO Y URBANISMO' => 'Territorio y Urbanismo Sostenible',
            'SOCIOLOGÍA' => 'Sociología',
            'CIENCIAS DE LA EDUCACIÓN' => 'Ciencias de la Educación',
        ];

        foreach ($sections as $section) {
            $section = trim($section);
            if (empty($section))
                continue;

            $lines = explode("\n", $section);

            // 1. Identify Program from the first few lines
            $headerLines = [];
            $programName = null;

            // Grab first 5 lines to look for header
            for ($i = 0; $i < min(5, count($lines)); $i++) {
                $line = trim($lines[$i]);
                if (empty($line))
                    continue;
                $headerLines[] = strtoupper($line);
            }
            $headerText = implode(' ', $headerLines);

            foreach ($nameMapping as $key => $dbName) {
                if (str_contains($headerText, $key)) {
                    $programName = $dbName;
                    break;
                }
            }

            if (!$programName) {
                // Try to see if it's just the first line
                $firstLine = strtoupper(trim($lines[0] ?? ''));
                if (str_starts_with($firstLine, 'DOCTORADO')) {
                    // Fallback or log
                }
                if (str_contains($headerText, 'DOCTORADO')) {
                    $this->command->warn("Could not identify program in section: " . substr($headerText, 0, 50));
                }
                continue;
            }

            $this->command->info("Processing Program: $programName");

            // 2. Parse Semesters and Courses
            $currentSemestreNum = null;

            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line))
                    continue;

                // Skip header lines (heuristic)
                if (str_contains(strtoupper($line), 'DOCTORADO'))
                    continue;
                if (str_contains(strtoupper($line), 'MENCIÓN'))
                    continue;

                // Check for Semester Number
                if (preg_match('/^(\d+)\.?$/', $line, $matches)) {
                    $currentSemestreNum = (int) $matches[1];
                    continue;
                }

                if ($currentSemestreNum) {
                    // Ignore noise
                    if (in_array(strtoupper($line), ['PERIODO', 'ACADÉMICO NOMBRE DE LA ASIGNATURA']))
                        continue;

                    // Ignore parts of the header that might have slipped through
                    if (str_contains(strtoupper($line), 'MECÁNICA Y ELÉCTRICA'))
                        continue;
                    if (str_contains(strtoupper($line), 'EN ENERGÍA'))
                        continue;
                    if (str_contains(strtoupper($line), 'POLÍTICA'))
                        continue;
                    if (str_contains(strtoupper($line), 'SOSTENIBLE'))
                        continue;
                    if (str_contains(strtoupper($line), 'EDUCACIÓN'))
                        continue;

                    // Basic cleaning
                    $cursoNombre = $this->cleanCourseName($line);
                    if (strlen($cursoNombre) < 3)
                        continue;

                    $this->processCurso($programName, $currentSemestreNum, $cursoNombre);
                }
            }
        }
    }

    private function cleanCourseName($name)
    {
        return ucfirst(strtolower($name));
    }

    private function processCurso($programaName, $semestreNum, $cursoNombre)
    {
        // 1. Find Programs (could be multiple due to periods)
        $programas = Programa::where('nombre', $programaName)
            ->where('grado_id', 1) // Doctorado
            ->get();

        if ($programas->isEmpty()) {
            $this->command->warn("    Program not found in DB: $programaName");
            return;
        }

        foreach ($programas as $programa) {
            // 2. Find or Create Semestre
            $semestre = Semestre::firstOrCreate(
                [
                    'programa_id' => $programa->id,
                    'numero_semestre' => $semestreNum,
                ],
                [
                    'nombre' => "Semestre $semestreNum",
                ]
            );

            // 3. Find or Create Curso
            // Generate a code based on program + sem + hash of name
            $cursoCode = strtoupper(substr($programaName, 0, 3)) . '-' . $semestreNum . '-' . substr(md5($cursoNombre), 0, 4);

            $curso = Curso::firstOrCreate(
                ['nombre' => $cursoNombre],
                [
                    'codigo' => $cursoCode,
                    'creditos' => 0,
                ]
            );

            // 4. Attach to Semestre
            if (!$semestre->cursos()->where('curso_id', $curso->id)->exists()) {
                $semestre->cursos()->attach($curso->id);
                $this->command->info("    Added course: $cursoNombre to {$programa->nombre} ({$programa->periodo}) - Sem $semestreNum");
            }
        }
    }
}
