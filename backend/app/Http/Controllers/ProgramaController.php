<?php

namespace App\Http\Controllers;

use App\Models\Programa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProgramaController extends Controller
{
    public function index()
    {
        $programas = Programa::with(['grado', 'facultad'])->get();
        return response()->json(['data' => $programas]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'grado_id' => 'required|exists:grados,id',
            'facultad_id' => 'nullable|exists:facultads,id',
            'nombre' => 'required|string|min:3',
            'periodo' => 'nullable|string',
            'descripcion' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $programa = Programa::create($request->all());
        return response()->json(['data' => $programa, 'message' => 'Programa creado exitosamente'], 201);
    }

    public function show($id)
    {
        $programa = Programa::with(['grado', 'facultad'])->find($id);

        if (!$programa) {
            return response()->json(['message' => 'Programa no encontrado'], 404);
        }

        return response()->json(['data' => $programa]);
    }

    public function update(Request $request, $id)
    {
        $programa = Programa::find($id);

        if (!$programa) {
            return response()->json(['message' => 'Programa no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'grado_id' => 'sometimes|exists:grados,id',
            'facultad_id' => 'nullable|exists:facultads,id',
            'nombre' => 'sometimes|string|min:3',
            'periodo' => 'nullable|string',
            'descripcion' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $programa->update($request->all());
        return response()->json(['data' => $programa, 'message' => 'Programa actualizado exitosamente']);
    }

    public function destroy($id)
    {
        $programa = Programa::find($id);

        if (!$programa) {
            return response()->json(['message' => 'Programa no encontrado'], 404);
        }

        $programa->delete();
        return response()->json(['message' => 'Programa eliminado exitosamente']);
    }
}