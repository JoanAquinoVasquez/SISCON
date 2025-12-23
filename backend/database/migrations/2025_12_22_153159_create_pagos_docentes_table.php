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
        Schema::create('pagos_docentes', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('docente_id')->constrained('docentes')->onDelete('cascade');
            $table->foreignId('programa_id')->constrained('programas')->onDelete('cascade');
            $table->string('periodo'); // "2024-II", "2025-I"

            // Datos automáticos del programa
            $table->string('facultad_nombre')->nullable();
            $table->string('director_nombre')->nullable();
            $table->string('coordinador_nombre')->nullable();

            // Cálculos
            $table->decimal('numero_horas', 10, 2);
            $table->decimal('costo_por_hora', 10, 2);
            $table->decimal('importe_total', 10, 2);
            $table->text('importe_letras')->nullable();

            // Fechas de enseñanza (JSON array)
            $table->json('fechas_ensenanza')->nullable();

            // Documentos comunes
            $table->string('numero_informe_final')->nullable();
            $table->text('numero_informe_final_url')->nullable();

            // Documentos INTERNOS (solo si docente es interno)
            $table->string('numero_oficio_presentacion_facultad')->nullable();
            $table->text('numero_oficio_presentacion_facultad_url')->nullable();
            $table->string('numero_oficio_presentacion_coordinador')->nullable();
            $table->text('numero_oficio_presentacion_coordinador_url')->nullable();
            $table->string('numero_oficio_conformidad_facultad')->nullable();
            $table->text('numero_oficio_conformidad_facultad_url')->nullable();
            $table->string('numero_oficio_conformidad_coordinador')->nullable();
            $table->text('numero_oficio_conformidad_coordinador_url')->nullable();
            $table->string('numero_oficio_conformidad_direccion')->nullable();
            $table->text('numero_oficio_conformidad_direccion_url')->nullable();
            $table->string('numero_resolucion')->nullable();
            $table->text('numero_resolucion_url')->nullable();
            $table->date('fecha_resolucion')->nullable();
            $table->string('numero_oficio_contabilidad')->nullable();
            $table->text('numero_oficio_contabilidad_url')->nullable();
            $table->date('fecha_oficio_contabilidad')->nullable();

            // Documentos EXTERNOS (solo si docente es externo)
            $table->boolean('tiene_retencion_8_porciento')->nullable();
            $table->string('numero_recibo_honorario')->nullable();
            $table->text('numero_recibo_honorario_url')->nullable();
            $table->date('fecha_recibo_honorario')->nullable();
            $table->string('numero_pedido_servicio')->nullable();
            $table->text('numero_pedido_servicio_url')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['docente_id', 'periodo']);
            $table->index(['programa_id', 'periodo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos_docentes');
    }
};
