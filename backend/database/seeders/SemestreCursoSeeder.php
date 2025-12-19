<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Programa;
use App\Models\Semestre;
use App\Models\Curso;

class SemestreCursoSeeder extends Seeder
{
    public function run(): void
    {
        $maestrias = $this->getMaestrias();

        foreach ($maestrias as $maestriaData) {
            $programa = Programa::where('nombre', 'LIKE', '%' . $maestriaData['nombre'] . '%')
                ->where('periodo', '2024-II')
                ->first();

            if (!$programa) {
                $this->command->warn("Programa no encontrado: {$maestriaData['nombre']}");
                continue;
            }

            $this->command->info("Procesando: {$programa->nombre}");

            foreach ($maestriaData['semestres'] as $semestreData) {
                // Crear semestre con nombre
                $semestre = Semestre::create([
                    'programa_id' => $programa->id,
                    'numero_semestre' => $semestreData['numero'],
                    'nombre' => $this->getNombreSemestre($semestreData['numero']),
                ]);

                foreach ($semestreData['cursos'] as $index => $cursoData) {
                    Curso::create([
                        'semestre_id' => $semestre->id,
                        'nombre' => $cursoData['nombre'],
                        'codigo' => $this->generarCodigoCurso($programa->id, $semestreData['numero'], $index + 1),
                        'creditos' => $cursoData['creditos'],
                    ]);
                }

                $this->command->info("  - Semestre {$semestreData['numero']}: " . count($semestreData['cursos']) . " cursos");
            }
        }

        $this->command->info('✅ Seeder completado: ' . count($maestrias) . ' maestrías procesadas');
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
        return sprintf('P%03d-S%d-C%02d', $programaId, $semestre, $orden);
    }

