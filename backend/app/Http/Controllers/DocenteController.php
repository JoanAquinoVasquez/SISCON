<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use Illuminate\Http\Request;

class DocenteController extends Controller
{
    public function index(Request $request)
    {
        $query = Docente::query();

        // Filtros útiles para tu frontend
        if ($request->has('dni')) {
            $query->where('dni', 'like', "%{$request->dni}%");
        }
        if ($request->has('categoria')) {
            $query->where('categoria', $request->categoria);
        }

        return $query->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombres' => 'required|string',
            'ap_paterno' => 'required|string',
            'ap_materno' => 'required|string',
            'dni' => 'required|unique:docentes,dni',
            'genero' => 'required',
            'condicion' => 'required|in:INTERNO,EXTERNO',
            'categoria' => 'required|in:REGULAR,ENFERMERIA',
            'lugar_procedencia' => 'required|string',
            'numero_celular' => 'nullable|string'
        ]);

        $docente = Docente::create($validated);
        return response()->json($docente, 201);
    }

    public function show(Docente $docente)
    {
        return $docente->load('asignaciones'); // Ver historial del docente
    }

    // Métodos update y destroy...
}
