<?php

namespace App\Http\Controllers;

use App\Models\Coordinador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CoordinadorController extends Controller
{
    public function index()
    {
        $coordinadores = Coordinador::all();
        return response()->json(['data' => $coordinadores]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|min:2',
            'apellido_paterno' => 'required|string|min:2',
            'apellido_materno' => 'required|string|min:2',
            'titulo_profesional' => 'nullable|string',
            'genero' => 'required|in:M,F',
            'dni' => 'nullable|string|size:8|unique:coordinadores,dni',
            'numero_telefono' => 'nullable|string',
            'tipo_coordinador' => 'required|in:interno,externo',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coordinador = Coordinador::create($request->all());
        return response()->json(['data' => $coordinador, 'message' => 'Coordinador creado exitosamente'], 201);
    }

    public function show($id)
    {
        $coordinador = Coordinador::find($id);

        if (!$coordinador) {
            return response()->json(['message' => 'Coordinador no encontrado'], 404);
        }

        return response()->json(['data' => $coordinador]);
    }

    public function update(Request $request, $id)
    {
        $coordinador = Coordinador::find($id);

        if (!$coordinador) {
            return response()->json(['message' => 'Coordinador no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombres' => 'sometimes|string|min:2',
            'apellido_paterno' => 'sometimes|string|min:2',
            'apellido_materno' => 'sometimes|string|min:2',
            'titulo_profesional' => 'nullable|string',
            'genero' => 'sometimes|in:M,F',
            'dni' => 'nullable|string|size:8|unique:coordinadores,dni,' . $id,
            'numero_telefono' => 'nullable|string',
            'tipo_coordinador' => 'sometimes|in:interno,externo',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coordinador->update($request->all());
        return response()->json(['data' => $coordinador, 'message' => 'Coordinador actualizado exitosamente']);
    }

    public function destroy($id)
    {
        $coordinador = Coordinador::find($id);

        if (!$coordinador) {
            return response()->json(['message' => 'Coordinador no encontrado'], 404);
        }

        $coordinador->delete();
        return response()->json(['message' => 'Coordinador eliminado exitosamente']);
    }
}
