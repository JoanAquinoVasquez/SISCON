<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coordinador;
use App\Models\Programa;
use App\Models\Facultad;

class CoordinadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Mapeo de códigos de facultad a IDs
        $facultadMap = [
            'FDCP' => 6,    // Facultad de Derecho y Ciencias Políticas
            'FIA' => 7,     // Facultad de Ingeniería Agrícola
            'FIME' => 5,    // Facultad de Ingeniería Mecánica y Eléctrica
            'FACHSE' => 8,  // Facultad de Ciencias Histórico Sociales y Educación
            'FACEAC' => 3,  // Facultad de Ciencias Económicas, Administrativas y Contables
            'FICSA' => 2,   // Facultad de Ingeniería Civil, Sistemas y Arquitectura
            'FIQUIA' => 1,  // Facultad de Ingeniería Química e Industrias Alimentarias
            'FCCBB' => 9,   // Facultad de Ciencias Biológicas
        ];

        $coordinadores = [
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Carlos Alberto', 'apellido_paterno' => 'Sánchez', 'apellido_materno' => 'Coronado', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Derecho con mención en Civil y Comercial', 'facultad_id' => 6],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Leopoldo', 'apellido_paterno' => 'Yzquierdo', 'apellido_materno' => 'Hernandez', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Derecho y Ciencia Política', 'facultad_id' => 6],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Jorge Segundo', 'apellido_paterno' => 'Cumpa', 'apellido_materno' => 'Reyes', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Gestión Integrada de los Recursos Hídricos', 'facultad_id' => 7],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Egberto Serafin', 'apellido_paterno' => 'Gutiérrez', 'apellido_materno' => 'Atoche', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Ciencias de la Ingeniería Mecánica y Eléctrica con mención en Energía', 'facultad_id' => 5],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Milagros Del Pilar', 'apellido_paterno' => 'Cabezas', 'apellido_materno' => 'Martinez', 'genero' => 'F', 'tipo_coordinador' => 'interno', 'programa' => 'Ciencias Sociales con mención en Gestión Pública y Gerencia Social', 'facultad_id' => 8],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Abdel Javier', 'apellido_paterno' => 'Flores', 'apellido_materno' => 'Olivos', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Ciencias con mención en Proyectos de Inversión', 'facultad_id' => 3],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Carla Rosario', 'apellido_paterno' => 'Escalante', 'apellido_materno' => 'Medina', 'genero' => 'F', 'tipo_coordinador' => 'interno', 'programa' => 'Ciencias con mención en Ordenamiento Territorial y Desarrollo Urbano', 'facultad_id' => 2],
            ['titulo_profesional' => 'Dr. Ing.', 'nombres' => 'Juan Herman', 'apellido_paterno' => 'Farías', 'apellido_materno' => 'Feijoo', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Gerencia de Obras y Construcción', 'facultad_id' => 2],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Juan Carlos', 'apellido_paterno' => 'Samamé', 'apellido_materno' => 'Castillo', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Administración', 'facultad_id' => 3],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Gerardo', 'apellido_paterno' => 'Santamaria', 'apellido_materno' => 'Baldera', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Gestión Ambiental', 'facultad_id' => 1],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Gloria Betzabet', 'apellido_paterno' => 'Puicón', 'apellido_materno' => 'Cruzalegui', 'genero' => 'F', 'tipo_coordinador' => 'interno', 'programa' => 'Ciencias de la Educación', 'facultad_id' => 8],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Luis Alberto', 'apellido_paterno' => 'Otake', 'apellido_materno' => 'Oyama', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Ingeniería de Sistemas con Mención en Gerencia de Tecnologías de la Información y Gestión del Software', 'facultad_id' => 2],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Abraham Guillermo', 'apellido_paterno' => 'Ygnacio', 'apellido_materno' => 'Santa Cruz', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Ciencias con mención en Gestión de la Calidad e Inocuidad de Alimentos', 'facultad_id' => 1],
            ['titulo_profesional' => 'Mtra.', 'nombres' => 'Jesús Alicia', 'apellido_paterno' => 'Fernández', 'apellido_materno' => 'Palomino', 'genero' => 'F', 'tipo_coordinador' => 'interno', 'programa' => 'Derecho con mención en Derecho Constitucional y Procesal Constitucional', 'facultad_id' => 6],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Eduardo Julio', 'apellido_paterno' => 'Tejada', 'apellido_materno' => 'Sánchez', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Ciencias Ambientales', 'facultad_id' => 9],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Noé Alberto', 'apellido_paterno' => 'Rosillo', 'apellido_materno' => 'Alberca', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Administración con mención en Gerencia Empresarial', 'facultad_id' => 3],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Carlos', 'apellido_paterno' => 'Cevallos', 'apellido_materno' => 'de Barrenchea', 'genero' => 'M', 'tipo_coordinador' => 'interno', 'programa' => 'Derecho con mención en Derecho Penal y Procesal Penal', 'facultad_id' => 6],
        ];

        foreach ($coordinadores as $coordinadorData) {
            // Crear el coordinador
            $coordinador = Coordinador::create([
                'nombres' => $coordinadorData['nombres'],
                'apellido_paterno' => $coordinadorData['apellido_paterno'],
                'apellido_materno' => $coordinadorData['apellido_materno'],
                'titulo_profesional' => $coordinadorData['titulo_profesional'],
                'genero' => $coordinadorData['genero'],
                'tipo_coordinador' => $coordinadorData['tipo_coordinador'],
            ]);

            // Buscar el programa por nombre parcial y facultad
            $programa = Programa::where('nombre', 'LIKE', '%' . $coordinadorData['programa'] . '%')
                ->where('facultad_id', $coordinadorData['facultad_id'])
                ->first();

            // Si se encuentra el programa, asociar el coordinador
            if ($programa) {
                $coordinador->programas()->attach($programa->id, [
                    'fecha_inicio' => now(),
                    'fecha_fin' => null,
                ]);
            }
        }
    }
}
