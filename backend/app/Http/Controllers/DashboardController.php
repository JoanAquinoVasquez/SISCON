<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Expediente;
use App\Models\PagoDocente;
use App\Models\Devolucion;
use App\Models\Docente;
use App\Models\User;
use App\Models\Programa;
use App\Models\Curso;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        // ─────────────────────────────────────────
        // 1. EXPEDIENTES
        // ─────────────────────────────────────────
        $expedientesTotal = Expediente::count();

        $expedientesPorEstado = Expediente::select('estado', DB::raw('count(*) as total'))
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->toArray();

        $expedientesPorTipoAsunto = Expediente::select('tipo_asunto', DB::raw('count(*) as total'))
            ->groupBy('tipo_asunto')
            ->pluck('total', 'tipo_asunto')
            ->toArray();

        // Expedientes por usuario (top 10)
        $expedientesPorUsuario = DB::table('expedientes')
            ->join('users', 'expedientes.user_id', '=', 'users.id')
            ->select('users.name', DB::raw('count(*) as total'))
            ->whereNull('expedientes.deleted_at')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        // Expedientes creados en los últimos 30 días
        $expedientesUltimos30Dias = Expediente::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        // Expedientes creados este mes
        $expedientesEsteMes = Expediente::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // ─────────────────────────────────────────
        // 2. PAGOS DOCENTES
        // ─────────────────────────────────────────
        // 2. Pagos Docentes
        $totalPagos = PagoDocente::count();
        
        $pagosPorEstado = DB::table('pagos_docentes')
            ->join('expedientes', 'expedientes.pago_docente_id', '=', 'pagos_docentes.id')
            ->whereNull('pagos_docentes.deleted_at')
            ->whereNull('expedientes.deleted_at')
            ->select('expedientes.estado', DB::raw('count(distinct pagos_docentes.id) as total'))
            ->groupBy('expedientes.estado')
            ->get()
            ->pluck('total', 'estado')
            ->toArray();

        $importeTotal = PagoDocente::sum('importe_total');
        
        $importePagado = DB::table('pagos_docentes')
            ->join('expedientes', 'expedientes.pago_docente_id', '=', 'pagos_docentes.id')
            ->where('expedientes.estado', 'completado')
            ->whereNull('pagos_docentes.deleted_at')
            ->whereNull('expedientes.deleted_at')
            ->sum('pagos_docentes.importe_total');

        $pagosSinExpediente = PagoDocente::doesntHave('expedientes')->count();

        $pagosPorTipoDocente = DB::table('pagos_docentes')
            ->join('docentes', 'pagos_docentes.docente_id', '=', 'docentes.id')
            ->select('docentes.tipo_docente', DB::raw('count(*) as total'))
            ->whereNull('pagos_docentes.deleted_at')
            ->groupBy('docentes.tipo_docente')
            ->pluck('total', 'tipo_docente')
            ->toArray();

        $pagosRaw = DB::table('pagos_docentes')
            ->join('docentes', 'pagos_docentes.docente_id', '=', 'docentes.id')
            ->select('docentes.tipo_docente', 'pagos_docentes.facultad_nombre')
            ->whereNull('pagos_docentes.deleted_at')
            ->get();

        $pagosPorHoja = ['Internos' => 0, 'Internos FE' => 0, 'Externos' => 0, 'Externos FE' => 0];
        foreach ($pagosRaw as $p) {
            $tipo = strtolower($p->tipo_docente ?? '');
            $esFE = str_contains($p->facultad_nombre ?? '', 'Enfermería');
            if (str_contains($tipo, 'interno')) {
                $esFE ? $pagosPorHoja['Internos FE']++ : $pagosPorHoja['Internos']++;
            } elseif (str_contains($tipo, 'externo')) {
                $esFE ? $pagosPorHoja['Externos FE']++ : $pagosPorHoja['Externos']++;
            }
        }

        // 3. Devoluciones
        $totalDevoluciones = Devolucion::count();
        $importeTotalDevoluciones = Devolucion::sum('importe');

        $importePagadoDevoluciones = DB::table('devoluciones')
            ->join('expedientes', 'expedientes.devolucion_id', '=', 'devoluciones.id')
            ->where('expedientes.estado', 'completado')
            ->whereNull('devoluciones.deleted_at')
            ->whereNull('expedientes.deleted_at')
            ->sum('devoluciones.importe');

        $devolucionesPorEstado = DB::table('devoluciones')
            ->join('expedientes', 'expedientes.devolucion_id', '=', 'devoluciones.id')
            ->whereNull('devoluciones.deleted_at')
            ->whereNull('expedientes.deleted_at')
            ->select('expedientes.estado', DB::raw('count(distinct devoluciones.id) as total'))
            ->groupBy('expedientes.estado')
            ->get()
            ->pluck('total', 'estado')
            ->toArray();

        $devolucionesPorTipo = Devolucion::select('tipo_devolucion', DB::raw('count(*) as total'))
            ->groupBy('tipo_devolucion')
            ->pluck('total', 'tipo_devolucion')
            ->toArray();

        // ─────────────────────────────────────────
        // 4. DOCENTES
        // ─────────────────────────────────────────
        $docentesTotal = Docente::count();

        $docentesPorTipo = Docente::select('tipo_docente', DB::raw('count(*) as total'))
            ->groupBy('tipo_docente')
            ->pluck('total', 'tipo_docente')
            ->toArray();

        $programasTotal = Programa::count();
        $cursosTotal = Curso::count();

        // ─────────────────────────────────────────
        // 6. RESUMEN FINANCIERO CONSOLIDADO
        // ─────────────────────────────────────────
        $totalGeneral = $importeTotal + $importeTotalDevoluciones;
        $totalPagado = $importePagado + $importePagadoDevoluciones;
        $totalPendiente = $totalGeneral - $totalPagado;
        $porcentajeEjecucion = $totalGeneral > 0 ? round(($totalPagado / $totalGeneral) * 100, 1) : 0;

        // ─────────────────────────────────────────
        // 6. KPIs DE RENDIMIENTO
        // ─────────────────────────────────────────

        // Tasa de completado de expedientes
        $tasaCompletado = $expedientesTotal > 0
            ? round(($expedientesPorEstado['completado'] ?? 0) / $expedientesTotal * 100, 1)
            : 0;

        // Tasa de completado de pagos
        $tasaPagosCompletados = $totalPagos > 0
            ? round((($pagosPorEstado['completado'] ?? 0)) / $totalPagos * 100, 1)
            : 0;

        // Expedientes en proceso (pendiente + en_proceso)
        $expedientesActivos = ($expedientesPorEstado['pendiente'] ?? 0) + ($expedientesPorEstado['en_proceso'] ?? 0);

        // Promedio importe por pago docente
        $promedioImportePago = $totalPagos > 0 ? round($importeTotal / $totalPagos, 2) : 0;

        // ─────────────────────────────────────────
        // 7. ACTIVIDAD RECIENTE (últimos 7 días)
        // ─────────────────────────────────────────
        $expedientesRecientes = Expediente::where('created_at', '>=', Carbon::now()->subDays(7))
            ->with(['user:id,name'])
            ->select('id', 'numero_expediente_mesa_partes', 'tipo_asunto', 'estado', 'user_id', 'created_at')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'resumen_financiero' => [
                'total_general' => $totalGeneral,
                'total_pagado' => $totalPagado,
                'total_pendiente' => $totalPendiente,
                'porcentaje_ejecucion' => $porcentajeEjecucion,
            ],
            'expedientes' => [
                'total' => $expedientesTotal,
                'por_estado' => $expedientesPorEstado,
                'por_tipo_asunto' => $expedientesPorTipoAsunto,
                'por_usuario' => $expedientesPorUsuario,
                'ultimos_30_dias' => $expedientesUltimos30Dias,
                'este_mes' => $expedientesEsteMes,
                'activos' => $expedientesActivos,
                'tasa_completado' => $tasaCompletado,
            ],
            'pagos_docentes' => [
                'total' => $totalPagos,
                'por_estado' => $pagosPorEstado,
                'por_tipo_docente' => $pagosPorTipoDocente,
                'por_hoja' => $pagosPorHoja,
                'sin_expediente' => $pagosSinExpediente,
                'importe_total' => $importeTotal,
                'importe_pagado' => $importePagado,
                'promedio_importe' => $promedioImportePago,
                'tasa_completados' => $tasaPagosCompletados,
            ],
            'devoluciones' => [
                'total' => $totalDevoluciones,
                'por_estado' => $devolucionesPorEstado,
                'por_tipo' => $devolucionesPorTipo,
                'importe_total' => $importeTotalDevoluciones,
                'importe_pagado' => $importePagadoDevoluciones,
            ],
            'catalogo' => [
                'docentes_total' => $docentesTotal,
                'docentes_por_tipo' => $docentesPorTipo,
                'programas_total' => $programasTotal,
                'cursos_total' => $cursosTotal,
            ],
            'reciente' => [
                'expedientes' => $expedientesRecientes,
            ],
        ]);
    }
}
