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
use App\Http\Controllers\PagoDocenteController;
use App\Http\Controllers\ExpedienteController;
use App\Http\Controllers\DevolucionController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\OficioController;

/*
|--------------------------------------------------------------------------
| API Routes 
|--------------------------------------------------------------------------
*/

// Public Routes
Route::get('/', function () {
    return response()->json([
        'message' => 'Bienvenido a la API del Sistema de Contabilidad (SISCON)',
        'version' => '1.0.0',
        'auth' => 'Google Authentication',
        'status' => 'active'
    ]);
});



// Authentication Routes
Route::get('auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Protected Routes (Require Sanctum Authentication)
Route::middleware('auth:sanctum')->group(function () {

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

    // Pagos de Docentes - Rutas de búsqueda con prefijo para evitar conflictos
    Route::get('pagos-docentes/buscar-docente', [PagoDocenteController::class, 'buscarDocentes']);
    Route::get('pagos-docentes/buscar-programa', [PagoDocenteController::class, 'buscarProgramas']);
    Route::get('pagos-docentes/programa/{id}/datos', [PagoDocenteController::class, 'obtenerDatosPrograma']);
    Route::get('pagos-docentes/buscar-curso', [PagoDocenteController::class, 'buscarCursos']);
    Route::get('pagos-docentes/curso/{id}/datos', [PagoDocenteController::class, 'obtenerDatosCurso']);
    Route::post('pagos-docentes/{id}/generar-resolucion', [PagoDocenteController::class, 'generateResolucion']);
    Route::post('pagos-docentes/{id}/generar-resolucion-aceptacion', [PagoDocenteController::class, 'generateResolucionAceptacion']);
    Route::post('pagos-docentes/{id}/generar-oficio', [PagoDocenteController::class, 'generateOficioContabilidad']);
    Route::get('pagos-docentes/exportar-excel', [PagoDocenteController::class, 'exportExcel']);
    Route::apiResource('pagos-docentes', PagoDocenteController::class);

    // File Upload
    Route::post('upload-documento', [FileUploadController::class, 'upload']);
    Route::post('delete-documento', [FileUploadController::class, 'delete']);

    // ========================================
    // Expedientes (Document Tracking)
    // ========================================

    // Expedientes - Rutas de búsqueda con prefijo para evitar conflictos
    Route::get('expedientes/buscar-docente', [ExpedienteController::class, 'buscarDocentes']);
    Route::get('expedientes/buscar-curso', [ExpedienteController::class, 'buscarCursos']);
    Route::get('expedientes/buscar-directores', [ExpedienteController::class, 'buscarDirectores']);
    Route::apiResource('expedientes', ExpedienteController::class);

    // ========================================
    // Devoluciones (Refunds)
    // ========================================

    Route::patch('devoluciones/{id}/estado', [DevolucionController::class, 'actualizarEstado']);
    Route::apiResource('devoluciones', DevolucionController::class);

    // ========================================
    // Administrative Documents
    // ========================================

    // Oficios
    Route::apiResource('oficios', OficioController::class);
    Route::get('oficios/{id}/pagos', [OficioController::class, 'pagos']);

    // ========================================
    // Documents (Oficios & Resoluciones)
    // ========================================
    Route::get('documentos/oficios', [App\Http\Controllers\DocumentoController::class, 'indexOficios']);
    Route::get('documentos/resoluciones', [App\Http\Controllers\DocumentoController::class, 'indexResoluciones']);
});
