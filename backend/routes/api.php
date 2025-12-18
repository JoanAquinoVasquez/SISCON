<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LugarProcedenciaController;
use App\Http\Controllers\GradoController;
use App\Http\Controllers\ProgramaController;
use App\Http\Controllers\SemestreController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\AsignacionDocenciaController;
use App\Http\Controllers\AsignacionEnfermeriaController;
use App\Http\Controllers\CoordinadorController;
use App\Http\Controllers\PagoCoordinadorController;
use App\Http\Controllers\OficioController;

/*
|--------------------------------------------------------------------------
| API Routes - Firebase Authentication
|--------------------------------------------------------------------------
*/

// Public Routes
Route::get('/', function () {
    return response()->json([
        'message' => 'Bienvenido a la API del Sistema de Contabilidad (SISCON)',
        'version' => '1.0.0',
        'auth' => 'Firebase Authentication',
        'status' => 'active'
    ]);
});

// Protected Routes (Require Firebase Authentication)
Route::middleware('firebase.auth')->group(function () {

    // Auth Management
    Route::get('auth/me', [AuthController::class, 'me']);

    // ========================================
    // User Management
    Route::apiResource('users', UserController::class);

    // ========================================
    // Academic Structure Management
    // ========================================

    // Lugares de Procedencia
    Route::apiResource('lugares-procedencia', LugarProcedenciaController::class);

    // Grados Académicos
    Route::apiResource('grados', GradoController::class);

    // Programas
    Route::apiResource('programas', ProgramaController::class);
    Route::get('programas/{id}/coordinadores', [ProgramaController::class, 'coordinadores']);
    Route::get('programas/{id}/semestres', [ProgramaController::class, 'semestres']);
    Route::get('programas/{id}/cursos', [ProgramaController::class, 'cursos']);

    // Semestres
    Route::apiResource('semestres', SemestreController::class);
    Route::get('semestres/{id}/cursos', [SemestreController::class, 'cursos']);

    // Cursos
    Route::apiResource('cursos', CursoController::class);
    Route::get('cursos/{id}/asignaciones', [CursoController::class, 'asignaciones']);

    // ========================================
    // Teachers Management
    // ========================================

    // Docentes
    Route::apiResource('docentes', DocenteController::class);
    Route::get('docentes-internos', [DocenteController::class, 'internos']);
    Route::get('docentes-externos', [DocenteController::class, 'externos']);
    Route::get('docentes-enfermeria', [DocenteController::class, 'enfermeria']);
    Route::get('docentes-regulares', [DocenteController::class, 'regulares']);

    // ========================================
    // Assignments & Payments
    // ========================================

    // Asignaciones de Docencia (Regular Teachers)
    Route::apiResource('asignaciones-docencia', AsignacionDocenciaController::class);
    Route::get('asignaciones-docencia/docente/{docente_id}', [AsignacionDocenciaController::class, 'byDocente']);
    Route::get('asignaciones-docencia/curso/{curso_id}', [AsignacionDocenciaController::class, 'byCurso']);

    // Asignaciones de Enfermería (Nursing Teachers)
    Route::apiResource('asignaciones-enfermeria', AsignacionEnfermeriaController::class);
    Route::get('asignaciones-enfermeria/docente/{docente_id}', [AsignacionEnfermeriaController::class, 'byDocente']);
    Route::get('asignaciones-enfermeria/curso/{curso_id}', [AsignacionEnfermeriaController::class, 'byCurso']);

    // ========================================
    // Coordinators Management
    // ========================================

    // Coordinadores
    Route::apiResource('coordinadores', CoordinadorController::class);
    Route::get('coordinadores-internos', [CoordinadorController::class, 'internos']);
    Route::get('coordinadores-externos', [CoordinadorController::class, 'externos']);
    Route::get('coordinadores/{id}/programas', [CoordinadorController::class, 'programas']);
    Route::post('coordinadores/{id}/asignar-programa', [CoordinadorController::class, 'asignarPrograma']);
    Route::delete('coordinadores/{id}/desasignar-programa/{programa_id}', [CoordinadorController::class, 'desasignarPrograma']);

    // Pagos de Coordinadores
    Route::apiResource('pagos-coordinadores', PagoCoordinadorController::class);
    Route::get('pagos-coordinadores/coordinador/{coordinador_id}', [PagoCoordinadorController::class, 'byCoordinador']);
    Route::get('pagos-coordinadores/programa/{programa_id}', [PagoCoordinadorController::class, 'byPrograma']);

    // ========================================
    // Administrative Documents
    // ========================================

    // Oficios
    Route::apiResource('oficios', OficioController::class);
    Route::get('oficios/{id}/pagos', [OficioController::class, 'pagos']);
});
