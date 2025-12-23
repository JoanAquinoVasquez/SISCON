<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CursoController extends Controller
{
    public function index()
    {
        $cursos = Curso::with(['semestres', 'semestres.programa'])->get();
        return response()->json(['data' => $cursos]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'semestre_ids' => 'required|array',
            'semestre_ids.*' => 'exists:semestres,id',
            'nombre' => 'required|string|min:3',
            'codigo' => 'required|string|unique:cursos,codigo',
            'creditos' => 'nullable|integer|min:1',
            'horas_teoricas' => 'nullable|integer|min:0',
            'horas_practicas' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $curso = Curso::create($request->except('semestre_ids'));
        $curso->semestres()->attach($request->semestre_ids);

        return response()->json(['data' => $curso->load('semestres'), 'message' => 'Curso creado exitosamente'], 201);
    }

    public function show($id)
    {
        $curso = Curso::with(['semestres', 'semestres.programa'])->find($id);

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
            'semestre_ids' => 'sometimes|array',
            'semestre_ids.*' => 'exists:semestres,id',
            'nombre' => 'sometimes|string|min:3',
            'codigo' => 'sometimes|string|unique:cursos,codigo,' . $id,
            'creditos' => 'nullable|integer|min:1',
            'horas_teoricas' => 'nullable|integer|min:0',
            'horas_practicas' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $curso->update($request->except('semestre_ids'));

        if ($request->has('semestre_ids')) {
            $curso->semestres()->sync($request->semestre_ids);
        }

        return response()->json(['data' => $curso->load('semestres'), 'message' => 'Curso actualizado exitosamente']);
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
