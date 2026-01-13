<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DocenteController extends Controller
{
    public function index(Request $request)
    {
        $query = Docente::query();

        // Search across name and DNI
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                    ->orWhere('apellido_paterno', 'like', "%{$search}%")
                    ->orWhere('apellido_materno', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%");
            });
        }

        // Filter by tipo_docente
        if ($tipo = $request->query('tipo_docente')) {
            $query->where('tipo_docente', $tipo);
        }

        // Filter by genero
        if ($genero = $request->query('genero')) {
            $query->where('genero', $genero);
        }

        $perPage = $request->query('per_page', 10);
        $perPage = $request->query('per_page', 10);
        $docentes = $query->with(['pagos.curso.semestres.programa.grado'])
            ->withCount('pagos')
            ->orderBy('pagos_count', 'desc')
            ->orderBy('nombres', 'asc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        return response()->json($docentes);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|min:2',
            'apellido_paterno' => 'required|string|min:2',
            'apellido_materno' => 'required|string|min:2',
            'titulo_profesional' => 'nullable|string',
            'genero' => 'required|in:M,F',
            'fecha_nacimiento' => 'nullable|date',
            'dni' => 'nullable|string|size:8|unique:docentes,dni',
            'numero_telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'tipo_docente' => 'required|in:interno,externo,interno_enfermeria,externo_enfermeria',
            'lugar_procedencia_id' => 'nullable|exists:lugares_procedencia,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $docente = Docente::create($request->all());
        return response()->json(['data' => $docente, 'message' => 'Docente creado exitosamente'], 201);
    }

    public function show($id)
    {
        $docente = Docente::find($id);

        if (!$docente) {
            return response()->json(['message' => 'Docente no encontrado'], 404);
        }

        return response()->json(['data' => $docente]);
    }

    public function update(Request $request, $id)
    {
        $docente = Docente::find($id);

        if (!$docente) {
            return response()->json(['message' => 'Docente no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombres' => 'sometimes|string|min:2',
            'apellido_paterno' => 'sometimes|string|min:2',
            'apellido_materno' => 'sometimes|string|min:2',
            'titulo_profesional' => 'nullable|string',
            'genero' => 'sometimes|in:M,F',
            'fecha_nacimiento' => 'nullable|date',
            'dni' => 'nullable|string|size:8|unique:docentes,dni,' . $id,
            'numero_telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'tipo_docente' => 'sometimes|in:interno,externo,interno_enfermeria,externo_enfermeria',
            'lugar_procedencia_id' => 'nullable|exists:lugares_procedencia,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $docente->update($request->all());
        return response()->json(['data' => $docente, 'message' => 'Docente actualizado exitosamente']);
    }

    public function destroy($id)
    {
        $docente = Docente::find($id);

        if (!$docente) {
            return response()->json(['message' => 'Docente no encontrado'], 404);
        }

        $docente->delete();
        return response()->json(['message' => 'Docente eliminado exitosamente']);
    }
}
