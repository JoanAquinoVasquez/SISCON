<?php

namespace App\Http\Controllers;

use App\Models\Facultad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FacultadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Facultad::query();

        if ($request->has('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%')
                  ->orWhere('codigo', 'like', '%' . $request->search . '%')
                  ->orWhere('director_nombre', 'like', '%' . $request->search . '%')
                  ->orWhere('director_telefono', 'like', '%' . $request->search . '%');
        }

        $facultades = $query->orderBy('nombre')->get();
        return response()->json(['data' => $facultades]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|unique:facultads,codigo|max:255',
            'director_nombre' => 'nullable|string|max:255',
            'director_genero' => 'nullable|in:M,F',
            'director_telefono' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $facultad = Facultad::create($request->all());

        return response()->json([
            'data' => $facultad,
            'message' => 'Unidad de Posgrado creada exitosamente'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $facultad = Facultad::find($id);

        if (!$facultad) {
            return response()->json(['message' => 'Unidad de Posgrado no encontrada'], 404);
        }

        return response()->json(['data' => $facultad]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $facultad = Facultad::find($id);

        if (!$facultad) {
            return response()->json(['message' => 'Unidad de Posgrado no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:255|unique:facultads,codigo,' . $id,
            'director_nombre' => 'nullable|string|max:255',
            'director_genero' => 'nullable|in:M,F',
            'director_telefono' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $facultad->update($request->all());

        return response()->json([
            'data' => $facultad,
            'message' => 'Unidad de Posgrado actualizada exitosamente'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $facultad = Facultad::find($id);

        if (!$facultad) {
            return response()->json(['message' => 'Unidad de Posgrado no encontrada'], 404);
        }

        $facultad->delete();

        return response()->json(['message' => 'Unidad de Posgrado eliminada exitosamente']);
    }
}
