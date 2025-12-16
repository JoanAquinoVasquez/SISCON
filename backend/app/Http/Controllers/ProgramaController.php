<?php

namespace App\Http\Controllers;

use App\Models\Programa;
use Illuminate\Http\Request;

class ProgramaController extends Controller
{
    public function index()
    {
        // Eager loading para evitar N+1 queries
        return Programa::with('grado')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'grado_id' => 'required|exists:grados,id',
            'nombre' => 'required|string',
            'periodo' => 'required|string' // 2024-I
        ]);

        $programa = Programa::create($validated);
        return response()->json($programa, 201);
    }
}