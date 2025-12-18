<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DocenteController extends Controller
{
    public function index()
    {
        $docentes = Docente::all();
        return response()->json(['data' => $docentes]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|min:2',
            'apellido_paterno' => 'required|string|min:2',
            'apellido_materno' => 'required|string|min:2',
            'titulo_profesional' => 'nullable|string',
            'genero' => 'required|in:M,F',
            'dni' => 'nullable|string|size:8|unique:docentes,dni',
            'numero_telefono' => 'nullable|string',
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
            'dni' => 'nullable|string|size:8|unique:docentes,dni,' . $id,
            'numero_telefono' => 'nullable|string',
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
