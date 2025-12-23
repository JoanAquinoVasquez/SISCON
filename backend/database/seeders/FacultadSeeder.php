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
            ['nombre' => 'Facultad de Ingeniería Química e Industrias Alimentarias', 'codigo' => 'FIQUIA', 'director_nombre' => 'Dr. Luis Antonio Pozo Suclupe', 'director_genero' => 'M'],
            ['nombre' => 'Facultad de Ingeniería Civil, Sistemas y Arquitectura', 'codigo' => 'FICSA', 'director_nombre' => 'Dra. Arq. Carla Rosario Escalante Medina', 'director_genero' => 'F'],
            ['nombre' => 'Facultad de Ciencias Económicas, Administrativas y Contables', 'codigo' => 'FACEAC', 'director_nombre' => 'Dr. Antonio Gilberto Escajadillo Durand', 'director_genero' => 'M'],
            ['nombre' => 'Facultad de Enfermería', 'codigo' => 'FE', 'director_nombre' => 'Dra. Clarivel De Fátima Diaz Olano', 'director_genero' => 'F'],
            ['nombre' => 'Facultad de Ingeniería Mecánica y Eléctrica', 'codigo' => 'FIME', 'director_nombre' => 'Dr. James Skinner Celada Padilla', 'director_genero' => 'M'],
            ['nombre' => 'Facultad de Derecho y Ciencias Políticas', 'codigo' => 'FDCP', 'director_nombre' => 'Dr. Victor Ruperto Anacleto Guerrero', 'director_genero' => 'M'],
            ['nombre' => 'Facultad de Ingeniería Agrícola', 'codigo' => 'FIA', 'director_nombre' => 'Dr. Juan Manuel Saavedra Tineo', 'director_genero' => 'M'],
            ['nombre' => 'Facultad de Ciencias Histórico Sociales y Educación', 'codigo' => 'FASCHE', 'director_nombre' => 'Dra. Gloria Betzabet Puicon Cruzalegui', 'director_genero' => 'F'],
            ['nombre' => 'Facultad de Ciencias Biológicas', 'codigo' => 'FCCBB', 'director_nombre' => 'Dr. José Reupo Periche', 'director_genero' => 'M'],
            ['nombre' => 'Facultad de Medicina Veterinaria', 'codigo' => 'FMV', 'director_nombre' => null, 'director_genero' => null], // No hay director en el archivo
        ];

        foreach ($facultades as $facultad) {
            Facultad::create($facultad);
        }
    }
}
