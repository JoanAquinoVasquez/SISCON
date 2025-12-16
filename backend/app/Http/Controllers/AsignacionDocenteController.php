<?php

namespace App\Http\Controllers;

use App\Models\AsignacionDocencia;
use App\Http\Requests\StoreAsignacionRequest;
use Illuminate\Http\Request;

class AsignacionDocenciaController extends Controller
{
    public function index()
    {
        // Traemos relaciones para mostrar en tabla
        return AsignacionDocencia::with(['docente', 'curso.semestre.programa'])->paginate(10);
    }

    public function store(StoreAsignacionRequest $request)
    {
        $data = $request->validated();

        // 1. Cálculos Automáticos
        $totalHoras = $data['horas_teoricas'] + $data['horas_practicas'];
        $montoBruto = $totalHoras * $data['costo_hora'];

        // EsSalud 9%
        $essalud = $montoBruto * 0.09;
        $montoNeto = $montoBruto - $essalud;

        // Inyectamos los cálculos al array de datos
        $data['total_horas'] = $totalHoras;
        $data['monto_bruto'] = $montoBruto;
        $data['essalud'] = $essalud;
        $data['monto_neto'] = $montoNeto;

        // 2. Creación
        $asignacion = AsignacionDocencia::create($data);

        return response()->json([
            'message' => 'Asignación creada y montos calculados correctamente',
            'data' => $asignacion
        ], 201);
    }

    public function show(AsignacionDocencia $asignacion)
    {
        return $asignacion->load(['docente', 'curso']);
    }

    public function update(Request $request, AsignacionDocencia $asignacion)
    {
        // Lógica similar al store, recalculando si cambian horas o costo
        // ...
        return response()->json($asignacion);
    }

    public function destroy(AsignacionDocencia $asignacion)
    {
        $asignacion->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }
}
