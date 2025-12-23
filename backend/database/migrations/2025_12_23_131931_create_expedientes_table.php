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
        Schema::create('expedientes', function (Blueprint $table) {
            $table->id();

            // Información del documento
            $table->string('numero_expediente_mesa_partes')->nullable();
            $table->string('numero_documento');
            $table->date('fecha_documento');
            $table->date('fecha_recepcion_contabilidad');
            $table->string('remitente'); // quien escribe

            // Tipo de asunto
            $table->enum('tipo_asunto', ['descripcion', 'presentacion', 'conformidad', 'resolucion']);
            $table->text('descripcion_asunto')->nullable();

            // Relación con docente/curso (para presentación/conformidad/resolución)
            $table->foreignId('docente_id')->nullable()->constrained('docentes')->onDelete('set null');
            $table->foreignId('curso_id')->nullable()->constrained('cursos')->onDelete('set null');
            $table->string('periodo')->nullable();
            $table->json('fechas_ensenanza')->nullable();

            // Relación con pago_docente (auto-creado o vinculado)
            $table->foreignId('pago_docente_id')->nullable()->constrained('pagos_docentes')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expedientes');
    }
};
