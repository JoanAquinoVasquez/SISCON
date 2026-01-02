<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Programa;
use App\Models\Semestre;
use App\Models\Curso;

class SegundaEspecialidadSemestreCursoSeeder extends Seeder
{
    public function run(): void
    {
        $especialidades = $this->getSegundasEspecialidades();
        $periodos = ['2024-II', '2025-I'];

        foreach ($especialidades as $especialidadData) {
            // Obtener el primer programa para crear el catálogo de cursos
            // Filtramos por grado_id = 3 (Segunda Especialidad)
            $primerPrograma = Programa::where('nombre', 'LIKE', '%' . $especialidadData['nombre'] . '%')
                ->where('grado_id', 3)
                ->where('periodo', $periodos[0])
                ->first();

            if (!$primerPrograma) {
                $this->command->warn("Programa de Segunda Especialidad no encontrado: {$especialidadData['nombre']}");
                continue;
            }

            $this->command->info("Procesando Segunda Especialidad: {$especialidadData['nombre']}");

            // Crear cursos una sola vez para este programa (catálogo)
            $cursosPorSemestre = [];
            foreach ($especialidadData['semestres'] as $semestreData) {
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
                $programa = Programa::where('nombre', 'LIKE', '%' . $especialidadData['nombre'] . '%')
                    ->where('grado_id', 3)
                    ->where('periodo', $periodo)
                    ->first();

                if (!$programa) {
                    $this->command->warn("Programa no encontrado: {$especialidadData['nombre']} - Periodo: {$periodo}");
                    continue;
                }

                foreach ($especialidadData['semestres'] as $semestreData) {
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

        $this->command->info('✅ Seeder de Segundas Especialidades completado: ' . count($especialidades) . ' programas procesados en ' . count($periodos) . ' periodos');
    }

    private function getNombreSemestre(int $numero): string
    {
        $nombres = [
            1 => 'Primer Semestre',
            2 => 'Segundo Semestre',
            3 => 'Tercer Semestre',
            4 => 'Cuarto Semestre',
        ];

        return $nombres[$numero] ?? "Semestre $numero";
    }

    private function generarCodigoCurso(int $programaId, int $semestre, int $orden): string
    {
        return sprintf('ESP%03d-S%d-C%02d', $programaId, $semestre, $orden);
    }

    private function getSegundasEspecialidades(): array
    {
        return [
            // 1. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DEL CUIDADO A LA PERSONA ESPECIALISTA EN ENFERMERÍA ONCOLÓGICA CON MENCIÓN EN ONCOLOGÍA
            [
                'nombre' => 'Área del cuidado a la Persona Especialista en Enfermería Oncológica con mención en Oncología',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Farmacología en oncología', 'creditos' => 3],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 2],
                            ['nombre' => 'Procedimientos Básicos en Oncología', 'creditos' => 2],
                            ['nombre' => 'Enfermería en la Promoción de la Salud y Prevención del Cáncer', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero en el diagnóstico y tratamiento oncológico', 'creditos' => 10],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 2. SEGUNDA ESPECIALIDAD PROFESIONAL EN EDUCACIÓN AMBIENTAL INTERCULTURAL
            [
                'nombre' => 'Educación Ambiental Intercultural',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Ecología y Educación Ambiental Intercultural', 'creditos' => 4],
                            ['nombre' => 'Gestión de Recursos Naturales', 'creditos' => 4],
                            ['nombre' => 'Gestión de Riesgos Ambientales', 'creditos' => 4],
                            ['nombre' => 'Toxicología y Química Ambiental', 'creditos' => 4],
                            ['nombre' => 'Planificación de la Investigación e innovación en Educación Ambiental Intercultural', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Sistema de Gestión Ambiental', 'creditos' => 4],
                            ['nombre' => 'Didáctica de la Educación Ambiental Intercultural', 'creditos' => 4],
                            ['nombre' => 'Gestión de la Educación Ambiental Intercultural', 'creditos' => 4],
                            ['nombre' => 'Manejo de Problemas y Conflictos Ambientales Comunitarios', 'creditos' => 4],
                            ['nombre' => 'Desarrollo de la Investigación e Innovación en Educación Ambiental Intercultural', 'creditos' => 4],
                        ]
                    ],
                ]
            ],

            // 3. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DEL CUIDADO A LA PERSONA ENFERMERA ESPECIALISTA EN CUIDADOS CRÍTICOS CON MENCIÓN EN ADULTO
            [
                'nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Cuidados Críticos con mención en Adulto',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 3],
                            ['nombre' => 'Farmacología en cuidados intensivos', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero a personas en estado crítico', 'creditos' => 10],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero a personas en estado crítico con tratamiento quirúrgico', 'creditos' => 10],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 4. SEGUNDA ESPECIALIDAD PROFESIONAL EN GESTIÓN AMBIENTAL
            [
                'nombre' => 'Gestión Ambiental',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Ecología y Desarrollo Sostenible', 'creditos' => 4],
                            ['nombre' => 'Formulación de Proyectos de Investigación en Gestión Ambiental', 'creditos' => 4],
                            ['nombre' => 'Toxicología y Química Ambiental', 'creditos' => 4],
                            ['nombre' => 'Política y Legislación Medio Ambiental', 'creditos' => 4],
                            ['nombre' => 'Higiene y Seguridad Ambiental', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Sistema de Gestión Ambiental', 'creditos' => 4],
                            ['nombre' => 'Evaluación de Impactos Ambientales', 'creditos' => 4],
                            ['nombre' => 'Sistemas Integrados de Gestión', 'creditos' => 4],
                            ['nombre' => 'Desarrollo de Investigación en Gestión Ambiental', 'creditos' => 4],
                            ['nombre' => 'Resolución de Conflictos Socio Ambientales', 'creditos' => 4],
                        ]
                    ],
                ]
            ],

            // 5. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DEL CUIDADO A LA PERSONA ENFERMERA ESPECIALISTA EN CUIDADO INTEGRAL INFANTIL CON MENCIÓN EN CRECIMIENTO Y DESARROLLO
            [
                'nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Cuidado Integral Infantil con Mención en Crecimiento y Desarrollo',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero en el crecimiento y desarrollo del neonato y lactante', 'creditos' => 11],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero en el crecimiento y desarrollo del Pre Escolar, Escolar y Adolescente', 'creditos' => 12],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 6. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA ORGANIZACIONAL Y DE GESTIÓN ENFERMERA ESPECIALISTA EN ADMINISTRACIÓN Y GERENCIA EN SALUD CON MENCIÓN EN GESTIÓN DE LA CALIDAD
            [
                'nombre' => 'Área Organizacional y de Gestión Enfermera Especialista en Administración y Gerencia en Salud con mención en Gestión de la Calidad',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Bases conceptuales y normativas de la administración y gerencia en salud', 'creditos' => 12],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Gestión estratégica de los servicios de salud y enfermería', 'creditos' => 13],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 7. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DEL CUIDADO A LA PERSONA ESPECIALISTA EN ENFERMERÍA PEDIÁTRICA Y NEONATOLOGÍA CON MENCIÓN EN PEDIATRÍA
            [
                'nombre' => 'Área del Cuidado a la Persona Especialista en Enfermería Pediátrica Y Neonatología con mención en Pediatría',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 3],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero al niño y adolescente con problemas de salud', 'creditos' => 11],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero al niño y adolescente en situación de emergencia', 'creditos' => 11],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 8. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DEL CUIDADO A LA PERSONA ENFERMERA ESPECIALISTA EN CUIDADOS CRÍTICOS CON MENCIÓN EN NEONATOLOGÍA
            [
                'nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Cuidados Críticos con mención en Neonatología',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 3],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                            ['nombre' => 'Gestión del cuidado enfermero al neonato en cuidados intermedios', 'creditos' => 6],
                            ['nombre' => 'Gestión del cuidado enfermero en la colocación del catéter venoso central y periférico', 'creditos' => 2],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión del cuidado enfermero al neonato en estado de emergencia', 'creditos' => 5],
                            ['nombre' => 'Gestión del cuidado enfermero al neonato en cuidados intensivos', 'creditos' => 10],
                            ['nombre' => 'RCP Neonatal', 'creditos' => 2],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 9. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DEL CUIDADO A LA PERSONA ENFERMERA ESPECIALISTA EN GASTROENTEROLOGÍA Y PROCEDIMIENTOS ENDOSCÓPICOS CON MENCIÓN EN PROCEDIMIENTOS ENDOSCÓPICOS
            [
                'nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Gastroenterología y Procedimientos Endoscópicos con mención En Procedimientos Endoscópicos',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 3],
                            ['nombre' => 'Gestión del cuidado enfermero en la persona con problemas gastroenterológicos', 'creditos' => 10],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Farmacología en gastroenterología', 'creditos' => 2],
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión del cuidado enfermero en la persona con procedimientos gastroenterológicos', 'creditos' => 10],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 10. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DEL CUIDADO A LA PERSONA ENFERMERA ESPECIALISTA EN EMERGENCIA Y DESASTRES CON MENCIÓN EN CUIDADOS HOSPITALARIOS
            [
                'nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Emergencia y Desastres con mención en Cuidados Hospitalarios',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero en emergencia y desastres en escenario prehospitalario', 'creditos' => 10],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Farmacología en emergencia', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero en emergencia y desastres en escenario hospitalario', 'creditos' => 12],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 11. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DEL CUIDADO A LA PERSONA ESPECIALISTA EN ENFERMERÍA NEFROLÓGICA Y UROLÓGICA CON MENCIÓN EN DIÁLISIS
            [
                'nombre' => 'Área del cuidado a la Persona Especialista en Enfermería Nefrológica y Urológica con mención en Diálisis',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 2],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Farmacología nefrología', 'creditos' => 3],
                            ['nombre' => 'Gestión del cuidado enfermero a personas con problemas nefrológicos y urológicos relacionados con tratamiento dialítico', 'creditos' => 10],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero a personas con tratamiento dialítico y trasplante renal', 'creditos' => 10],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 12. SEGUNDA ESPECIALIDAD PROFESIONAL EN MICROBIOLOGÍA CLÍNICA
            [
                'nombre' => 'Microbiología Clínica',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Bioseguridad y gestión de la calidad en el laboratorio de microbiología clínica', 'creditos' => 3],
                            ['nombre' => 'Investigación en microbiología', 'creditos' => 3],
                            ['nombre' => 'Bioinformática', 'creditos' => 1],
                            ['nombre' => 'Inmunomicrobiología', 'creditos' => 3],
                            ['nombre' => 'Infectología', 'creditos' => 3],
                            ['nombre' => 'Clínica microbiológica I', 'creditos' => 7],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Bacteriología clínica', 'creditos' => 3],
                            ['nombre' => 'Virología clínica', 'creditos' => 3],
                            ['nombre' => 'Parasitología clínica', 'creditos' => 3],
                            ['nombre' => 'Micología clínica', 'creditos' => 3],
                            ['nombre' => 'Técnicas moleculares en el diagnóstico microbiológico', 'creditos' => 2],
                            ['nombre' => 'Clínica microbiológica II', 'creditos' => 8],
                        ]
                    ],
                ]
            ],
            // 13. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DE SALUD PÚBLICA Y COMUNITARIA ENFERMERA ESPECIALISTA EN SALUD PÚBLICA CON MENCIÓN EN SALUD FAMILIAR
            [
                'nombre' => 'Área de Salud Pública y Comunitaria Enfermera Especialista en Salud Pública con mención en Salud Familiar',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 2],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero en la persona', 'creditos' => 7],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero en la familia', 'creditos' => 7],
                            ['nombre' => 'Gestión del cuidado enfermero en salud comunitaria', 'creditos' => 7],
                            ['nombre' => 'Proyectos de Inversión en salud', 'creditos' => 2],
                            ['nombre' => 'Comunicación de la Investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],

            // 14. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DE SALUD PÚBLICA Y COMUNITARIA ENFERMERA ESPECIALISTA EN SALUD OCUPACIONAL CON MENCIÓN EN SALUD OCUPACIONAL
            [
                'nombre' => 'Área de Salud Pública y Comunitaria Enfermera Especialista en Salud Ocupacional con mención en Salud Ocupacional',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 2],
                            ['nombre' => 'Legislación y ética en Salud ocupacional', 'creditos' => 3],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Seguridad y Salud Ocupacional', 'creditos' => 10],
                            ['nombre' => 'Gerencia', 'creditos' => 10],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],
            // 15. SEGUNDA ESPECIALIDAD PROFESIONAL EN ÁREA DEL CUIDADO A LA PERSONA ENFERMERA ESPECIALISTA EN CENTRO QUIRÚRGICO ESPECIALIZADO CON MENCIÓN EN CENTRO QUIRÚRGICO
            [
                'nombre' => 'Área del Cuidado a la Persona Enfermera Especialista en Centro Quirúrgico Especializado con mención en Centro Quirúrgico',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Filosofía y metodología del cuidado enfermero', 'creditos' => 2],
                            ['nombre' => 'Gestión de la información', 'creditos' => 2],
                            ['nombre' => 'Farmacología en centro quirúrgico', 'creditos' => 2],
                            ['nombre' => 'Gestión del cuidado enfermero en el propietario', 'creditos' => 10],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo interpersonal', 'creditos' => 3],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 2],
                            ['nombre' => 'Cuidado enfermero en la sala de recuperación post anestésica', 'creditos' => 1],
                            ['nombre' => 'Gestión del cuidado enfermero en centro quirúrgico en cirugía de especialidades', 'creditos' => 12],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 2],
                        ]
                    ],
                ]
            ],
        ];
    }
}
