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
        Schema::create('semestres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('programa_id')->constrained('programas')->onDelete('cascade');
            $table->integer('numero_semestre'); // 1, 2, 3, etc.
            $table->string('nombre'); // Ej: "Primer Semestre", "Semestre I"
            $table->text('descripcion')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['programa_id', 'numero_semestre']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('semestres');
    }
};
