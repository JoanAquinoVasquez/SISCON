<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\AsignacionDocenciaController;
use App\Http\Controllers\PagoCoordinadorController;
use App\Http\Controllers\ProgramaController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\GradoController;
use App\Http\Controllers\SemestreController;


// 1. Auth Pública
Route::get('/', function () {
    return response()->json(['message' => 'Bienvenido a la API del Sistema de Contabilidad']);
});

Route::post('auth/login', [AuthController::class, 'login']);

// 2. Rutas Protegidas (JWT)
Route::middleware('auth:api')->group(function () {

    Route::post('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Mantenimiento Académico
    Route::apiResource('grados', GradoController::class);
    Route::apiResource('programas', ProgramaController::class);
    Route::apiResource('semestres', SemestreController::class);
    Route::apiResource('cursos', CursoController::class);

    // Gestión Docente
    Route::apiResource('docentes', DocenteController::class);

    // Procesos (Pagos y Asignaciones)
    Route::apiResource('asignaciones', AsignacionDocenciaController::class);
    Route::apiResource('pagos-coordinadores', PagoCoordinadorController::class);
});
