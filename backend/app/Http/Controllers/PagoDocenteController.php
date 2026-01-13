<?php

namespace App\Http\Controllers;

use App\Models\PagoDocente;
use App\Models\Docente;
use App\Models\Programa;
use App\Models\Curso;
use App\Services\DocumentGeneratorService;
use App\Exports\PagoDocenteExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PagoDocenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PagoDocente::with(['docente', 'curso.semestres.programa.facultad', 'curso.semestres.programa.grado']);

        // Search by docente name, DNI, or curso name
        // Search by multiple fields
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                // Docente
                $q->whereHas('docente', function ($q) use ($search) {
                    $q->where('nombres', 'LIKE', "%{$search}%")
                        ->orWhere('apellido_paterno', 'LIKE', "%{$search}%")
                        ->orWhere('apellido_materno', 'LIKE', "%{$search}%")
                        ->orWhere('dni', 'LIKE', "%{$search}%");
                })
                    // Curso
                    ->orWhereHas('curso', function ($q) use ($search) {
                        $q->where('nombre', 'LIKE', "%{$search}%")
                            ->orWhere('codigo', 'LIKE', "%{$search}%");
                    })
                    // Programa (via Curso -> Semestres -> Programa)
                    ->orWhereHas('curso.semestres.programa', function ($q) use ($search) {
                        $q->where('nombre', 'LIKE', "%{$search}%");
                    })
                    // Direct fields
                    ->orWhere('periodo', 'LIKE', "%{$search}%")
                    ->orWhere('importe_total', 'LIKE', "%{$search}%")
                    ->orWhere('numero_horas', 'LIKE', "%{$search}%")
                    // Document Numbers
                    ->orWhere('numero_oficio_presentacion_facultad', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_presentacion_coordinador', 'LIKE', "%{$search}%")
                    ->orWhere('numero_resolucion_aprobacion', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_conformidad_facultad', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_conformidad_coordinador', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_conformidad_direccion', 'LIKE', "%{$search}%")
                    ->orWhere('numero_resolucion_pago', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_contabilidad', 'LIKE', "%{$search}%");
            });
        }

        // Filter by periodo
        if ($request->has('periodo') && $request->periodo) {
            $query->where('periodo', $request->periodo);
        }

        // Filter by tipo_docente
        if ($request->has('tipo_docente') && $request->tipo_docente && $request->tipo_docente !== 'todos') {
            $query->whereHas('docente', function ($q) use ($request) {
                $q->where('tipo_docente', $request->tipo_docente);
            });
        }

        // Filter by programa (via curso -> semestres -> programa)
        if ($request->has('programa_id') && $request->programa_id) {
            $query->whereHas('curso.semestres', function ($q) use ($request) {
                $q->where('programa_id', $request->programa_id);
            });
        }

        // Clone query to calculate total sum without pagination
        $totalImporte = $query->clone()->sum('importe_total');

        $pagos = $query->latest()->paginate(15);

        // Format response with computed fields
        $pagos->getCollection()->transform(function ($pago) {
            // Obtener programa del primer semestre del curso
            $programa = $pago->curso->semestres->first()->programa ?? null;

            return [
                'id' => $pago->id,
                'docente_nombre' => $pago->docente
                    ? ($pago->docente->titulo_profesional ? $pago->docente->titulo_profesional . ' ' : '') .
                    "{$pago->docente->nombres} {$pago->docente->apellido_paterno} {$pago->docente->apellido_materno}"
                    : null,
                'docente_dni' => $pago->docente->dni ?? null,
                'tipo_docente' => $pago->docente->tipo_docente ?? null,
                'curso_nombre' => $pago->curso->nombre ?? null,
                'programa_nombre' => $programa ? "{$programa->grado->nombre} en {$programa->nombre}" : null,
                'periodo' => $pago->periodo,
                'numero_horas' => $pago->numero_horas,
                'costo_por_hora' => $pago->costo_por_hora,
                'importe_total' => $pago->importe_total,
                'estado' => $pago->estado,
                'importe_letras' => $pago->importe_letras,
                'numero_oficio_presentacion_facultad' => $pago->numero_oficio_presentacion_facultad,
                'numero_oficio_presentacion_coordinador' => $pago->numero_oficio_presentacion_coordinador,
                'numero_oficio_conformidad_facultad' => $pago->numero_oficio_conformidad_facultad,
                'numero_oficio_conformidad_coordinador' => $pago->numero_oficio_conformidad_coordinador,
                'numero_oficio_conformidad_direccion' => $pago->numero_oficio_conformidad_direccion,
                'numero_expediente_nota_pago' => $pago->numero_expediente_nota_pago,
                'numero_resolucion_aprobacion' => $pago->numero_resolucion_aprobacion,
                'fecha_resolucion_aprobacion' => $pago->fecha_resolucion_aprobacion,
                'numero_resolucion_pago' => $pago->numero_resolucion_pago,
                'numero_oficio_contabilidad' => $pago->numero_oficio_contabilidad,
                'created_at' => $pago->created_at,
                'updated_at' => $pago->updated_at,
                'facultad_codigo' => $programa->facultad->codigo ?? null,
                'grado_nombre' => $programa->grado->nombre ?? null,
            ];
        });

        // Return paginated data and total sum
        return response()->json([
            'data' => $pagos,
            'total_importe' => $totalImporte
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'docente_id' => 'required|exists:docentes,id',
            'curso_id' => 'required|exists:cursos,id',
            'periodo' => 'required|string',
            'numero_horas' => 'required|numeric|min:0',
            'costo_por_hora' => 'required|numeric|min:0',
            'importe_total' => 'required|numeric|min:0',
            'importe_letras' => 'required|string',
            'fechas_ensenanza' => 'required|array',
            'numero_informe_final' => 'nullable|string',
            'numero_informe_final_url' => 'nullable|url',
            'fecha_resolucion_aprobacion' => 'nullable|date',
            'nota_pago_2' => 'nullable|string',
            'fecha_constancia_pago' => 'nullable|date',
            'fecha_nota_pago' => 'nullable|date',
            'fecha_nota_pago_2' => 'nullable|date',
            'oficio_direccion_exp_docentes' => 'nullable|string',
            'oficio_direccion_exp_docentes_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $pago = PagoDocente::create($request->all());

        return response()->json([
            'message' => 'Pago registrado exitosamente',
            'data' => $pago
        ], 201);
    }



    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $pago = PagoDocente::with(['docente', 'curso.semestres.programa.facultad', 'curso.semestres.programa.grado'])->findOrFail($id);

        // Obtener programa del primer semestre del curso
        $programa = $pago->curso->semestres->first()->programa ?? null;

        $pago->programa_nombre = $programa ? "{$programa->grado->nombre} en {$programa->nombre} ({$programa->periodo})" : null;
        $pago->facultad_codigo = $programa->facultad->codigo ?? null;
        $pago->grado_nombre = $programa->grado->nombre ?? null;

        return response()->json(['data' => $pago], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        Log::info('Update PagoDocente Payload:', $request->all());
        Log::info('Periodo received:', ['periodo' => $request->periodo]);
        $pago = PagoDocente::find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'docente_id' => 'sometimes|exists:docentes,id',
            'curso_id' => 'sometimes|exists:cursos,id',
            'periodo' => 'sometimes|string',
            'numero_horas' => 'sometimes|numeric|min:0',
            'costo_por_hora' => 'sometimes|numeric|min:0',
            'importe_total' => 'sometimes|numeric|min:0',
            'fecha_resolucion_aprobacion' => 'nullable|date',
            'numero_resolucion_aprobacion' => 'nullable|string',
            'numero_resolucion_pago' => 'nullable|string',
            'fecha_resolucion' => 'nullable|date',
            'numero_oficio_contabilidad' => 'nullable|string',
            'fecha_oficio_contabilidad' => 'nullable|date',
            'director_nombre' => 'nullable|string',
            'coordinador_nombre' => 'nullable|string',
            'oficio_direccion_exp_docentes' => 'nullable|string',
            'oficio_direccion_exp_docentes_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $pago->fill($request->all());

        // Verificar si todos los campos requeridos para completar el pago están presentes
        if (
            !empty($pago->orden_servicio) &&
            !empty($pago->acta_conformidad) &&
            !empty($pago->numero_exp_siaf) &&
            !empty($pago->nota_pago) &&
            !empty($pago->fecha_nota_pago) &&
            !empty($pago->fecha_constancia_pago)
        ) {
            $pago->estado = 'completado';
        }

        $pago->save();

        return response()->json([
            'message' => 'Pago actualizado exitosamente',
            'data' => $pago
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $pago = PagoDocente::find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado'], 404);
        }

        $pago->delete();

        return response()->json(['message' => 'Pago eliminado exitosamente'], 200);
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
            ->select('id', 'titulo_profesional', 'nombres', 'apellido_paterno', 'apellido_materno', 'dni', 'tipo_docente')
            ->limit(10)
            ->get()
            ->map(function ($docente) {
                $nombreCompleto = ($docente->titulo_profesional ? $docente->titulo_profesional . ' ' : '') .
                    "{$docente->nombres} {$docente->apellido_paterno} {$docente->apellido_materno}";
                return [
                    'id' => $docente->id,
                    'label' => "{$nombreCompleto} - Docente {$docente->tipo_docente}",
                    'tipo_docente' => $docente->tipo_docente,
                ];
            });

        return response()->json(['data' => $docentes], 200);
    }

    /**
     * Buscar programas con debounce
     */
    public function buscarProgramas(Request $request)
    {
        $query = $request->get('q', '');
        $periodo = $request->get('periodo', '');

        if (strlen($query) < 2) {
            return response()->json(['data' => []], 200);
        }

        $programas = Programa::where('nombre', 'LIKE', "%{$query}%");

        if ($periodo) {
            $programas->where('periodo', $periodo);
        }

        $programas = $programas->with('facultad')
            ->select('id', 'nombre', 'periodo', 'facultad_id')
            ->limit(10)
            ->get()
            ->map(function ($programa) {
                return [
                    'id' => $programa->id,
                    'label' => "{$programa->nombre} ({$programa->periodo})",
                    'periodo' => $programa->periodo,
                    'facultad_id' => $programa->facultad_id,
                ];
            });

        return response()->json(['data' => $programas], 200);
    }

    /**
     * Obtener datos completos del programa (facultad, director, coordinador)
     */
    public function obtenerDatosPrograma(string $id)
    {
        $programa = Programa::with(['facultad', 'coordinadores'])->find($id);

        if (!$programa) {
            return response()->json(['message' => 'Programa no encontrado'], 404);
        }

        // Obtener el coordinador activo (sin fecha_fin o fecha_fin futura)
        $coordinador = $programa->coordinadores()
            ->first();

        $datos = [
            'facultad_nombre' => $programa->facultad->nombre ?? null,
            'director_nombre' => $programa->facultad->director_nombre ?? null,
            'coordinador_nombre' => $coordinador ? $coordinador->titulo_profesional . ' ' . $coordinador->nombres . ' ' . $coordinador->apellido_paterno . ' ' . $coordinador->apellido_materno : null,
        ];

        return response()->json(['data' => $datos], 200);
    }

    /**
     * Buscar cursos con debounce
     */
    public function buscarCursos(Request $request)
    {
        $query = $request->get('q', '');
        $facultadCodigo = trim($request->get('facultad_codigo', ''));

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

        $cursos = $cursosQuery->limit(10)->get();
        $resultados = [];

        foreach ($cursos as $curso) {
            foreach ($curso->semestres as $semestre) {
                $programa = $semestre->programa;

                // If filtering by faculty, ensure this specific semester's program belongs to the faculty
                if ($facultadCodigo && ($programa->facultad->codigo ?? '') !== $facultadCodigo) {
                    continue;
                }

                $grado = $programa->grado->nombre ?? '';
                $facultad = $programa->facultad->codigo ?? '';

                $resultados[] = [
                    'id' => $curso->id . '-' . $semestre->id, // Composite ID
                    'original_id' => $curso->id,
                    'label' => "{$curso->nombre} ({$grado} en {$programa->nombre} - {$semestre->programa->periodo})",
                    'periodo' => $semestre->programa->periodo,
                    'programa_id' => $semestre->programa_id,
                    'semestre_id' => $semestre->id,
                    'grado_nombre' => $grado,
                ];
            }
        }
        return response()->json(['data' => $resultados], 200);
    }

    /**
     * Obtener datos completos del curso (programa, facultad, director, coordinador)
     */
    public function obtenerDatosCurso(string $id)
    {
        // Check if ID is composite (curso_id-semestre_id)
        if (strpos($id, '-') !== false) {
            [$cursoId, $semestreId] = explode('-', $id);
            $curso = Curso::with([
                'semestres' => function ($q) use ($semestreId) {
                    $q->where('semestres.id', $semestreId)->with(['programa.facultad', 'programa.coordinadores']);
                }
            ])->find($cursoId);
        } else {
            $curso = Curso::with(['semestres.programa.facultad', 'semestres.programa.coordinadores', 'semestres.programa.grado'])->find($id);
        }

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        // Obtener el semestre específico o el primero
        $semestre = $curso->semestres->first();

        if (!$semestre) {
            return response()->json(['message' => 'Curso sin semestre asignado'], 404);
        }

        $programa = $semestre->programa;

        // Obtener el coordinador activo
        $coordinador = $programa->coordinadores()
            ->wherePivot('fecha_fin', null)
            ->orWherePivot('fecha_fin', '>', now())
            ->first();

        $datos = [
            'programa_id' => $programa->id,
            'programa_nombre' => $programa->grado->nombre . ' en ' . $programa->nombre . ' (' . $programa->periodo . ')',
            'periodo' => $programa->periodo,
            'semestre_id' => $semestre->id,
            'facultad_nombre' => $programa->facultad->nombre ?? null,
            'director_nombre' => $programa->facultad->director_nombre ?? null,
            'coordinador_nombre' => $coordinador ? $coordinador->titulo_profesional . ' ' . $coordinador->nombres . ' ' . $coordinador->apellido_paterno . ' ' . $coordinador->apellido_materno : null,
            'facultad_codigo' => $programa->facultad->codigo ?? null,
            'grado_nombre' => $programa->grado->nombre ?? null,
        ];

        return response()->json(['data' => $datos], 200);
    }

    /**
     * Genera y descarga el documento de resolución
     */
    public function generateResolucion(string $id)
    {
        $pago = PagoDocente::find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado'], 404);
        }

        try {
            $service = new DocumentGeneratorService();
            $filePath = $service->generateResolucion($pago);
            $fileName = basename($filePath);

            return response()->file($filePath, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition' => "attachment; filename*=UTF-8''" . rawurlencode($fileName),
                'Access-Control-Expose-Headers' => 'Content-Disposition'
            ])->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar la resolución',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Genera y descarga el documento de resolución de aceptación (Docentes Externos)
     */
    public function generateResolucionAceptacion(string $id)
    {
        $pago = PagoDocente::find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado'], 404);
        }

        try {
            $service = new DocumentGeneratorService();
            $filePath = $service->generateResolucionAceptacion($pago);
            $fileName = basename($filePath);

            return response()->file($filePath, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition' => "attachment; filename*=UTF-8''" . rawurlencode($fileName),
                'Access-Control-Expose-Headers' => 'Content-Disposition'
            ])->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar la resolución de aceptación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Genera y descarga el oficio de contabilidad
     */
    public function generateOficioContabilidad(string $id)
    {
        $pago = PagoDocente::find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado'], 404);
        }

        try {
            $service = new DocumentGeneratorService();
            $filePath = $service->generateOficioContabilidad($pago);
            $fileName = basename($filePath);

            return response()->file($filePath, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition' => "attachment; filename*=UTF-8''" . rawurlencode($fileName),
                'Access-Control-Expose-Headers' => 'Content-Disposition'
            ])->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar el oficio',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Exportar pagos a Excel
     */
    public function exportExcel(Request $request)
    {
        $filters = $request->all();
        $fileName = 'pagos_docentes_' . date('Y-m-d_H-i-s') . '.xlsx';

        return Excel::download(new PagoDocenteExport($filters), $fileName);
    }
}
