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
            // We use raw SQL because modifying ENUMs with Schema builder is not fully supported across all drivers
            // and requires doctrine/dbal which might not be installed or configured for enums.
            // Assuming MySQL/MariaDB which is standard for this stack.
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE docentes MODIFY COLUMN tipo_docente ENUM('interno', 'externo', 'interno_enfermeria', 'externo_enfermeria') NOT NULL");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('docentes', function (Blueprint $table) {
            // Revert to original enum
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE docentes MODIFY COLUMN tipo_docente ENUM('interno', 'externo') NOT NULL");
        });
    }
};
