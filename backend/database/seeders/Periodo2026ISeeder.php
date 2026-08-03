<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Programa;
use App\Models\Semestre;
use App\Models\Curso;

class Periodo2026ISeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Iniciando Seeder para el Periodo 2026-I...');

        // 1. Replicación de Programas Existentes (12 programas)
        $programasReplicar = [
            ['nombre' => 'Derecho y Ciencia Política', 'grado_id' => 1],
            ['nombre' => 'Ciencias de la Educación', 'grado_id' => 1],
            ['nombre' => 'Ciencias con mención en Ingeniería Hidráulica', 'grado_id' => 2],
            ['nombre' => 'Ciencias con mención en Ordenamiento Territorial y Desarrollo Urbano', 'grado_id' => 2],
            ['nombre' => 'Gerencia de Obras y Construcción', 'grado_id' => 2],
            ['nombre' => 'Ingeniería de Sistemas con Mención en Gerencia de Tecnologías de la Información y Gestión del Software', 'grado_id' => 2],
            ['nombre' => 'Derecho con mención en Derecho Penal y Procesal Penal', 'grado_id' => 2],
            ['nombre' => 'Ciencias de la Educación con mención en Docencia y Gestión Universitaria', 'grado_id' => 2],
            ['nombre' => 'Ciencias Sociales con mención en Gestión Pública y Gerencia Social', 'grado_id' => 2],
            ['nombre' => 'Ciencias de la Educación con mención en Investigación y Docencia', 'grado_id' => 2],
            ['nombre' => 'Ciencias Veterinarias con Mención en Salud Animal', 'grado_id' => 2],
            ['nombre' => 'Microbiología Clínica', 'grado_id' => 3],
        ];

        foreach ($programasReplicar as $progData) {
            $nombre = $progData['nombre'];
            $gradoId = $progData['grado_id'];

            // Buscar programa de origen de un periodo anterior con el mayor número de semestres
            $sourceProgram = Programa::where('nombre', 'LIKE', $nombre)
                ->where('grado_id', $gradoId)
                ->where('periodo', '!=', '2026-I')
                ->withCount('semestres')
                ->orderBy('semestres_count', 'desc')
                ->first();

            if (!$sourceProgram) {
                $this->command->error("Programa origen no encontrado en la BD: {$nombre} (Grado: {$gradoId})");
                continue;
            }

            $this->command->info("Replicando programa: {$nombre} (Origen periodo: {$sourceProgram->periodo})");

            // Crear o recuperar el programa para el periodo 2026-I
            $targetProgram = Programa::firstOrCreate(
                [
                    'nombre' => $sourceProgram->nombre,
                    'grado_id' => $sourceProgram->grado_id,
                    'periodo' => '2026-I',
                ],
                [
                    'facultad_id' => $sourceProgram->facultad_id,
                    'descripcion' => $sourceProgram->descripcion,
                ]
            );

            // Replicar sus semestres y cursos asociados
            foreach ($sourceProgram->semestres as $sourceSemestre) {
                $targetSemestre = Semestre::firstOrCreate(
                    [
                        'programa_id' => $targetProgram->id,
                        'numero_semestre' => $sourceSemestre->numero_semestre,
                    ],
                    [
                        'nombre' => $sourceSemestre->nombre,
                        'descripcion' => $sourceSemestre->descripcion,
                    ]
                );

                // Obtener IDs de cursos del semestre origen
                $cursoIds = $sourceSemestre->cursos->pluck('id')->toArray();

                // Sincronizar en la tabla pivote curso_semestre
                $targetSemestre->cursos()->sync($cursoIds);

                $this->command->info("  -> Semestre {$targetSemestre->numero_semestre} replicado con " . count($cursoIds) . " cursos.");
            }
        }

        // 2. Creación de Nuevos Programas de Ingeniería Agrícola (3 programas)
        $newProgramsData = [
            [
                'nombre' => 'Manejo Sostenible de Suelos',
                'grado_id' => 2,
                'facultad_id' => 7,
                'descripcion' => 'Maestría en Manejo Sostenible de Suelos',
                'semestres' => [
                    1 => [
                        ['nombre' => 'Física de suelos', 'creditos' => 4],
                        ['nombre' => 'Estadística experimental', 'creditos' => 4],
                        ['nombre' => 'Metodología de la investigación', 'creditos' => 2],
                        ['nombre' => 'Análisis químico de agua, suelo y planta', 'creditos' => 2],
                    ],
                    2 => [
                        ['nombre' => 'Tesis I', 'creditos' => 4],
                        ['nombre' => 'Microbiología del suelo', 'creditos' => 4],
                        ['nombre' => 'Química de suelos', 'creditos' => 4],
                    ],
                    3 => [
                        ['nombre' => 'GIS y teledetección aplicada a suelos', 'creditos' => 4],
                        ['nombre' => 'Manejo de la fertilidad del suelo', 'creditos' => 4],
                        ['nombre' => 'Génesis y clasificación de suelos', 'creditos' => 4],
                    ],
                    4 => [
                        ['nombre' => 'Nutrición vegetal', 'creditos' => 4],
                        ['nombre' => 'Procesos de degradación y rehabilitación de suelos', 'creditos' => 4],
                        ['nombre' => 'Tesis II', 'creditos' => 4],
                    ]
                ]
            ],
            [
                'nombre' => 'Ciencias Agrarias con mención en Agroexportación Sostenible',
                'grado_id' => 2,
                'facultad_id' => 7,
                'descripcion' => 'Maestría en Ciencias Agrarias con mención en Agroexportación Sostenible',
                'semestres' => [
                    1 => [
                        ['nombre' => 'Comercio Internacional de Productos Agrícolas', 'creditos' => 3],
                        ['nombre' => 'Fundamentos de Agroexportación', 'creditos' => 5],
                        ['nombre' => 'Exploración Bibliográfica para la Innovación en Agroexportación', 'creditos' => 4],
                    ],
                    2 => [
                        ['nombre' => 'Análisis de Mercados Internacionales para Productos Agrícolas', 'creditos' => 3],
                        ['nombre' => 'Gestión de Calidad en Agroexportación', 'creditos' => 5],
                        ['nombre' => 'Diseño Estratégico de Proyectos de Investigación en Agroexportación', 'creditos' => 4],
                    ],
                    3 => [
                        ['nombre' => 'Finanzas En El Comercio Internacional De Productos Agrícolas', 'creditos' => 3],
                        ['nombre' => 'Marketing Internacional Para La Agroexportación', 'creditos' => 5],
                        ['nombre' => 'Recopilación Y Gestión De Datos Para Análisis Estadístico En Agroexportación', 'creditos' => 4],
                        ['nombre' => 'Logística Global y Gestión Portuaria para Agroexportación', 'creditos' => 3],
                    ],
                    4 => [
                        ['nombre' => 'Recopilación Y Gestión De Datos Para Análisis Estadístico En Agroexportación', 'creditos' => 4],
                        ['nombre' => 'Procesamiento De Datos Y Redacción De Tesis En Agroexportación Sostenible', 'creditos' => 6],
                        ['nombre' => 'Innovación Tecnológica en la Agroexportación', 'creditos' => 3],
                        ['nombre' => 'Análisis y Remediación de Suelos en Cultivos de Agroexportación', 'creditos' => 3],
                    ]
                ]
            ],
            [
                'nombre' => 'Ciencias con mención en Manejo Integrado de Plagas y Enfermedades',
                'grado_id' => 2,
                'facultad_id' => 7,
                'descripcion' => 'Maestría en Ciencias con mención en Manejo Integrado de Plagas y Enfermedades',
                'semestres' => [
                    1 => [
                        ['nombre' => 'Entomología Avanzada', 'creditos' => 3],
                        ['nombre' => 'Fitopatología Avanzada', 'creditos' => 3],
                        ['nombre' => 'Fisiología y Nutrición de Plantas', 'creditos' => 3],
                        ['nombre' => 'Metodología de la Investigación Científica en MIPE', 'creditos' => 3],
                    ],
                    2 => [
                        ['nombre' => 'Plaguicidas Agrícolas', 'creditos' => 3],
                        ['nombre' => 'Control Biológico de Plagas y Enfermedades', 'creditos' => 3],
                        ['nombre' => 'Acarología Agrícola', 'creditos' => 3],
                        ['nombre' => 'Tesis I', 'creditos' => 3],
                    ],
                    3 => [
                        ['nombre' => 'Evaluación y Diagnóstico de Plagas y Enfermedades', 'creditos' => 3],
                        ['nombre' => 'Nematología Agrícola', 'creditos' => 3],
                        ['nombre' => 'Manejo Integrado de Malezas', 'creditos' => 3],
                        ['nombre' => 'Tesis II', 'creditos' => 4],
                    ],
                    4 => [
                        ['nombre' => 'Manejo Integrado de Enfermedades', 'creditos' => 3],
                        ['nombre' => 'Manejo Integrado de Plagas', 'creditos' => 3],
                        ['nombre' => 'Tesis III', 'creditos' => 5],
                    ]
                ]
            ]
        ];

        foreach ($newProgramsData as $progData) {
            $nombre = $progData['nombre'];
            $this->command->info("Creando nuevo programa: {$nombre}...");

            $targetProgram = Programa::firstOrCreate(
                [
                    'nombre' => $nombre,
                    'grado_id' => $progData['grado_id'],
                    'periodo' => '2026-I',
                ],
                [
                    'facultad_id' => $progData['facultad_id'],
                    'descripcion' => $progData['descripcion'],
                ]
            );

            foreach ($progData['semestres'] as $semNum => $cursosList) {
                $targetSemestre = Semestre::firstOrCreate(
                    [
                        'programa_id' => $targetProgram->id,
                        'numero_semestre' => $semNum,
                    ],
                    [
                        'nombre' => $this->getNombreSemestre($semNum),
                    ]
                );

                $cursoIds = [];

                foreach ($cursosList as $index => $cursoData) {
                    $codigo = sprintf('P%03d-S%d-C%02d', $targetProgram->id, $semNum, $index + 1);

                    // Buscar o crear el curso por su nombre (para reutilizar Tesis I, etc. si el nombre coincide exactamente)
                    // Si se crea nuevo, se usa el código generado
                    $curso = Curso::firstOrCreate(
                        ['nombre' => $cursoData['nombre']],
                        [
                            'codigo' => $codigo,
                            'creditos' => $cursoData['creditos'],
                        ]
                    );

                    $cursoIds[] = $curso->id;
                }

                $targetSemestre->cursos()->sync($cursoIds);
                $this->command->info("  -> Semestre {$semNum} creado y sincronizado con " . count($cursoIds) . " cursos.");
            }
        }

        $this->command->info('✅ Seeder completado exitosamente.');
    }

    /**
     * Obtener el nombre del semestre según el número.
     */
    private function getNombreSemestre(int $numero): string
    {
        $nombres = [
            1 => 'Primer Semestre',
            2 => 'Segundo Semestre',
            3 => 'Tercer Semestre',
            4 => 'Cuarto Semestre',
            5 => 'Quinto Semestre',
            6 => 'Sexto Semestre',
        ];

        return $nombres[$numero] ?? "Semestre $numero";
    }
}
