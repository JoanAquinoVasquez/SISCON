<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pagos_docentes', function (Blueprint $table) {
            if (!Schema::hasColumn('pagos_docentes', 'horas_teoricas')) {
                $table->decimal('horas_teoricas', 10, 2)->nullable()->after('costo_por_hora');
            }
            if (!Schema::hasColumn('pagos_docentes', 'horas_practicas')) {
                $table->decimal('horas_practicas', 10, 2)->nullable()->after('horas_teoricas');
            }
            if (!Schema::hasColumn('pagos_docentes', 'costo_hora_teorica')) {
                $table->decimal('costo_hora_teorica', 10, 2)->nullable()->after('horas_practicas');
            }
            if (!Schema::hasColumn('pagos_docentes', 'costo_hora_practica')) {
                $table->decimal('costo_hora_practica', 10, 2)->nullable()->after('costo_hora_teorica');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pagos_docentes', function (Blueprint $table) {
            $table->dropColumn(['horas_teoricas', 'horas_practicas', 'costo_hora_teorica', 'costo_hora_practica']);
        });
    }
};
