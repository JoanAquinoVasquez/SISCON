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
        Schema::table('pagos_docentes', function (Blueprint $table) {
            $table->renameColumn('numero_resolucion', 'numero_resolucion_pago');
            $table->string('numero_resolucion_aprobacion')->nullable()->after('numero_oficio_conformidad_direccion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pagos_docentes', function (Blueprint $table) {
            $table->dropColumn('numero_resolucion_aprobacion');
            $table->renameColumn('numero_resolucion_pago', 'numero_resolucion');
        });
    }
};
