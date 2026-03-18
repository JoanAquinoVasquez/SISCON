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
        Schema::table('docentes', function (Blueprint $table) {
            // Agregar RUC (opcional, 20 dígitos) después del DNI
            $table->string('ruc', 20)->nullable()->after('dni');
            $table->index('ruc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('docentes', function (Blueprint $table) {
            $table->dropIndex(['ruc']);
            $table->dropColumn('ruc');
        });
    }
};
