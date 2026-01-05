<?php

namespace App\Http\Controllers;

use App\Models\Expediente;
use App\Models\Docente;
use App\Models\Curso;
use App\Models\PagoDocente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ExpedienteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Expediente::with(['docente', 'curso', 'pagoDocente', 'semestre.programa.grado']);

        // Search by numero_documento, remitente
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_documento', 'LIKE', "%{$search}%")
                    ->orWhere('numero_expediente_mesa_partes', 'LIKE', "%{$search}%")
                    ->orWhere('remitente', 'LIKE', "%{$search}%");
            });
        }

        // Filter by tipo_asunto
        if ($request->has('tipo_asunto') && $request->tipo_asunto) {
            $query->where('tipo_asunto', $request->tipo_asunto);
        }

        // Filter by fecha range
        if ($request->has('fecha_desde') && $request->fecha_desde) {
            $query->where('fecha_mesa_partes', '>=', $request->fecha_desde);
        }
        if ($request->has('fecha_hasta') && $request->fecha_hasta) {
            $query->where('fecha_mesa_partes', '<=', $request->fecha_hasta);
        }

        // Filter by estado_pago (via pagoDocente relationship)
        if ($request->has('estado_pago') && $request->estado_pago) {
            $query->whereHas('pagoDocente', function ($q) use ($request) {
                $q->where('estado', $request->estado_pago);
            });
        }

        $expedientes = $query->latest()->paginate(15);

        // Format response
        $expedientes->getCollection()->transform(function ($expediente) {
            $programa = $expediente->programa ?? ($expediente->semestre->programa ?? null);

            return [
                'id' => $expediente->id,
                'numero_expediente_mesa_partes' => $expediente->numero_expediente_mesa_partes,
                'numero_documento' => $expediente->numero_documento,
                'fecha_mesa_partes' => $expediente->fecha_mesa_partes,
                'fecha_recepcion_contabilidad' => $expediente->fecha_recepcion_contabilidad,
                'remitente' => $expediente->remitente,
                'tipo_asunto' => $expediente->tipo_asunto,
                'descripcion_asunto' => $expediente->descripcion_asunto,
                'docente_nombre' => $expediente->docente
                    ? "{$expediente->docente->nombres} {$expediente->docente->apellido_paterno} {$expediente->docente->apellido_materno}"
                    : null,
                'docente_titulo_profesional' => $expediente->docente->titulo_profesional ?? null,
                'curso_nombre' => $expediente->curso->nombre ?? null,
                'programa_nombre' => $programa->nombre ?? null,
                'grado_nombre' => $programa->grado->nombre ?? null,
                'periodo' => $programa->periodo ?? null,
                'estado_pago' => $expediente->pagoDocente->estado ?? null,
                'pago_docente_id' => $expediente->pago_docente_id,
                'created_at' => $expediente->created_at,
                'updated_at' => $expediente->updated_at,
            ];
        });

        return response()->json($expedientes, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'numero_expediente_mesa_partes' => 'nullable|string',
            'numero_documento' => 'required|string',
            'fecha_mesa_partes' => 'required|date',
            'fecha_recepcion_contabilidad' => 'required|date',
            'remitente' => 'required|string',
            'tipo_asunto' => 'required|in:descripcion,presentacion,conformidad,devolucion',
            'descripcion_asunto' => 'nullable|string',
            // Validación para flujo normal (un solo docente-curso)
            'docente_id' => 'nullable|exists:docentes,id',
            'curso_id' => 'nullable|exists:cursos,id',
            'semestre_id' => 'nullable|exists:semestres,id',
            'fechas_ensenanza' => 'nullable|array',
            // Validación para múltiples docentes-cursos
            'docentes_cursos' => 'nullable|array',
            'docentes_cursos.*.docente_id' => 'required_with:docentes_cursos|exists:docentes,id',
            'docentes_cursos.*.curso_id' => 'required_with:docentes_cursos|exists:cursos,id',
            'docentes_cursos.*.semestre_id' => 'required_with:docentes_cursos|exists:semestres,id',
            'docentes_cursos.*.fechas_ensenanza' => 'required_with:docentes_cursos|array',
            'docentes_cursos.*.numero_oficio_coordinador' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Verificar si viene array de docentes_cursos (múltiples)
            if ($request->has('docentes_cursos') && is_array($request->docentes_cursos) && count($request->docentes_cursos) > 0) {
                // Flujo múltiple: crear un expediente por cada docente-curso
                $expedientes = [];

                foreach ($request->docentes_cursos as $dc) {
                    // Preparar datos del expediente
                    $expedienteData = [
                        'numero_expediente_mesa_partes' => $request->numero_expediente_mesa_partes,
                        'numero_documento' => $request->numero_documento,
                        'fecha_mesa_partes' => $request->fecha_mesa_partes,
                        'fecha_recepcion_contabilidad' => $request->fecha_recepcion_contabilidad,
                        'remitente' => $request->remitente,
                        'tipo_asunto' => $request->tipo_asunto,
                        'descripcion_asunto' => $request->descripcion_asunto,
                        'docente_id' => $dc['docente_id'],
                        'curso_id' => $dc['curso_id'],
                        'semestre_id' => $dc['semestre_id'],
                        'fechas_ensenanza' => $dc['fechas_ensenanza'],
                    ];

                    // Agregar campos específicos según tipo
                    if ($request->tipo_asunto === 'presentacion') {
                        $expedienteData['numero_oficio_presentacion_coordinador'] = $dc['numero_oficio_coordinador'] ?? null;
                    } elseif ($request->tipo_asunto === 'conformidad') {
                        $expedienteData['numero_oficio_conformidad_coordinador'] = $dc['numero_oficio_coordinador'] ?? null;
                    }

                    $expediente = Expediente::create($expedienteData);

                    // Procesar auto-linking según tipo de asunto
                    switch ($expediente->tipo_asunto) {
                        case 'presentacion':
                            $expediente->procesarPresentacion();
                            break;
                        case 'conformidad':
                            $expediente->procesarConformidad();
                            break;
                    }

                    $expedientes[] = $expediente->load(['docente', 'curso', 'pagoDocente']);
                }

                DB::commit();

                return response()->json([
                    'message' => count($expedientes) . ' expediente(s) registrado(s) exitosamente',
                    'data' => $expedientes,
                    'multiple' => true
                ], 201);

            } else {
                // Flujo normal: un solo expediente
                $expediente = Expediente::create($request->all());

                // Procesar auto-linking según tipo de asunto
                switch ($expediente->tipo_asunto) {
                    case 'presentacion':
                        $expediente->procesarPresentacion();
                        break;
                    case 'conformidad':
                        $expediente->procesarConformidad();
                        break;
                    case 'resolucion':
                        $expediente->procesarResolucion();
                        break;
                    case 'devolucion':
                        $expediente->procesarDevolucion();
                        break;
                }

                DB::commit();

                return response()->json([
                    'message' => 'Expediente registrado exitosamente',
                    'data' => $expediente->load(['docente', 'curso', 'pagoDocente']),
                    'multiple' => false
                ], 201);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar expediente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $expediente = Expediente::with(['docente', 'curso', 'pagoDocente'])->findOrFail($id);

        return response()->json(['data' => $expediente], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $expediente = Expediente::find($id);

        if (!$expediente) {
            return response()->json(['message' => 'Expediente no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'numero_expediente_mesa_partes' => 'sometimes|nullable|string',
            'numero_documento' => 'sometimes|string',
            'fecha_mesa_partes' => 'sometimes|date',
            'fecha_recepcion_contabilidad' => 'sometimes|date',
            'remitente' => 'sometimes|string',
            'tipo_asunto' => 'sometimes|in:descripcion,presentacion,conformidad,devolucion',
            'descripcion_asunto' => 'sometimes|nullable|string',
            'docente_id' => 'sometimes|nullable|exists:docentes,id',
            'curso_id' => 'sometimes|nullable|exists:cursos,id',
            'semestre_id' => 'sometimes|nullable|exists:semestres,id',
            'fechas_ensenanza' => 'sometimes|nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Guardar datos anteriores para detectar cambios
            $pagoAnterior = $expediente->pago_docente_id;

            $expediente->update($request->all());

            // Re-procesar si es presentación o conformidad (incluso si no tiene pago vinculado)
            if (in_array($expediente->tipo_asunto, ['presentacion', 'conformidad'])) {

                if ($expediente->tipo_asunto === 'presentacion') {
                    // Re-procesar presentación
                    if ($pagoAnterior) {
                        // Si tenía un pago vinculado, intentar actualizarlo
                        $pago = PagoDocente::find($pagoAnterior);
                        if ($pago) {
                            // Pago existe → Actualizarlo
                            $semestre = \App\Models\Semestre::with('programa')->find($expediente->semestre_id);
                            if ($semestre && $semestre->programa) {
                                $pago->update([
                                    'docente_id' => $expediente->docente_id,
                                    'curso_id' => $expediente->curso_id,
                                    'periodo' => $semestre->programa->periodo,
                                    'fechas_ensenanza' => $expediente->fechas_ensenanza,
                                    'numero_oficio_presentacion_facultad' => $expediente->numero_documento,
                                    'numero_oficio_presentacion_coordinador' => $expediente->numero_oficio_presentacion_coordinador,
                                ]);
                            }
                        } else {
                            // Pago fue eliminado → Crear nuevo y actualizar referencia
                            $expediente->pago_docente_id = null;
                            $expediente->save();
                            $expediente->procesarPresentacion();
                        }
                    } else {
                        // No tenía pago vinculado → Crear nuevo
                        $expediente->procesarPresentacion();
                    }
                } elseif ($expediente->tipo_asunto === 'conformidad') {
                    // Re-evaluar vinculación basada en fechas
                    if ($pagoAnterior) {
                        // Verificar si el pago anterior aún existe
                        $pagoAnteriorObj = PagoDocente::find($pagoAnterior);

                        if ($pagoAnteriorObj) {
                            // Pago anterior existe → Re-evaluar vinculación
                            $semestre = \App\Models\Semestre::with('programa')->find($expediente->semestre_id);
                            if ($semestre && $semestre->programa) {
                                $periodo = $semestre->programa->periodo;

                                // Buscar pagos pendientes que coincidan
                                $pagos = PagoDocente::where('docente_id', $expediente->docente_id)
                                    ->where('curso_id', $expediente->curso_id)
                                    ->where('periodo', $periodo)
                                    ->where('estado', 'pendiente')
                                    ->get();

                                $pagoCoincidente = null;
                                foreach ($pagos as $p) {
                                    // Comparar por mes y año en lugar de fechas exactas
                                    $monthsYearsPago = $this->extractMonthsYearsFromArray($p->fechas_ensenanza);
                                    $monthsYearsExpediente = $this->extractMonthsYearsFromArray($expediente->fechas_ensenanza);

                                    // Si los meses y años coinciden, vincular
                                    if ($monthsYearsPago === $monthsYearsExpediente && !empty($monthsYearsPago)) {
                                        $pagoCoincidente = $p;
                                        break;
                                    }
                                }

                                if ($pagoCoincidente) {
                                    if ($pagoAnterior !== $pagoCoincidente->id) {
                                        // Cambió de pago → Desvincular anterior
                                        if ($pagoAnteriorObj->estado === 'en_proceso') {
                                            $pagoAnteriorObj->update([
                                                'numero_oficio_conformidad_direccion' => null,
                                                'numero_oficio_conformidad_coordinador' => null,
                                                'estado' => 'pendiente',
                                            ]);
                                        }
                                    }

                                    // Vincular al nuevo pago
                                    $pagoCoincidente->update([
                                        'numero_oficio_conformidad_direccion' => $expediente->numero_documento,
                                        'numero_oficio_conformidad_coordinador' => $expediente->numero_oficio_conformidad_coordinador,
                                        'estado' => 'en_proceso',
                                    ]);

                                    $expediente->pago_docente_id = $pagoCoincidente->id;
                                    $expediente->save();
                                } else {
                                    // No encontró coincidencia → Desvincular
                                    if ($pagoAnteriorObj->estado === 'en_proceso') {
                                        $pagoAnteriorObj->update([
                                            'numero_oficio_conformidad_direccion' => null,
                                            'numero_oficio_conformidad_coordinador' => null,
                                            'estado' => 'pendiente',
                                        ]);
                                    }

                                    $expediente->pago_docente_id = null;
                                    $expediente->save();
                                }
                            }
                        } else {
                            // Pago anterior fue eliminado → Limpiar referencia y re-procesar
                            $expediente->pago_docente_id = null;
                            $expediente->save();
                            $expediente->procesarConformidad();
                        }
                    } else {
                        // No tenía pago vinculado → Procesar conformidad
                        $expediente->procesarConformidad();
                    }
                }
            }

            DB::commit();
            return response()->json([
                'message' => 'Expediente actualizado exitosamente',
                'data' => $expediente->load(['docente', 'curso', 'pagoDocente'])
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar expediente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $expediente = Expediente::find($id);

        if (!$expediente) {
            return response()->json(['message' => 'Expediente no encontrado'], 404);
        }

        $expediente->delete();

        return response()->json(['message' => 'Expediente eliminado exitosamente'], 200);
    }

    /**
     * Extract unique month-year combinations from a date array
     * Returns array of "YYYY-MM" strings
     */
    private function extractMonthsYearsFromArray($fechas)
    {
        // Handle JSON string input
        if (is_string($fechas)) {
            $fechas = json_decode($fechas, true);
        }

        // Handle null or empty array
        if (!is_array($fechas) || empty($fechas)) {
            return [];
        }

        $monthsYears = [];
        foreach ($fechas as $fecha) {
            // Extract YYYY-MM from date string
            $date = \Carbon\Carbon::parse($fecha);
            $monthYear = $date->format('Y-m');
            if (!in_array($monthYear, $monthsYears)) {
                $monthsYears[] = $monthYear;
            }
        }

        sort($monthsYears);
        return $monthsYears;
    }

    /**
     * Buscar docentes con debounce
     */
    public function buscarDocentes(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json(['data' => []], 200);
        }

        $docentes = Docente::where('nombres', 'LIKE', "%{$query}%")
            ->orWhere('apellido_paterno', 'LIKE', "%{$query}%")
            ->orWhere('apellido_materno', 'LIKE', "%{$query}%")
            ->orWhere('dni', 'LIKE', "%{$query}%")
            ->select('id', 'nombres', 'apellido_paterno', 'apellido_materno', 'dni', 'tipo_docente')
            ->limit(10)
            ->get()
            ->map(function ($docente) {
                return [
                    'id' => $docente->id,
                    'label' => "{$docente->nombres} {$docente->apellido_paterno} {$docente->apellido_materno} - DNI: {$docente->dni}",
                    'tipo_docente' => $docente->tipo_docente,
                ];
            });

        return response()->json(['data' => $docentes], 200);
    }

    /**
     * Buscar cursos con debounce
     */
    /**
     * Buscar cursos con debounce
     */
    public function buscarCursos(Request $request)
    {
        $query = $request->get('q', '');
        $facultadCodigo = trim($request->get('facultad_codigo', ''));

        \Illuminate\Support\Facades\Log::info('buscarCursos', ['query' => $query, 'facultad_codigo' => $facultadCodigo]);

        if (strlen($query) < 2) {
            return response()->json(['data' => []], 200);
        }

        $cursosQuery = Curso::with(['semestres.programa.grado', 'semestres.programa.facultad'])
            ->where(function ($q) use ($query) {
                $q->where('nombre', 'LIKE', "%{$query}%")
                    ->orWhere('codigo', 'LIKE', "%{$query}%");
            });

        // Filter by faculty code if provided
        if ($facultadCodigo) {
            $cursosQuery->whereHas('semestres.programa.facultad', function ($q) use ($facultadCodigo) {
                $q->where('codigo', $facultadCodigo);
            });
        }

        $cursos = $cursosQuery->limit(10)
            ->get()
            ->map(function ($curso) {
                $semestre = $curso->semestres->first();

                if (!$semestre) {
                    return null;
                }

                $programa = $semestre->programa;
                $grado = $programa->grado->nombre ?? '';
                $facultad = $programa->facultad->codigo ?? '';

                return [
                    'id' => $curso->id,
                    'label' => "{$curso->nombre} ({$grado} en {$programa->nombre} - {$semestre->programa->periodo}) [{$facultad}]",
                    'periodo' => $semestre->programa->periodo,
                    'programa_id' => $semestre->programa_id,
                    'semestre_id' => $semestre->id,
                ];
            })
            ->filter();

        return response()->json(['data' => $cursos->values()], 200);
    }

    /**
     * Buscar directores de facultades para remitente
     */
    public function buscarDirectores(Request $request)
    {
        $search = $request->get('q', '');

        $directores = [];

        // Buscar en facultades
        $facultades = \App\Models\Facultad::query()
            ->when($search && $search !== 'all', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('director_nombre', 'LIKE', "%{$search}%")
                        ->orWhere('nombre', 'LIKE', "%{$search}%")
                        ->orWhere('codigo', 'LIKE', "%{$search}%");
                });
            })
            ->get();

        foreach ($facultades as $facultad) {
            if ($facultad->director_nombre) {
                if ($facultad->director_genero == 'M') {
                    $directores[] = [
                        'id' => 'facultad_' . $facultad->id,
                        'label' => $facultad->director_nombre . ' - Director de ' . $facultad->nombre,
                        'nombre' => $facultad->director_nombre,
                        'codigo' => $facultad->codigo,
                    ];
                } else {
                    $directores[] = [
                        'id' => 'facultad_' . $facultad->id,
                        'label' => $facultad->director_nombre . ' - Directora de ' . $facultad->nombre,
                        'nombre' => $facultad->director_nombre,
                        'codigo' => $facultad->codigo,
                    ];
                }
            }
        }

        // Agregar Director de EPG (hardcoded)
        if (
            empty($search) ||
            stripos('Dr. Leandro Agapito Aznarán Castillo', $search) !== false ||
            stripos('EPG', $search) !== false ||
            stripos('Posgrado', $search) !== false
        ) {
            $directores[] = [
                'id' => 'epg_director',
                'label' => 'Dr. Leandro Agapito Aznarán Castillo - Director de Escuela de Posgrado (EPG)',
                'nombre' => 'Dr. Leandro Agapito Aznarán Castillo',
            ];
        } elseif (
            empty($search) ||
            stripos('Mg. José Luis Carranza García', $search) !== false ||
            stripos('DGA-UNPRG', $search) !== false ||
            stripos('Dirección General de Administración', $search) !== false
        ) {
            $directores[] = [
                'id' => 'mg_carranza',
                'label' => 'Mg. José Luis Carranza García - Director de Dirección General de Administración (DGA)',
                'nombre' => 'Mg. José Luis Carranza García',
            ];
        } elseif (
            empty($search) ||
            stripos('Mg. Juan Fernando Yalta Vallejos', $search) !== false ||
            stripos('DGA/UA', $search) !== false ||
            stripos('Unidad de Abastecimiento', $search) !== false
        ) {
            $directores[] = [
                'id' => 'mg_yalta',
                'label' => 'Mg. Juan Fernando Yalta Vallejos - Director de Unidad de Abastecimiento (UA)',
                'nombre' => 'Mg. Juan Fernando Yalta Vallejos',
            ];
        }

        return response()->json(['data' => $directores], 200);
    }
}
