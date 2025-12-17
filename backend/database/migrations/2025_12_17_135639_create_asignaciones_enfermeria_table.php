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
        Schema::create('asignaciones_enfermeria', function (Blueprint $table) {
            $table->id();

            // Referencias
            $table->foreignId('docente_id')->constrained('docentes')->onDelete('cascade');
            $table->foreignId('curso_id')->constrained('cursos')->onDelete('cascade');

            // Horas
            $table->decimal('horas_teoricas', 8, 2)->default(0);
            $table->decimal('horas_practicas', 8, 2)->default(0);
            $table->decimal('total_horas', 8, 2)->default(0);

            // Fechas de clase (JSON array)
            $table->json('fechas_clase')->nullable();

            // Periodo de pago
            $table->string('mes_pago'); // Ej: "Enero 2024"
            $table->date('fecha_emision_rh')->nullable(); // Fecha emisión Recibo por Honorarios

            // Costos y montos
            $table->decimal('costo_por_hora', 10, 2);
            $table->decimal('importe', 10, 2);
            $table->decimal('essalud_9_porciento', 10, 2)->default(0);
            $table->decimal('monto_neto', 10, 2);

            // Documentación administrativa específica de enfermería
            $table->string('nota_pago')->nullable();
            $table->string('registro_siaf')->nullable();
            $table->string('orden_servicio')->nullable();
            $table->string('pedido_servicio')->nullable();
            $table->string('recibo_honorarios')->nullable();
            $table->string('numero_resolucion')->unique();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['docente_id', 'curso_id']);
            $table->index('numero_resolucion');
            $table->index('mes_pago');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asignaciones_enfermeria');
    }
};
