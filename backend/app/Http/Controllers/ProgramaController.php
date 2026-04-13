<?php

namespace App\Http\Controllers;

use App\Models\Facultad;
use App\Models\Grado;
use App\Models\Programa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProgramaController extends Controller
{
    public function index(Request $request)
    {
        $query = Programa::with(['grado', 'facultad']);

        if ($request->has('grado_id')) {
            $query->where('grado_id', $request->grado_id);
        }

        if ($request->has('periodo')) {
            $query->where('periodo', $request->periodo);
        }

        if ($request->has('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }

        $programas = $query->orderBy('nombre')->get();
        return response()->json(['data' => $programas]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'grado_id'    => 'required|exists:grados,id',
            'facultad_id' => 'nullable|exists:facultads,id',
            'nombre'      => 'required|string|min:3',
            'periodo'     => ['required', 'string', 'regex:/^\d{4}-(I|II)$/'],
            'descripcion' => 'nullable|string',
        ], [
            'periodo.regex' => 'El periodo debe tener formato YYYY-I o YYYY-II (ej: 2025-I)',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verificar que no exista ya un programa con el mismo nombre, grado y periodo
        $existe = Programa::where('nombre', $request->nombre)
            ->where('grado_id', $request->grado_id)
            ->where('periodo', $request->periodo)
            ->whereNull('deleted_at')
            ->exists();

        if ($existe) {
            return response()->json([
                'errors' => [
                    'periodo' => ['Ya existe el programa "' . $request->nombre . '" para el periodo ' . $request->periodo . '.'],
                ],
            ], 422);
        }

        $programa = Programa::create($request->all());
        return response()->json([
            'data'    => $programa->load(['grado', 'facultad']),
            'message' => 'Programa creado exitosamente',
        ], 201);
    }

    public function show($id)
    {
        $programa = Programa::with(['grado', 'facultad', 'semestres'])->find($id);

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
            'grado_id'    => 'sometimes|exists:grados,id',
            'facultad_id' => 'nullable|exists:facultads,id',
            'nombre'      => 'sometimes|string|min:3',
            'periodo'     => 'sometimes|string|regex:/^\d{4}-[I|II]$/',
            'descripcion' => 'nullable|string',
        ], [
            'periodo.regex' => 'El periodo debe tener formato YYYY-I o YYYY-II (ej: 2025-I)',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $programa->update($request->all());
        return response()->json([
            'data'    => $programa->load(['grado', 'facultad']),
            'message' => 'Programa actualizado exitosamente',
        ]);
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

    public function coordinadores($id)
    {
        $programa = Programa::with('coordinadores')->find($id);

        if (!$programa) {
            return response()->json(['message' => 'Programa no encontrado'], 404);
        }

        return response()->json(['data' => $programa->coordinadores]);
    }

    public function semestres($id)
    {
        $programa = Programa::with(['semestres' => function ($q) {
            $q->orderBy('numero_semestre')->with('cursos');
        }])->find($id);

        if (!$programa) {
            return response()->json(['message' => 'Programa no encontrado'], 404);
        }

        return response()->json(['data' => $programa->semestres]);
    }

    public function cursos($id)
    {
        $programa = Programa::with(['semestres.cursos'])->find($id);

        if (!$programa) {
            return response()->json(['message' => 'Programa no encontrado'], 404);
        }

        // Aplanar todos los cursos de todos los semestres
        $cursos = $programa->semestres->flatMap(function ($semestre) {
            return $semestre->cursos->map(function ($curso) use ($semestre) {
                $curso->semestre_numero = $semestre->numero_semestre;
                $curso->semestre_nombre = $semestre->nombre;
                return $curso;
            });
        })->values();

        return response()->json(['data' => $cursos]);
    }

    public function grados()
    {
        return response()->json(['data' => Grado::orderBy('nombre')->get()]);
    }

    public function facultades()
    {
        return response()->json(['data' => Facultad::orderBy('nombre')->get()]);
    }
}