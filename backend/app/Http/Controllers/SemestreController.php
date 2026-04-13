<?php

namespace App\Http\Controllers;

use App\Models\Semestre;
use App\Models\Programa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SemestreController extends Controller
{
    public function index(Request $request)
    {
        $query = Semestre::with(['programa', 'programa.grado', 'cursos']);

        if ($request->has('programa_id')) {
            $query->where('programa_id', $request->programa_id);
        }

        $semestres = $query->orderBy('programa_id')->orderBy('numero_semestre')->get();
        return response()->json(['data' => $semestres]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'programa_id'      => 'required|exists:programas,id',
            'numero_semestre'  => 'required|integer|min:1|max:12',
            'nombre'           => 'required|string|min:2',
            'descripcion'      => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Evitar duplicados (programa_id + numero_semestre)
        $existe = Semestre::where('programa_id', $request->programa_id)
            ->where('numero_semestre', $request->numero_semestre)
            ->whereNull('deleted_at')
            ->exists();

        if ($existe) {
            return response()->json([
                'errors' => ['numero_semestre' => ['Ya existe el Semestre ' . $request->numero_semestre . ' para este programa.']],
            ], 422);
        }

        $semestre = Semestre::create($request->all());

        return response()->json([
            'data'    => $semestre->load(['programa', 'programa.grado']),
            'message' => 'Semestre creado exitosamente',
        ], 201);
    }

    public function show($id)
    {
        $semestre = Semestre::with(['programa', 'programa.grado', 'cursos'])->find($id);

        if (!$semestre) {
            return response()->json(['message' => 'Semestre no encontrado'], 404);
        }

        return response()->json(['data' => $semestre]);
    }

    public function update(Request $request, $id)
    {
        $semestre = Semestre::find($id);

        if (!$semestre) {
            return response()->json(['message' => 'Semestre no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'numero_semestre' => 'sometimes|integer|min:1|max:12',
            'nombre'          => 'sometimes|string|min:2',
            'descripcion'     => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $semestre->update($request->all());

        return response()->json([
            'data'    => $semestre->load(['programa', 'programa.grado']),
            'message' => 'Semestre actualizado exitosamente',
        ]);
    }

    public function destroy($id)
    {
        $semestre = Semestre::find($id);

        if (!$semestre) {
            return response()->json(['message' => 'Semestre no encontrado'], 404);
        }

        $semestre->delete();
        return response()->json(['message' => 'Semestre eliminado exitosamente']);
    }

    public function cursos($id)
    {
        $semestre = Semestre::with('cursos')->find($id);

        if (!$semestre) {
            return response()->json(['message' => 'Semestre no encontrado'], 404);
        }

        return response()->json(['data' => $semestre->cursos]);
    }

    public function byPrograma($programa_id)
    {
        $programa = Programa::find($programa_id);

        if (!$programa) {
            return response()->json(['message' => 'Programa no encontrado'], 404);
        }

        $semestres = Semestre::with('cursos')
            ->where('programa_id', $programa_id)
            ->whereNull('deleted_at')
            ->orderBy('numero_semestre')
            ->get();

        return response()->json(['data' => $semestres]);
    }
}
