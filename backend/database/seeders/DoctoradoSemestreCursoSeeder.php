<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Programa;
use App\Models\Semestre;
use App\Models\Curso;

class DoctoradoSemestreCursoSeeder extends Seeder
{
    public function run(): void
    {
        $doctorados = $this->getDoctorados();
        $periodos = ['2024-II', '2025-I'];

        foreach ($doctorados as $doctoradoData) {
            // Obtener el primer programa para crear el catálogo de cursos
            // Filtramos por grado_id = 1 (Doctorado) para evitar confusiones con Maestrías
            $primerPrograma = Programa::where('nombre', 'LIKE', '%' . $doctoradoData['nombre'] . '%')
                ->where('grado_id', 1)
                ->where('periodo', $periodos[0])
                ->first();

            if (!$primerPrograma) {
                $this->command->warn("Programa de Doctorado no encontrado: {$doctoradoData['nombre']}");
                continue;
            }

            $this->command->info("Procesando Doctorado: {$doctoradoData['nombre']}");

            // Crear cursos una sola vez para este programa (catálogo)
            $cursosPorSemestre = [];
            foreach ($doctoradoData['semestres'] as $semestreData) {
                $cursosPorSemestre[$semestreData['numero']] = [];

                foreach ($semestreData['cursos'] as $index => $cursoData) {
                    $codigo = $this->generarCodigoCurso($primerPrograma->id, $semestreData['numero'], $index + 1);

                    // Crear curso una sola vez (sin duplicados)
                    $curso = Curso::firstOrCreate(
                        ['codigo' => $codigo],
                        [
                            'nombre' => $cursoData['nombre'],
                            'creditos' => $cursoData['creditos'],
                        ]
                    );

                    $cursosPorSemestre[$semestreData['numero']][] = $curso->id;
                }
            }

            // Asociar cursos a semestres de todos los periodos
            foreach ($periodos as $periodo) {
                $programa = Programa::where('nombre', 'LIKE', '%' . $doctoradoData['nombre'] . '%')
                    ->where('grado_id', 1)
                    ->where('periodo', $periodo)
                    ->first();

                if (!$programa) {
                    $this->command->warn("Programa no encontrado: {$doctoradoData['nombre']} - Periodo: {$periodo}");
                    continue;
                }

                foreach ($doctoradoData['semestres'] as $semestreData) {
                    // Crear semestre o restaurar si existe
                    $semestre = Semestre::withTrashed()
                        ->where('programa_id', $programa->id)
                        ->where('numero_semestre', $semestreData['numero'])
                        ->first();

                    if ($semestre) {
                        if ($semestre->trashed()) {
                            $semestre->restore();
                        }
                    } else {
                        $semestre = Semestre::create([
                            'programa_id' => $programa->id,
                            'numero_semestre' => $semestreData['numero'],
                            'nombre' => $this->getNombreSemestre($semestreData['numero']),
                        ]);
                    }

                    // Asociar cursos al semestre mediante la tabla pivote
                    $semestre->cursos()->sync($cursosPorSemestre[$semestreData['numero']]);

                    $this->command->info("  - {$periodo} - Semestre {$semestreData['numero']}: " . count($cursosPorSemestre[$semestreData['numero']]) . " cursos asociados");
                }
            }
        }

        $this->command->info('✅ Seeder de Doctorados completado: ' . count($doctorados) . ' programas procesados en ' . count($periodos) . ' periodos');
    }

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

    private function generarCodigoCurso(int $programaId, int $semestre, int $orden): string
    {
        return sprintf('DOC%03d-S%d-C%02d', $programaId, $semestre, $orden);
    }

