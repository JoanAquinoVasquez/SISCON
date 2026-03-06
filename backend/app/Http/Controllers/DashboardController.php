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
        $pagosTotal = PagoDocente::count();

        // Los pagos docente tienen su estado a través del expediente relacionado
        $pagosPorEstado = DB::table('pagos_docentes')
            ->join('expedientes', 'expedientes.pago_docente_id', '=', 'pagos_docentes.id')
            ->select('expedientes.estado', DB::raw('count(distinct pagos_docentes.id) as total'))
            ->whereNull('pagos_docentes.deleted_at')
            ->whereNull('expedientes.deleted_at')
            ->groupBy('expedientes.estado')
            ->pluck('total', 'estado')
            ->toArray();

        // Pagos sin expediente (pendientes de tramitar) 
        $pagosSinExpediente = PagoDocente::doesntHave('expedientes')->count();

        // Importe total de pagos docentes
        $importeTotal = PagoDocente::sum('importe_total');

        // Importes pagados (completados)
        $importePagado = DB::table('pagos_docentes')
            ->join('expedientes', 'expedientes.pago_docente_id', '=', 'pagos_docentes.id')
            ->where('expedientes.estado', 'completado')
            ->whereNull('pagos_docentes.deleted_at')
            ->whereNull('expedientes.deleted_at')
            ->sum('pagos_docentes.importe_total');

        // Pagos por tipo de docente
        $pagosPorTipoDocente = DB::table('pagos_docentes')
            ->join('docentes', 'pagos_docentes.docente_id', '=', 'docentes.id')
            ->select('docentes.tipo_docente', DB::raw('count(*) as total'))
            ->whereNull('pagos_docentes.deleted_at')
            ->groupBy('docentes.tipo_docente')
            ->pluck('total', 'tipo_docente')
            ->toArray();

        // ─────────────────────────────────────────
        // 3. DEVOLUCIONES
        // ─────────────────────────────────────────
        $devolucionesTotal = Devolucion::count();

        $devolucionesPorEstado = DB::table('devoluciones')
            ->join('expedientes', 'expedientes.devolucion_id', '=', 'devoluciones.id')
            ->select('expedientes.estado', DB::raw('count(distinct devoluciones.id) as total'))
            ->whereNull('devoluciones.deleted_at')
            ->whereNull('expedientes.deleted_at')
            ->groupBy('expedientes.estado')
            ->pluck('total', 'estado')
            ->toArray();

        $devolucionesPorTipo = Devolucion::select('tipo_devolucion', DB::raw('count(*) as total'))
            ->groupBy('tipo_devolucion')
            ->pluck('total', 'tipo_devolucion')
            ->toArray();

        $importeTotalDevoluciones = Devolucion::sum('importe');

        // ─────────────────────────────────────────
        // 4. DOCENTES
        // ─────────────────────────────────────────
        $docentesTotal = Docente::count();

        $docentesPorTipo = Docente::select('tipo_docente', DB::raw('count(*) as total'))
            ->groupBy('tipo_docente')
            ->pluck('total', 'tipo_docente')
            ->toArray();

        // ─────────────────────────────────────────
        // 5. CATÁLOGO ACADÉMICO
        // ─────────────────────────────────────────
        $programasTotal = Programa::count();
        $cursosTotal = Curso::count();

        // ─────────────────────────────────────────
        // 6. KPIs DE RENDIMIENTO
        // ─────────────────────────────────────────

        // Tasa de completado de expedientes
        $tasaCompletado = $expedientesTotal > 0
            ? round(($expedientesPorEstado['completado'] ?? 0) / $expedientesTotal * 100, 1)
            : 0;

        // Tasa de completado de pagos
        $tasaPagosCompletados = $pagosTotal > 0
            ? round((($pagosPorEstado['completado'] ?? 0)) / $pagosTotal * 100, 1)
            : 0;

        // Expedientes en proceso (pendiente + en_proceso)
        $expedientesActivos = ($expedientesPorEstado['pendiente'] ?? 0) + ($expedientesPorEstado['en_proceso'] ?? 0);

        // Promedio importe por pago docente
        $promedioImportePago = $pagosTotal > 0 ? round($importeTotal / $pagosTotal, 2) : 0;

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
                'total' => $pagosTotal,
                'por_estado' => $pagosPorEstado,
                'por_tipo_docente' => $pagosPorTipoDocente,
                'sin_expediente' => $pagosSinExpediente,
                'importe_total' => $importeTotal,
                'importe_pagado' => $importePagado,
                'promedio_importe' => $promedioImportePago,
                'tasa_completados' => $tasaPagosCompletados,
            ],
            'devoluciones' => [
                'total' => $devolucionesTotal,
                'por_estado' => $devolucionesPorEstado,
                'por_tipo' => $devolucionesPorTipo,
                'importe_total' => $importeTotalDevoluciones,
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
