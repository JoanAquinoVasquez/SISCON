<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Facultad;

class FacultadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $facultades = [
            ['nombre' => 'Facultad de Ingeniería Química e Industrias Alimentarias', 'codigo' => 'FIQUIA'],
            ['nombre' => 'Facultad de Ingeniería Civil, Sistemas y Arquitectura', 'codigo' => 'FICSA'],
            ['nombre' => 'Facultad de Ciencias Económicas, Administrativas y Contables', 'codigo' => 'FACEAC'],
            ['nombre' => 'Facultad de Enfermería', 'codigo' => 'FE'],
            ['nombre' => 'Facultad de Ingeniería Mecánica y Eléctrica', 'codigo' => 'FIME'],
            ['nombre' => 'Facultad de Derecho y Ciencias Políticas', 'codigo' => 'FDCP'],
            ['nombre' => 'Facultad de Ingeniería Agrícola', 'codigo' => 'FIA'],
            ['nombre' => 'Facultad de Ciencias Histórico Sociales y Educación', 'codigo' => 'FASCHE'],
            ['nombre' => 'Facultad de Ciencias Biológicas', 'codigo' => 'FCCBB'],
            ['nombre' => 'Facultad de Medicina Veterinaria', 'codigo' => 'FMV'],
        ];

        foreach ($facultades as $facultad) {
            Facultad::create($facultad);
        }
    }
}
