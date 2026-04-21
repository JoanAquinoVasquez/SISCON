<?php

namespace App\Http\Controllers;

use App\Models\Devolucion;
use App\Models\Programa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DevolucionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Devolucion::with(['programa.grado', 'programa.facultad', 'expedientes']);

        // Search by persona, DNI, voucher
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('persona', 'LIKE', "%{$search}%")
                    ->orWhere('dni', 'LIKE', "%{$search}%")
                    ->orWhere('numero_voucher', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_direccion', 'LIKE', "%{$search}%");
            });
        }

        // Filter by tipo_devolucion
        if ($request->has('tipo_devolucion') && $request->tipo_devolucion) {
            $query->where('tipo_devolucion', $request->tipo_devolucion);
        }

        // Filter by estado (via related expedientes)
        if ($request->has('estado') && $request->estado) {
            $query->whereHas('expedientes', function ($q) use ($request) {
                $q->where('estado', $request->estado);
            });
        }

        // Filter by programa
        if ($request->has('programa_id') && $request->programa_id) {
            $query->where('programa_id', $request->programa_id);
        }

        // Exact ID match
        if ($request->has('id') && $request->id) {
            $query->where('devoluciones.id', $request->id);
        }

        $devoluciones = $query->latest('devoluciones.id')->paginate(15);

        // Format response
        $devoluciones->getCollection()->transform(function ($devolucion) {
            $programa = $devolucion->programa;
            return [
                'id' => $devolucion->id,
                'persona' => $devolucion->persona,
                'dni' => $devolucion->dni,
                'programa_nombre' => $programa
                    ? "{$programa->grado->nombre} en {$programa->nombre} ({$programa->periodo})"
                    : null,
                'proceso_admision' => $devolucion->proceso_admision,
                'tipo_devolucion' => $devolucion->tipo_devolucion,
                'tipo_devolucion_label' => $devolucion->tipo_devolucion_label,
                'importe' => $devolucion->importe,
                'numero_voucher' => $devolucion->numero_voucher,
                'numero_oficio_direccion' => $devolucion->numero_oficio_direccion,
                'expediente_numero' => $devolucion->expedientes->first()?->numero_documento,
                'estado' => $devolucion->estado,
                'estado_label' => $devolucion->estado_label,
                'observaciones' => $devolucion->observaciones,
                'created_at' => $devolucion->created_at,
                'updated_at' => $devolucion->updated_at,
            ];
        });

        return response()->json($devoluciones, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'persona' => 'required|string',
            'dni' => 'required|string',
            'programa_id' => 'required|exists:programas,id',
            'proceso_admision' => 'required|string',
            'tipo_devolucion' => 'required|in:inscripcion,idiomas,grados_titulos,certificado_estudios,otros',
            'importe' => 'required|numeric|min:0',
            'numero_voucher' => 'required|string',
            'numero_oficio_direccion' => 'nullable|string',
            'estado' => 'sometimes|in:pendiente,aprobado,rechazado,observado',
            'observaciones' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $devolucion = Devolucion::create($request->all());

        // Manually set estado if provided (since it's not in $fillable)
        if ($request->has('estado')) {
            $devolucion->estado = $request->estado;
        }

        return response()->json([
            'message' => 'Devolución registrada exitosamente',
            'data' => $devolucion->load('programa')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $devolucion = Devolucion::with(['programa.grado', 'programa.facultad', 'expedientes'])->findOrFail($id);

        return response()->json(['data' => $devolucion], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $devolucion = Devolucion::find($id);

        if (!$devolucion) {
            return response()->json(['message' => 'Devolución no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'persona' => 'sometimes|string',
            'dni' => 'sometimes|string',
            'programa_id' => 'sometimes|exists:programas,id',
            'proceso_admision' => 'sometimes|string',
            'tipo_devolucion' => 'sometimes|in:inscripcion,idiomas,grados_titulos,certificado_estudios,otros',
            'importe' => 'sometimes|numeric|min:0',
            'numero_voucher' => 'sometimes|string',
            'numero_oficio_direccion' => 'sometimes|nullable|string',
            'estado' => 'sometimes|in:pendiente,aprobado,rechazado,observado',
            'observaciones' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $devolucion->fill($request->except('estado'));

        // Update state manually to trigger mutator
        if ($request->has('estado')) {
            $devolucion->estado = $request->estado;
        }

        $devolucion->save();

        return response()->json([
            'message' => 'Devolución actualizada exitosamente',
            'data' => $devolucion->load('programa')
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $devolucion = Devolucion::find($id);

        if (!$devolucion) {
            return response()->json(['message' => 'Devolución no encontrada'], 404);
        }

        $devolucion->delete();

        return response()->json(['message' => 'Devolución eliminada exitosamente'], 200);
    }

    /**
     * Update estado of devolucion
     */
    public function actualizarEstado(Request $request, string $id)
    {
        $devolucion = Devolucion::find($id);

        if (!$devolucion) {
            return response()->json(['message' => 'Devolución no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:pendiente,en_proceso,completado,rechazado',
            'observaciones' => 'nullable|string',
            'file' => 'nullable|file|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $devolucion->estado = $request->estado;
        if ($request->has('observaciones')) {
            $devolucion->observaciones = $request->observaciones;
        }
        $devolucion->save();

        // If file is provided, update the related expediente's document_respuesta_url
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $driveService = new \App\Services\GoogleDriveService();
            $folderId = env('GOOGLE_DRIVE_FOLDER_ID');
            $link = $driveService->uploadFile($file, $folderId);

            if ($link) {
                // Update all associated expedientes
                foreach ($devolucion->expedientes as $expediente) {
                    $expediente->update(['documento_respuesta_url' => $link]);
                }
            }
        }

        return response()->json([
            'message' => 'Estado actualizado exitosamente',
            'data' => $devolucion
        ], 200);
    }
}
