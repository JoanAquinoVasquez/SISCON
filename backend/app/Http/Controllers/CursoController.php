<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CursoController extends Controller
{
    public function index()
    {
        $cursos = Curso::with(['semestre', 'semestre.programa'])->get();
        return response()->json(['data' => $cursos]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'semestre_id' => 'required|exists:semestres,id',
            'nombre' => 'required|string|min:3',
            'codigo' => 'nullable|string',
            'creditos' => 'nullable|integer|min:1',
            'horas_teoricas' => 'nullable|integer|min:0',
            'horas_practicas' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $curso = Curso::create($request->all());
        return response()->json(['data' => $curso, 'message' => 'Curso creado exitosamente'], 201);
    }

    public function show($id)
    {
        $curso = Curso::with(['semestre', 'semestre.programa'])->find($id);

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        return response()->json(['data' => $curso]);
    }

    public function update(Request $request, $id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'semestre_id' => 'sometimes|exists:semestres,id',
            'nombre' => 'sometimes|string|min:3',
            'codigo' => 'nullable|string',
            'creditos' => 'nullable|integer|min:1',
            'horas_teoricas' => 'nullable|integer|min:0',
            'horas_practicas' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $curso->update($request->all());
        return response()->json(['data' => $curso, 'message' => 'Curso actualizado exitosamente']);
    }

    public function destroy($id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        $curso->delete();
        return response()->json(['message' => 'Curso eliminado exitosamente']);
    }
}
