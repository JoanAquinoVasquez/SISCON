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
            $table->renameColumn('numero_oficio_pago_direccion', 'numero_expediente_nota_pago');
            $table->renameColumn('numero_oficio_pago_direccion_url', 'numero_expediente_nota_pago_url');
            $table->renameColumn('fecha_pago', 'fecha_constancia_pago');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pagos_docentes', function (Blueprint $table) {
            $table->renameColumn('numero_expediente_nota_pago', 'numero_oficio_pago_direccion');
            $table->renameColumn('fecha_constancia_pago', 'fecha_pago');
        });
    }
};
