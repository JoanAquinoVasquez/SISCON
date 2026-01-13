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
            $table->string('oficio_direccion_exp_docentes')->nullable()->after('numero_oficio_conformidad_direccion');
            $table->string('oficio_direccion_exp_docentes_url')->nullable()->after('oficio_direccion_exp_docentes');
        });

        Schema::table('docentes', function (Blueprint $table) {
            $table->date('fecha_nacimiento')->nullable()->after('genero');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pagos_docentes', function (Blueprint $table) {
            $table->dropColumn(['oficio_direccion_exp_docentes', 'oficio_direccion_exp_docentes_url']);
        });

        Schema::table('docentes', function (Blueprint $table) {
            $table->dropColumn('fecha_nacimiento');
        });
    }
};
