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
        Schema::create('devoluciones', function (Blueprint $table) {
            $table->id();

            // Información de la persona
            $table->string('persona');
            $table->string('dni');

            // Programa y proceso
            $table->foreignId('programa_id')->constrained('programas')->onDelete('cascade');
            $table->string('proceso_admision');

            // Tipo y monto
            $table->enum('tipo_devolucion', ['inscripcion', 'idiomas', 'grados_titulos']);
            $table->decimal('importe', 10, 2);
            $table->string('numero_voucher');

            // Estado y seguimiento
            $table->enum('estado', ['pendiente', 'aprobado', 'rechazado', 'procesado'])->default('pendiente');
            $table->text('observaciones')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devoluciones');
    }
};
