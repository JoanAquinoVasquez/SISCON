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
        Schema::create('coordinadores', function (Blueprint $table) {
            $table->id();

            // Datos personales
            $table->string('nombres');
            $table->string('apellido_paterno');
            $table->string('apellido_materno');
            $table->enum('genero', ['M', 'F', 'Otro'])->nullable();
            $table->string('dni', 8)->unique();
            $table->string('numero_telefono', 20)->nullable();

            // Clasificación
            $table->enum('tipo_coordinador', ['interno', 'externo']);

            $table->timestamps();
            $table->softDeletes();

            $table->index('tipo_coordinador');
            $table->index('dni');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coordinadores');
    }
};
