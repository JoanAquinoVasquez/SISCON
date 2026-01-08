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
            $table->string('nota_pago_2')->nullable()->after('nota_pago');
            $table->date('fecha_pago')->nullable()->after('nota_pago_2');
            $table->date('fecha_nota_pago')->nullable()->after('fecha_pago');
            $table->date('fecha_nota_pago_2')->nullable()->after('fecha_nota_pago');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pagos_docentes', function (Blueprint $table) {
            $table->dropColumn(['nota_pago_2', 'fecha_pago', 'fecha_nota_pago', 'fecha_nota_pago_2']);
        });
    }
};
