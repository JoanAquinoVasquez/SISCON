<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Synchronize states from related tables to expedientes
        // For Pago Docente
        \DB::table('expedientes')
            ->join('pagos_docentes', 'expedientes.pago_docente_id', '=', 'pagos_docentes.id')
            ->where('expedientes.estado', 'pendiente')
            ->update(['expedientes.estado' => \DB::raw('pagos_docentes.estado')]);

        // For Devoluciones
        \DB::table('expedientes')
            ->join('devoluciones', 'expedientes.devolucion_id', '=', 'devoluciones.id')
            ->where('expedientes.estado', 'pendiente')
            ->update(['expedientes.estado' => \DB::raw('devoluciones.estado')]);

        // 2. Remove estado column from related tables
        Schema::table('pagos_docentes', function (Blueprint $table) {
            $table->dropColumn('estado');
        });

        Schema::table('devoluciones', function (Blueprint $table) {
            $table->dropColumn('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pagos_docentes', function (Blueprint $table) {
            $table->enum('estado', ['pendiente', 'en_proceso', 'completado'])->default('pendiente');
        });

        Schema::table('devoluciones', function (Blueprint $table) {
            $table->enum('estado', ['pendiente', 'aprobado', 'rechazado', 'observado'])->default('pendiente');
        });
    }
};