    private function getMaestrias(): array
    {
        return [
            // 1. MAESTRÍA EN CIENCIAS CON MENCIÓN EN INGENIERÍA HIDRÁULICA
            [
                'nombre' => 'Ciencias con mención en Ingeniería Hidráulica',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Mecánica de fluidos avanzada', 'creditos' => 4],
                            ['nombre' => 'Hidrología avanzada', 'creditos' => 4],
                            ['nombre' => 'Hidráulica fluvial', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Embalses y presas', 'creditos' => 4],
                            ['nombre' => 'Taller de obras hidráulicas', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Modelación y automatización hidráulica', 'creditos' => 4],
                            ['nombre' => 'Estudios de impacto ambiental de obras hidráulicas', 'creditos' => 4],
                            ['nombre' => 'Informe de tesis', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 2. MAESTRÍA EN INGENIERÍA DE SISTEMAS
            [
                'nombre' => 'Ingeniería de Sistemas con Mención en Gerencia de Tecnologías de la Información y Gestión del Software',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Gestión empresarial y transformación digital', 'creditos' => 4],
                            ['nombre' => 'Calidad y seguridad de sistemas de información', 'creditos' => 4],
                            ['nombre' => 'Gobierno de datos', 'creditos' => 2],
                            ['nombre' => 'Cloud computing', 'creditos' => 2],
                            ['nombre' => 'Metodología de la investigación', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Gobierno de tecnologías de la información', 'creditos' => 3],
                            ['nombre' => 'Big data y business intelligence', 'creditos' => 3],
                            ['nombre' => 'Integración empresarial de sistemas de información', 'creditos' => 3],
                            ['nombre' => 'Evaluación financiera de proyectos de tecnologías de la información', 'creditos' => 3],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Gestión de proyectos de base tecnológica y factorías de software', 'creditos' => 4],
                            ['nombre' => 'Servicios profesionales de tecnologías de la información', 'creditos' => 4],
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 3. MAESTRÍA EN GESTIÓN INTEGRADA DE LOS RECURSOS HÍDRICOS
            [
                'nombre' => 'Gestión Integrada de los Recursos Hídricos',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Gestión integrada del agua', 'creditos' => 4],
                            ['nombre' => 'Pluralismo legal y gobernabilidad del agua', 'creditos' => 4],
                            ['nombre' => 'Metodología de promoción y fortalecimiento de la gestión', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Economía del agua', 'creditos' => 4],
                            ['nombre' => 'Gestión sectorial y multisectorial del agua', 'creditos' => 4],
                            ['nombre' => 'Gestión de los recursos naturales', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Gestión y manejo de cuencas hidrográficas', 'creditos' => 4],
                            ['nombre' => 'Gestión ambiental', 'creditos' => 4],
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 4. MAESTRÍA EN CIENCIAS CON MENCIÓN EN ORDENAMIENTO TERRITORIAL Y DESARROLLO URBANO
            [
                'nombre' => 'Ciencias con mención en Ordenamiento Territorial y Desarrollo Urbano',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Teoría del desarrollo sostenible', 'creditos' => 4],
                            ['nombre' => 'Ordenamiento territorial y desarrollo urbano', 'creditos' => 4],
                            ['nombre' => 'Planificación urbana sostenible', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Economía regional urbana, competitividad y marketing', 'creditos' => 4],
                            ['nombre' => 'Evaluación de los impactos ambientales y prevención de riesgos', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Gestión de servicios urbanos', 'creditos' => 4],
                            ['nombre' => 'Gestión del suelo urbano', 'creditos' => 4],
                            ['nombre' => 'Informe de tesis', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 5. MAESTRÍA EN CIENCIAS CON MENCIÓN EN INGENIERÍA DE PROCESOS INDUSTRIALES
            [
                'nombre' => 'Ciencias con mención en Ingeniería de Procesos Industriales',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Análisis y transporte de fluidos', 'creditos' => 4],
                            ['nombre' => 'Operaciones y procesos de transferencia de masa y calor', 'creditos' => 4],
                            ['nombre' => 'Tratamiento de residuos y subproductos industriales', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Economía de los procesos', 'creditos' => 4],
                            ['nombre' => 'Modelamiento y simulación de procesos', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Instrumentación y control de procesos industriales', 'creditos' => 4],
                            ['nombre' => 'Diseño y optimización de plantas de procesos', 'creditos' => 4],
                            ['nombre' => 'Informe de Tesis', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 6. MAESTRÍA EN DERECHO CON MENCIÓN EN DERECHO PENAL Y PROCESAL PENAL
            [
                'nombre' => 'Derecho con mención en Derecho Penal y Procesal Penal',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Principios del derecho penal', 'creditos' => 3],
                            ['nombre' => 'Derecho penal general I', 'creditos' => 3],
                            ['nombre' => 'Derecho penal general II', 'creditos' => 3],
                            ['nombre' => 'Metodología de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Derecho penal especial I', 'creditos' => 3],
                            ['nombre' => 'Derecho penal especial II', 'creditos' => 3],
                            ['nombre' => 'Derecho procesal penal I', 'creditos' => 3],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Derecho penal especial III', 'creditos' => 3],
                            ['nombre' => 'Derecho penal especial IV', 'creditos' => 3],
                            ['nombre' => 'Derecho procesal penal II', 'creditos' => 3],
                            ['nombre' => 'Seminario de tesis', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Derecho procesal penal III', 'creditos' => 3],
                            ['nombre' => 'Precedentes penales vinculantes', 'creditos' => 3],
                            ['nombre' => 'Filosofía del derecho', 'creditos' => 3],
                            ['nombre' => 'Informe de tesis', 'creditos' => 3],
                        ]
                    ],
                ]
            ],

            // 7. MAESTRÍA EN CIENCIAS SOCIALES CON MENCIÓN EN GESTIÓN PÚBLICA Y GERENCIA SOCIAL
            [
                'nombre' => 'Ciencias Sociales con mención en Gestión Pública y Gerencia Social',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Diseño y gestión de programas de desarrollo', 'creditos' => 4],
                            ['nombre' => 'Planificación estratégica y operativa', 'creditos' => 4],
                            ['nombre' => 'Incidencia social y gestión de medios', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Gestión de políticas públicas y privadas', 'creditos' => 4],
                            ['nombre' => 'Competencias gerenciales inclusivas', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Monitoreo y evaluación de impacto', 'creditos' => 4],
                            ['nombre' => 'Investigación en políticas públicas', 'creditos' => 4],
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 8. MAESTRÍA EN DERECHO CON MENCIÓN EN DERECHO CONSTITUCIONAL Y PROCESAL CONSTITUCIONAL
            [
                'nombre' => 'Derecho con mención en Derecho Constitucional y Procesal Constitucional',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Teoría del estado constitucional', 'creditos' => 3],
                            ['nombre' => 'Interpretación constitucional', 'creditos' => 3],
                            ['nombre' => 'Procesos constitucionales de tutela de derechos', 'creditos' => 3],
                            ['nombre' => 'Metodología de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Teoría de los derechos fundamentales', 'creditos' => 3],
                            ['nombre' => 'Derechos civiles y políticos', 'creditos' => 3],
                            ['nombre' => 'Procesos constitucionales de control normativo', 'creditos' => 3],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Derechos económicos, sociales y culturales', 'creditos' => 3],
                            ['nombre' => 'Sistemas de protección de derechos humanos', 'creditos' => 3],
                            ['nombre' => 'Precedente constitucional vinculante', 'creditos' => 3],
                            ['nombre' => 'Seminario de tesis', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Derecho constitucional comparado', 'creditos' => 3],
                            ['nombre' => 'Derecho constitucional económico', 'creditos' => 3],
                            ['nombre' => 'Control de convencionalidad', 'creditos' => 3],
                            ['nombre' => 'Informe de tesis', 'creditos' => 3],
                        ]
                    ],
                ]
            ],

            // 9. MAESTRÍA EN CIENCIAS DE LA EDUCACIÓN CON MENCIÓN EN DOCENCIA Y GESTIÓN UNIVERSITARIA
            [
                'nombre' => 'Ciencias de la Educación con mención en Docencia y Gestión Universitaria',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'La educación superior y los procesos formativos', 'creditos' => 4],
                            ['nombre' => 'Estrategias docentes en el aula universitaria, sus metodologías', 'creditos' => 4],
                            ['nombre' => 'Evaluación de los aprendizajes en el contexto universitario', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Herramientas y recursos tecnológicos para la enseñanza aprendizaje', 'creditos' => 4],
                            ['nombre' => 'Gestión de responsabilidad social universitaria', 'creditos' => 4],
                            ['nombre' => 'Evaluación de la gestión curricular universitaria', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Gestión de la calidad educativa', 'creditos' => 4],
                            ['nombre' => 'Planificación y gestión de la educación', 'creditos' => 4],
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 10. MAESTRÍA EN CIENCIAS DE LA EDUCACIÓN CON MENCIÓN EN INVESTIGACIÓN Y DOCENCIA
            [
                'nombre' => 'Ciencias de la Educación con mención en Investigación y Docencia',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Diseño curricular', 'creditos' => 4],
                            ['nombre' => 'Planificación de la enseñanza universitaria', 'creditos' => 4],
                            ['nombre' => 'Enfoques y modelos didácticos', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Evaluación y calidad educativa', 'creditos' => 4],
                            ['nombre' => 'Didáctica de la educación superior', 'creditos' => 4],
                            ['nombre' => 'Estado del arte y proyecto de tesis', 'creditos' => 4],
                            ['nombre' => 'Estadística para la investigación', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Procesamiento y análisis de datos', 'creditos' => 4],
                            ['nombre' => 'Análisis de artículos científicos', 'creditos' => 4],
                            ['nombre' => 'Informe final y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 11. MAESTRÍA EN CIENCIAS DE LA EDUCACIÓN CON MENCIÓN EN DIDÁCTICA DEL IDIOMA INGLÉS
            [
                'nombre' => 'Ciencias de la Educación con mención en Didáctica del Idioma Inglés',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Second language acquisition and the learner', 'creditos' => 4],
                            ['nombre' => 'Contemporary foundations in TEFL', 'creditos' => 4],
                            ['nombre' => 'Methodological approaches and resources in TEFL', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'EFL evaluation', 'creditos' => 4],
                            ['nombre' => 'Assessing and testing in an EFL class', 'creditos' => 4],
                            ['nombre' => 'EFL methodology: language skills', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'TEFL methodology: language system', 'creditos' => 4],
                            ['nombre' => 'Innovation in TEFL', 'creditos' => 4],
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 12. MAESTRÍA EN DERECHO CON MENCIÓN EN CIVIL Y COMERCIAL
            [
                'nombre' => 'Derecho con mención en Civil y Comercial',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Acto jurídico', 'creditos' => 3],
                            ['nombre' => 'Derechos reales', 'creditos' => 3],
                            ['nombre' => 'Derecho de familia', 'creditos' => 3],
                            ['nombre' => 'Metodología de la investigación', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Contratos y obligaciones', 'creditos' => 3],
                            ['nombre' => 'Responsabilidad civil', 'creditos' => 3],
                            ['nombre' => 'Análisis económico del derecho', 'creditos' => 3],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Derecho societario', 'creditos' => 3],
                            ['nombre' => 'Derecho cambiario', 'creditos' => 3],
                            ['nombre' => 'Contratos empresariales', 'creditos' => 3],
                            ['nombre' => 'Seminario de tesis', 'creditos' => 3],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Filosofía del derecho', 'creditos' => 3],
                            ['nombre' => 'Derecho procesal civil', 'creditos' => 3],
                            ['nombre' => 'Derecho del comercio internacional', 'creditos' => 3],
                            ['nombre' => 'Informe de tesis', 'creditos' => 3],
                        ]
                    ],
                ]
            ],

            // 13. MAESTRÍA EN CIENCIAS DE LA EDUCACIÓN CON MENCIÓN EN TIC E INFORMÁTICA EDUCATIVA
            [
                'nombre' => 'Ciencias de la Educación con mención en Tecnologías de la Información e Informática Educativa',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Las TIC en el proceso de enseñanza aprendizaje', 'creditos' => 4],
                            ['nombre' => 'Pedagogía y didáctica con las TIC', 'creditos' => 4],
                            ['nombre' => 'Software educativo y herramientas web', 'creditos' => 4],
                            ['nombre' => 'Plataformas virtuales en el proceso de enseñanza aprendizaje', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Las TIC en la gestión educativa', 'creditos' => 4],
                            ['nombre' => 'Políticas y gestión de las TIC en los centros de educación', 'creditos' => 4],
                            ['nombre' => 'Gestión de centros para la enseñanza asistida por tecnologías', 'creditos' => 4],
                            ['nombre' => 'Tendencias en la gestión de centros de enseñanza con TIC', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 3],
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 3],
                        ]
                    ],
                ]
            ],

            // 14. MAESTRÍA EN GERENCIA DE OBRAS Y CONSTRUCCIÓN
            [
                'nombre' => 'Gerencia de Obras y Construcción',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Gerencia estratégica de recursos de la construcción', 'creditos' => 4],
                            ['nombre' => 'Sistema de información gerencial en obras de Ingeniería civil', 'creditos' => 4],
                            ['nombre' => 'Planificación, organización y construcción de obras de edificaciones', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Planificación, organización y construcción de obras de transportes', 'creditos' => 4],
                            ['nombre' => 'Gerencia de operaciones y logística en obras de Ingeniería civil', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Estudio de impacto ambiental en obras de ingeniería civil', 'creditos' => 4],
                            ['nombre' => 'Proyectos de inversión en obras de ingeniería civil', 'creditos' => 4],
                            ['nombre' => 'Informe de tesis', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 15. MAESTRÍA EN CIENCIAS DE LA EDUCACIÓN CON MENCIÓN EN GERENCIA EDUCATIVA ESTRATÉGICA
            [
                'nombre' => 'Ciencias de la Educación con mención en Gerencia Educativa Estratégica',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Planeamiento institucional', 'creditos' => 4],
                            ['nombre' => 'Gestión de relaciones interinstitucionales y comunitarias', 'creditos' => 4],
                            ['nombre' => 'Gestión del currículo', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Liderazgo pedagógico', 'creditos' => 4],
                            ['nombre' => 'Gestión de la convivencia escolar', 'creditos' => 4],
                            ['nombre' => 'Gestión del talento humano', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Gestión administrativa', 'creditos' => 4],
                            ['nombre' => 'Gestión de recursos financieros', 'creditos' => 4],
                            ['nombre' => 'Informe de tesis y artículo científico', 'creditos' => 8],
                        ]
                    ],
                ]
            ],

            // 16. MAESTRÍA EN CIENCIAS DE ENFERMERÍA
            [
                'nombre' => 'Ciencias de Enfermería',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Perspectiva de la enfermería como ciencia y profesión', 'creditos' => 4],
                            ['nombre' => 'Gestión de la información', 'creditos' => 4],
                            ['nombre' => 'Planificación de la investigación', 'creditos' => 6],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Desarrollo intrapersonal', 'creditos' => 3],
                            ['nombre' => 'Gestión de los servicios de salud', 'creditos' => 6],
                            ['nombre' => 'Docencia en enfermería', 'creditos' => 4],
                            ['nombre' => 'Ejecución de la investigación', 'creditos' => 5],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Proyectos de inversión en salud', 'creditos' => 4],
                            ['nombre' => 'Tecnologías de información y su aplicación en la didáctica', 'creditos' => 4],
                            ['nombre' => 'Comunicación de la investigación', 'creditos' => 6],
                        ]
                    ],
                ]
            ],

            // 17. MAESTRÍA EN CIENCIAS CON MENCIÓN EN PROYECTOS DE INVERSIÓN
            [
                'nombre' => 'Ciencias con mención en Proyectos de Inversión',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Métodos cuantitativos', 'creditos' => 4],
                            ['nombre' => 'Análisis económico', 'creditos' => 4],
                            ['nombre' => 'Técnicas para la formulación y evaluación de proyectos de inversión privada', 'creditos' => 4],
                            ['nombre' => 'Sistemas de información para proyectos de inversión', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Formulación y evaluación privada de proyectos', 'creditos' => 4],
                            ['nombre' => 'Planificación estratégica y de desarrollo', 'creditos' => 4],
                            ['nombre' => 'Técnicas para la formulación y evaluación social de proyectos', 'creditos' => 4],
                            ['nombre' => 'Sistema nacional de programación multianual y gestión de Inversiones', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Formulación y evaluación de proyectos de inversión social', 'creditos' => 4],
                            ['nombre' => 'Evaluación económica de impacto ambiental', 'creditos' => 4],
                            ['nombre' => 'Evaluación de proyectos estratégicos en entornos inciertos', 'creditos' => 4],
                            ['nombre' => 'Administración y análisis de riesgos de proyectos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Proyectos de cooperación técnica internacional', 'creditos' => 4],
                            ['nombre' => 'Seminario de tesis I', 'creditos' => 4],
                            ['nombre' => 'Seminario de tesis II', 'creditos' => 4],
                            ['nombre' => 'Seminario de tesis III', 'creditos' => 4],
                        ]
                    ],
                ]
            ],

            // 18. MAESTRÍA EN CIENCIAS VETERINARIAS CON MENCIÓN EN SALUD ANIMAL
            [
                'nombre' => 'Ciencias Veterinarias con mención en Salud Animal',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Metodología de la Investigación', 'creditos' => 3.5],
                            ['nombre' => 'Bioestadística - Diseños experimentales', 'creditos' => 4],
                            ['nombre' => 'Bioquímica y Biología Molecular', 'creditos' => 4],
                            ['nombre' => 'Patología macro e histopatología', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Seminario de Proyecto de Tesis', 'creditos' => 3.5],
                            ['nombre' => 'Inmunología Veterinaria', 'creditos' => 4],
                            ['nombre' => 'Patología Clínica Veterinaria', 'creditos' => 4],
                            ['nombre' => 'Patología Medica de las enfermedades parasitarias', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Epidemiología Veterinaria', 'creditos' => 4],
                            ['nombre' => 'Patología médica de las enfermedades virales y bacterianas', 'creditos' => 4],
                            ['nombre' => 'Seminario de Tesis I', 'creditos' => 3.5],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Salud Pública Ambiental', 'creditos' => 4],
                            ['nombre' => 'Seminario de Tesis II', 'creditos' => 3.5],
                        ]
                    ],
                ]
            ],

            // 19. MAESTRÍA EN CIENCIAS DE LA INGENIERÍA MECÁNICA ELÉCTRICA CON MENCIÓN EN ENERGÍA
            [
                'nombre' => 'Ciencias de la Ingeniería Mecánica y Eléctrica con mención en Energía',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Tópicos de energía', 'creditos' => 4],
                            ['nombre' => 'Economía de la energía', 'creditos' => 4],
                            ['nombre' => 'Conversión del transporte de energía', 'creditos' => 4],
                            ['nombre' => 'Gestión de la energía', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Energías limpias y medio ambiente', 'creditos' => 4],
                            ['nombre' => 'Planeamiento de la energía', 'creditos' => 4],
                            ['nombre' => 'Auditorias energéticas', 'creditos' => 4],
                            ['nombre' => 'Derecho y responsabilidad en energía', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Seminario I: Estado del arte', 'creditos' => 4],
                            ['nombre' => 'Seminario II: Diseño de investigación y los instrumentos de recolección de datos', 'creditos' => 4],
                            ['nombre' => 'Seminario III: Proyecto de tesis', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Seminario IV: El procesamiento y análisis de datos', 'creditos' => 4],
                            ['nombre' => 'Seminario V: El diseño y fundamentación del modelo', 'creditos' => 4],
                            ['nombre' => 'Seminario VI: El informe de tesis', 'creditos' => 4],
                        ]
                    ],
                ]
            ],

            // 20. MAESTRÍA EN ADMINISTRACIÓN CON MENCIÓN EN GERENCIA EMPRESARIAL
            [
                'nombre' => 'Administración con mención en Gerencia Empresarial',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Análisis de la información contable', 'creditos' => 4],
                            ['nombre' => 'Análisis del entorno', 'creditos' => 4],
                            ['nombre' => 'Economía para administradores', 'creditos' => 4],
                            ['nombre' => 'Gerencia de recursos humanos', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Técnicas de sistemas de información', 'creditos' => 4],
                            ['nombre' => 'Finanzas para directivos', 'creditos' => 4],
                            ['nombre' => 'Marketing en investigación de mercado', 'creditos' => 4],
                            ['nombre' => 'Seminario de Tesis I', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Gerencia de operaciones y logística', 'creditos' => 4],
                            ['nombre' => 'Dirección estrategica', 'creditos' => 4],
                            ['nombre' => 'Comercio Internacional', 'creditos' => 4],
                            ['nombre' => 'Seminario de Tesis II', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 4,
                        'cursos' => [
                            ['nombre' => 'Gestión de proyectos de inversión', 'creditos' => 4],
                            ['nombre' => 'Seminario de Tesis III', 'creditos' => 4],
                            ['nombre' => 'Habilidades gerenciales', 'creditos' => 4],
                        ]
                    ],
                ]
            ],

            // 21. MAESTRÍA EN CIENCIAS CON MENCIÓN EN GESTIÓN DE LA CALIDAD E INOCUIDAD DE ALIMENTOS
            [
                'nombre' => 'Ciencias con mención en Gestión de la Calidad e Inocuidad de Alimentos',
                'semestres' => [
                    [
                        'numero' => 1,
                        'cursos' => [
                            ['nombre' => 'Planificación estratégica en los sistemas de calidad en alimentos', 'creditos' => 4],
                            ['nombre' => 'Microbiología avanzada de alimentos', 'creditos' => 4],
                            ['nombre' => 'Aseguramiento de la calidad en la industria de alimentos', 'creditos' => 4],
                            ['nombre' => 'Metodología de la investigación científica', 'creditos' => 4],
                        ]
                    ],
                    [
                        'numero' => 2,
                        'cursos' => [
                            ['nombre' => 'Diseño de programas pre requisitos al sistema HACCP', 'creditos' => 4],
                            ['nombre' => 'Gestión de la calidad en la industria de alimentos', 'creditos' => 4],
                            ['nombre' => 'Proyecto de tesis', 'creditos' => 8],
                        ]
                    ],
                    [
                        'numero' => 3,
                        'cursos' => [
                            ['nombre' => 'Diseño y auditorias de sistemas HACCP', 'creditos' => 4],
                            ['nombre' => 'Gestión de la inocuidad en la industria alimentaria', 'creditos' => 4],
                            ['nombre' => 'Informe de Tesis', 'creditos' => 8],
                        ]
                    ],
                ]
            ],
        ];
    }
}