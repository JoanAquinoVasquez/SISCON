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
        Schema::table('cursos', function (Blueprint $table) {
            $table->enum('tipo', ['regular', 'dirigido'])->default('regular')->after('nombre');
        });

        // Actualizar cursos con periodo menor a 2024 como 'dirigido'
        \DB::statement("
            UPDATE cursos c
            JOIN curso_semestre cs ON c.id = cs.curso_id
            JOIN semestres s ON cs.semestre_id = s.id
            JOIN programas p ON s.programa_id = p.id
            SET c.tipo = 'dirigido'
            WHERE CAST(LEFT(p.periodo, 4) AS UNSIGNED) < 2024
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cursos', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });
    }
};
