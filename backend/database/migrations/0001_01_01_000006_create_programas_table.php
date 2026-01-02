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
        Schema::create('programas', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('grado_id')
                ->constrained('grados')
                ->onDelete('cascade');

            $table->foreignId('facultad_id')
                ->nullable()
                ->constrained('facultads')
                ->onDelete('set null');

            // Datos del programa
            $table->string('nombre');
            $table->string('periodo'); // "2024-II", "2025-I"
            $table->text('descripcion')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('grado_id');
            $table->index('facultad_id');
            $table->index('periodo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programas');
    }
};
