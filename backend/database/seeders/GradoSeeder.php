<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Grado;

class GradoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $grados = [
            ['id' => 1, 'nombre' => 'Doctorado'],
            ['id' => 2, 'nombre' => 'Maestría'],
            ['id' => 3, 'nombre' => 'Segunda Especialidad Profesional'],
        ];

        foreach ($grados as $grado) {
            Grado::create($grado);
        }
    }
}
