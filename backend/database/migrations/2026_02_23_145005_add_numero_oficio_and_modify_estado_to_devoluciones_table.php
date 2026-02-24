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
        Schema::table('devoluciones', function (Blueprint $table) {
            $table->string('numero_oficio_direccion')->nullable()->after('numero_voucher');
        });

        // Modifying ENUM using raw SQL to be safe
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE devoluciones MODIFY COLUMN estado ENUM('pendiente', 'aprobado', 'rechazado', 'observado') DEFAULT 'pendiente'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devoluciones', function (Blueprint $table) {
            $table->dropColumn('numero_oficio_direccion');
        });

        // Reverting the ENUM
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE devoluciones MODIFY COLUMN estado ENUM('pendiente', 'aprobado', 'rechazado', 'procesado') DEFAULT 'pendiente'");
    }
};
