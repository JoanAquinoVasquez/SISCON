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
        Schema::create('pagos_coordinadores', function (Blueprint $table) {
            $table->id();

            // Referencias
            $table->foreignId('coordinador_id')->constrained('coordinadores')->onDelete('cascade');
            $table->foreignId('programa_id')->constrained('programas')->onDelete('cascade');

            // Periodo de pago
            $table->string('mes'); // Ej: "Enero", "Febrero"
            $table->integer('anio'); // Ej: 2024, 2025

            // Monto
            $table->decimal('importe', 10, 2);

            // Documentación administrativa
            $table->string('numero_resolucion')->nullable();
            $table->string('registro_siaf')->nullable();
            $table->string('pedido_servicio')->nullable();
            $table->string('recibo_honorarios')->nullable();
            $table->string('nce')->nullable(); // NCE
            $table->string('orden_servicio')->nullable();
            $table->string('comprobante_pago')->nullable();
            $table->string('nota_abono')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['coordinador_id', 'programa_id']);
            $table->index(['mes', 'anio']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos_coordinadores');
    }
};