    private function getDoctorados(): array
    {
        return [
            // 1. DOCTORADO EN CIENCIAS AMBIENTALES
            [
                'nombre' => 'Ciencias Ambientales',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Proyectos de inversión pública y privada', 'creditos' => 4],
                            ['nombre' => 'Cambio climático', 'creditos' => 4],
                            ['nombre' => 'Gestores de bases de datos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Conflictos ambientales y enfoque ecosistémico', 'creditos' => 4],
                            ['nombre' => 'Investigación cualitativa', 'creditos' => 4],
                            ['nombre' => 'El estado del arte', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Estadística para la investigación', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 8],
                            ['nombre' => 'Seguridad y salud en el trabajo', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Restauración ecológica', 'creditos' => 4],
                            ['nombre' => 'Fundamentación teórica de la investigación', 'creditos' => 3],
                            ['nombre' => 'Recolección y procesamiento de datos', 'creditos' => 6],
                        ]
                    ],
                    [
                        'numero' => 5,
                        'cursos' => [
                            ['nombre' => 'Diseño y fundamentación de la propuesta de investigación', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 6,
                        'cursos' => [
                            ['nombre' => 'Informe de tesis y articulo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 2. DOCTORADO EN ADMINISTRACIÓN
            [
                'nombre' => 'Administración',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Corrientes filosóficas de la administración', 'creditos' => 4],
                            ['nombre' => 'Investigación en áreas funcionales y estratégicas de la administración', 'creditos' => 4],
                            ['nombre' => 'Gestores de bases de datos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Investigación en sectores económicos y la administración', 'creditos' => 4],
                            ['nombre' => 'El estado del arte', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Estadística para la investigación', 'creditos' => 4],
                            ['nombre' => 'Investigación cualitativa', 'creditos' => 4],
                            ['nombre' => 'Prospectiva y tendencias de investigación en administración', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Diseños y metodologías de investigación en administración', 'creditos' => 4],
                            ['nombre' => 'Fundamentación teórica de la investigación', 'creditos' => 4],
                            ['nombre' => 'Procesamiento y análisis de datos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 5,
                        'cursos' => [
                            ['nombre' => 'Diseño y fundamentación de la propuesta de investigación', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 6,
                        'cursos' => [
                            ['nombre' => 'Informe de tesis y articulo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 3. DOCTORADO EN CIENCIAS DE LA EDUCACIÓN
            [
                'nombre' => 'Ciencias de la Educación',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Modelos de formación del talento humano', 'creditos' => 4],
                            ['nombre' => 'Diseños curriculares transdisciplinarios', 'creditos' => 4],
                            ['nombre' => 'Gestores de base de datos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Diseño didáctico', 'creditos' => 4],
                            ['nombre' => 'El estado del arte', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Investigación cualitativa', 'creditos' => 4],
                            ['nombre' => 'Estadística para la investigación', 'creditos' => 4],
                            ['nombre' => 'Evaluación curricular y de los aprendizajes', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Modelos de gestión institucional', 'creditos' => 4],
                            ['nombre' => 'Fundamentación teórica de la investigación', 'creditos' => 4],
                            ['nombre' => 'Recolección y procesamiento de datos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 5,
                        'cursos' => [
                            ['nombre' => 'Innovación educativa', 'creditos' => 4],
                            ['nombre' => 'Diseño y fundamentación de la propuesta de investigación', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 6,
                        'cursos' => [
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 4. DOCTORADO EN CIENCIAS DE LA INGENIERÍA MECÁNICA Y ELÉCTRICA CON MENCIÓN EN ENERGÍA
            [
                'nombre' => 'Ciencias de la Ingeniería Mecánica y Eléctrica con mención en Energía',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Epistemología y metodología de la investigación', 'creditos' => 4],
                            ['nombre' => 'Energía, ambiente y sostenibilidad', 'creditos' => 4],
                            ['nombre' => 'Sistemas y procesos energéticos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Elementos finitos en el diseño energético', 'creditos' => 4],
                            ['nombre' => 'Ingeniería del gas natural', 'creditos' => 4],
                            ['nombre' => 'Termoeconomía', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Uso eficiente de la energía', 'creditos' => 4],
                            ['nombre' => 'Métodos experimentales en ingeniería', 'creditos' => 4],
                            ['nombre' => 'Trabajo de investigación I', 'creditos' => 6],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Seminario tesis I', 'creditos' => 4],
                            ['nombre' => 'Trabajo de investigación II', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 5,
                        'cursos' => [
                            ['nombre' => 'Seminario tesis II', 'creditos' => 4],
                            ['nombre' => 'Trabajo de investigación III', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 6,
                        'cursos' => [
                            ['nombre' => 'Seminario tesis III', 'creditos' => 4],
                            ['nombre' => 'Trabajo de investigación IV', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 5. DOCTORADO EN TERRITORIO Y URBANISMO SOSTENIBLE
            [
                'nombre' => 'Territorio y Urbanismo Sostenible',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Epistemología de la ciencia, el territorio y la sostenibilidad', 'creditos' => 4],
                            ['nombre' => 'Ordenamiento territorial de los ecosistemas', 'creditos' => 4],
                            ['nombre' => 'Gestores de bases de datos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Planificación urbana territorial', 'creditos' => 4],
                            ['nombre' => 'El estado del arte', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Investigación cualitativa', 'creditos' => 4],
                            ['nombre' => 'Estadística para la investigación', 'creditos' => 4],
                            ['nombre' => 'Economía urbana territorial y medio ambiente', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Dinámicas territoriales y gestión del suelo', 'creditos' => 4],
                            ['nombre' => 'Fundamentación teórica de la investigación', 'creditos' => 4],
                            ['nombre' => 'Procesamiento y análisis de datos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 5,
                        'cursos' => [
                            ['nombre' => 'Legislación y ética urbano ambiental', 'creditos' => 4],
                            ['nombre' => 'Diseño y fundamentación de la propuesta de investigación', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 6,
                        'cursos' => [
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 6. DOCTORADO EN DERECHO Y CIENCIA POLÍTICA
            [
                'nombre' => 'Derecho y Ciencia Política',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Gestores de bases de datos y estado del arte', 'creditos' => 4],
                            ['nombre' => 'Seminario de teoría del estado, gobierno y sociedad', 'creditos' => 4],
                            ['nombre' => 'Seminario de teoría general del derecho', 'creditos' => 4],
                            ['nombre' => 'Seminario de filosofía del derecho', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Investigación cualitativa y cuantitativa', 'creditos' => 4],
                            ['nombre' => 'Seminario de derecho constitucional', 'creditos' => 4],
                            ['nombre' => 'Seminario de derecho civil', 'creditos' => 4],
                            ['nombre' => 'Seminario de Derecho penal', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                            ['nombre' => 'Seminario de ciencia política', 'creditos' => 4],
                            ['nombre' => 'Seminario de derecho procesal civil', 'creditos' => 4],
                            ['nombre' => 'Seminario de derecho procesal penal', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Fundamentación teórica de la investigación', 'creditos' => 4],
                            ['nombre' => 'Procesamiento y análisis de datos', 'creditos' => 4],
                            ['nombre' => 'Seminario de derecho procesal constitucional', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 5,
                        'cursos' => [
                            ['nombre' => 'Diseño y Fundamentación de la propuesta de Investigación', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 6,
                        'cursos' => [
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 7. DOCTORADO EN CIENCIAS DE ENFERMERÍA
            [
                'nombre' => 'Ciencias de Enfermería',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Saberes en enfermería', 'creditos' => 6],
                            ['nombre' => 'Ética y bioética en enfermería', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Liderazgo en enfermería', 'creditos' => 3],
                            ['nombre' => 'Docencia en enfermería', 'creditos' => 6],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Gestión de la información', 'creditos' => 4],
                            ['nombre' => 'Gestión de la calidad en la docencia universitaria', 'creditos' => 5],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 12],
                        ]
                    ],
                    [
                        'numero' => 5,
                        'cursos' => [
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 12],
                        ]
                    ],
                    [
                        'numero' => 6,
                        'cursos' => [
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 12],
                        ]
                    ],
                ]
            ],

            // 8. DOCTORADO EN SOCIOLOGÍA
            [
                'nombre' => 'Sociología',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Igualdad e inclusión social', 'creditos' => 4],
                            ['nombre' => 'Transformaciones sociales en el mundo Contemporáneo', 'creditos' => 4],
                            ['nombre' => 'Gestores de base de datos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Procesos decisorios y sistemas de información', 'creditos' => 4],
                            ['nombre' => 'El estado del arte', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Investigación cualitativa', 'creditos' => 4],
                            ['nombre' => 'Fundamentación teórica de la investigación', 'creditos' => 4],
                            ['nombre' => 'Desarrollo tecnológico y cambio social', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Desarrollo sostenible y medio ambiente', 'creditos' => 4],
                            ['nombre' => 'Estadística aplicada a las ciencias sociales', 'creditos' => 4],
                            ['nombre' => 'Procesamiento y análisis de datos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 5,
                        'cursos' => [
                            ['nombre' => 'Sociedad y nuevos contratos sociales', 'creditos' => 4],
                            ['nombre' => 'Diseño y fundamentación de la propuesta', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 6,
                        'cursos' => [
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],
        ];
    }
}
