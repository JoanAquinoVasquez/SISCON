<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coordinador;
use App\Models\Programa;

class CoordinadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coordinadores = [
            [
                'titulo_profesional' => 'Dr.',
                'nombres' => 'Carlos Alberto',
                'apellido_paterno' => 'Sánchez',
                'apellido_materno' => 'Coronado',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Derecho con mención en Civil y Comercial', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Dr.',
                'nombres' => 'Leopoldo',
                'apellido_paterno' => 'Yzquierdo',
                'apellido_materno' => 'Hernandez',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Derecho y Ciencia Política', 'grado_id' => 1] // Doctorado
                ]
            ],
            [
                'titulo_profesional' => 'Dr.',
                'nombres' => 'Jorge Segundo',
                'apellido_paterno' => 'Cumpa',
                'apellido_materno' => 'Reyes',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Gestión Integrada de los Recursos Hídricos', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Mg.',
                'nombres' => 'Egberto Serafin',
                'apellido_paterno' => 'Gutiérrez',
                'apellido_materno' => 'Atoche',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Ciencias de la Ingeniería Mecánica y Eléctrica con mención en Energía', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Mg.',
                'nombres' => 'Milagros Del Pilar',
                'apellido_paterno' => 'Cabezas',
                'apellido_materno' => 'Martinez',
                'genero' => 'F',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Ciencias Sociales con mención en Gestión Pública y Gerencia Social', 'grado_id' => 2], // Maestría
                    ['nombre' => 'Ciencias de la Educación con mención en Docencia y Gestión Universitaria', 'grado_id' => 2], // Maestría
                    ['nombre' => 'Ciencias de la Educación con mención en Gerencia Educativa Estratégica', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Dr.',
                'nombres' => 'Abdel Javier',
                'apellido_paterno' => 'Flores',
                'apellido_materno' => 'Olivos',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Ciencias con mención en Proyectos de Inversión', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Dra.',
                'nombres' => 'Carla Rosario',
                'apellido_paterno' => 'Escalante',
                'apellido_materno' => 'Medina',
                'genero' => 'F',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Ciencias con mención en Ordenamiento Territorial y Desarrollo Urbano', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Dr. Ing.',
                'nombres' => 'Juan Herman',
                'apellido_paterno' => 'Farías',
                'apellido_materno' => 'Feijoo',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Gerencia de Obras y Construcción', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Dr.',
                'nombres' => 'Juan Carlos',
                'apellido_paterno' => 'Samamé',
                'apellido_materno' => 'Castillo',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Administración', 'grado_id' => 1] // Doctorado
                ]
            ],
            [
                'titulo_profesional' => 'Mg.',
                'nombres' => 'Gerardo',
                'apellido_paterno' => 'Santamaria',
                'apellido_materno' => 'Baldera',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Gestión Ambiental', 'grado_id' => 3] // Segunda Especialidad
                ]
            ],
            [
                'titulo_profesional' => 'Dra.',
                'nombres' => 'Gloria Betzabet',
                'apellido_paterno' => 'Puicón',
                'apellido_materno' => 'Cruzalegui',
                'genero' => 'F',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Ciencias de la Educación', 'grado_id' => 1], // Doctorado
                    ['nombre' => 'Ciencias de la Educación con mención en Investigación y Docencia', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Dr.',
                'nombres' => 'Luis Alberto',
                'apellido_paterno' => 'Otake',
                'apellido_materno' => 'Oyama',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Ingeniería de Sistemas con Mención en Gerencia de Tecnologías de la Información y Gestión del Software', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Dr.',
                'nombres' => 'Abraham Guillermo',
                'apellido_paterno' => 'Ygnacio',
                'apellido_materno' => 'Santa Cruz',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Ciencias con mención en Gestión de la Calidad e Inocuidad de Alimentos', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Mtra.',
                'nombres' => 'Jesús Alicia',
                'apellido_paterno' => 'Fernández',
                'apellido_materno' => 'Palomino',
                'genero' => 'F',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Derecho con mención en Derecho Constitucional y Procesal Constitucional', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Dr.',
                'nombres' => 'Eduardo Julio',
                'apellido_paterno' => 'Tejada',
                'apellido_materno' => 'Sánchez',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Ciencias Ambientales', 'grado_id' => 1] // Doctorado
                ]
            ],
            [
                'titulo_profesional' => 'Dr.',
                'nombres' => 'Noé Alberto',
                'apellido_paterno' => 'Rosillo',
                'apellido_materno' => 'Alberca',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Administración con mención en Gerencia Empresarial', 'grado_id' => 2] // Maestría
                ]
            ],
            [
                'titulo_profesional' => 'Mg.',
                'nombres' => 'Carlos',
                'apellido_paterno' => 'Cevallos',
                'apellido_materno' => 'de Barrenchea',
                'genero' => 'M',
                'tipo_coordinador' => 'interno',
                'programas' => [
                    ['nombre' => 'Derecho con mención en Derecho Penal y Procesal Penal', 'grado_id' => 2] // Maestría
                ]
            ],
        ];

        foreach ($coordinadores as $coordinadorData) {
            // Crear o buscar el coordinador (evitar duplicados)
            $coordinador = Coordinador::firstOrCreate(
                [
                    'nombres' => $coordinadorData['nombres'],
                    'apellido_paterno' => $coordinadorData['apellido_paterno'],
                    'apellido_materno' => $coordinadorData['apellido_materno'],
                ],
                [
                    'titulo_profesional' => $coordinadorData['titulo_profesional'],
                    'genero' => $coordinadorData['genero'],
                    'tipo_coordinador' => $coordinadorData['tipo_coordinador'],
                ]
            );

            $this->command->info("Coordinador: {$coordinador->nombre_completo}");

            // Asociar con todos los programas especificados en todos los periodos
            foreach ($coordinadorData['programas'] as $programaData) {
                // Buscar todos los programas que coincidan (en todos los periodos) y con el grado correcto
                $programas = Programa::where('nombre', 'LIKE', '%' . $programaData['nombre'] . '%')
                    ->where('grado_id', $programaData['grado_id'])
                    ->get();

                if ($programas->isEmpty()) {
                    $this->command->warn("  ⚠ Programa no encontrado: {$programaData['nombre']} (Grado ID: {$programaData['grado_id']})");
                    continue;
                }

                foreach ($programas as $programa) {
                    // Verificar si ya está asociado
                    if (!$coordinador->programas()->where('programa_id', $programa->id)->exists()) {
                        $coordinador->programas()->attach($programa->id, [
                            'fecha_inicio' => now(),
                            'fecha_fin' => null,
                        ]);
                        $this->command->info("  ✓ Asociado a: {$programa->nombre} ({$programa->periodo}) - Grado ID: {$programa->grado_id}");
                    } else {
                        $this->command->info("  - Ya asociado: {$programa->nombre} ({$programa->periodo})");
                    }
                }
            }
        }

        $this->command->info("\n✅ Seeder de coordinadores completado");
    }
}
