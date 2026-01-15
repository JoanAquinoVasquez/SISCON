<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            FacultadSeeder::class,
            GradoSeeder::class,
            ProgramaSeeder::class,        // Primero crear programas
            CoordinadorSeeder::class,     // Luego crear y asociar coordinadores
            SemestreCursoSeeder::class,
            CursosSeeder::class,
            DocenteSeeder::class,
            SegundaEspecialidadSemestreCursoSeeder::class,
            DoctoradoSemestreCursoSeeder::class,
        ]);
    }
}
