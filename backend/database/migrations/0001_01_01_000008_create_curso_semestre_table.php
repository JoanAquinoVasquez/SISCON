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
        Schema::create('curso_semestre', function (Blueprint $table) {
            $table->id();

            $table->foreignId('curso_id')
                ->constrained('cursos')
                ->onDelete('cascade');

            $table->foreignId('semestre_id')
                ->constrained('semestres')
                ->onDelete('cascade');

            $table->timestamps();

            // Evitar duplicados
            $table->unique(['curso_id', 'semestre_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curso_semestre');
    }
};
