<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Usuarios (Administradores del sistema)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->softDeletes(); // Eliminación lógica
            $table->timestamps();
        });

        // 2. Estructura Académica (Grado -> Programa -> Semestre -> Curso)
        Schema::create('grados', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: Doctorado, Maestría
            $table->timestamps();
        });

        Schema::create('programas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grado_id')->constrained();
            $table->string('nombre'); // Ej: Ingeniería de Sistemas
            $table->string('periodo'); // Ej: 2024-I, 2025-II
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('semestres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('programa_id')->constrained();
            $table->string('numero'); // Ej: Semestre 1, Ciclo III
            $table->timestamps();
        });

        Schema::create('cursos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semestre_id')->constrained();
            $table->string('nombre');
            $table->integer('creditos')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });

        // 3. Docentes (Tabla Maestra)
        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->string('nombres');
            $table->string('ap_paterno');
            $table->string('ap_materno');
            $table->string('genero', 20);
            $table->string('dni', 15)->unique();
            $table->string('numero_celular', 20);
            
            // Clasificación
            $table->enum('condicion', ['INTERNO', 'EXTERNO']); 
            $table->enum('categoria', ['REGULAR', 'ENFERMERIA']); // Separa la lógica de pagos
            
            // Procedencia para cálculo de costos
            $table->string('lugar_procedencia'); 
            
            $table->softDeletes();
            $table->timestamps();
        });

        // 4. Asignaciones de Cursos y Pagos (Docencia)
        Schema::create('asignaciones_docencia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('docente_id')->constrained();
            $table->foreignId('curso_id')->constrained();
            
            // Detalles Académicos
            $table->decimal('horas_teoricas', 8, 2)->default(0);
            $table->decimal('horas_practicas', 8, 2)->default(0);
            $table->decimal('total_horas', 8, 2);
            $table->text('fechas_clase'); // Guardar como JSON o texto: "12/01, 14/01"
            
            // Detalles Financieros Base
            $table->decimal('costo_hora', 10, 2);
            $table->decimal('monto_bruto', 10, 2);
            $table->decimal('essalud', 10, 2); // El 9%
            $table->decimal('monto_neto', 10, 2);

            // DOCUMENTOS DE PAGO (Campos mezclados, se validan según categoría en Backend)
            
            // Comunes / Regular
            // La resolución es única para un docente en un curso y fecha específica
            $table->string('numero_resolucion')->unique()->nullable(); 
            // El oficio puede repetirse en varios pagos
            $table->string('oficio_direccion')->index()->nullable(); 
            $table->string('registro_siaf')->nullable();
            $table->string('nota_de_pago')->nullable();
            
            // Específicos Enfermería / Otros
            $table->string('orden_servicio')->nullable();
            $table->string('pedido_servicio')->nullable();
            $table->string('recibo_honorarios')->nullable();
            $table->date('fecha_emision_rh')->nullable();
            $table->string('mes_pago')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });

        // 5. Coordinadores (Lógica separada para pagos de coordinación)
        Schema::create('pagos_coordinadores', function (Blueprint $table) {
            $table->id();
            // Un coordinador es un docente (o usuario), asumiremos docente:
            $table->foreignId('docente_id')->constrained('docentes'); 
            $table->foreignId('programa_id')->constrained(); // A cargo de un programa
            
            $table->string('mes'); // Mes que se paga
            $table->decimal('importe', 10, 2);
            
            // Documentos Coordinación
            $table->string('numero_resolucion')->nullable(); // Puede ser único o no según regla, asumimos index
            $table->string('registro_siaf')->nullable();
            $table->string('pedido_servicio')->nullable();
            $table->string('recibo_honorarios')->nullable();
            $table->string('nce')->nullable();
            $table->string('orden_servicio')->nullable();
            $table->string('comprobante_pago')->nullable(); // o nota de abono

            $table->timestamps();
        });
    }

    public function down()
    {
        // Orden inverso para eliminar
        Schema::dropIfExists('pagos_coordinadores');
        Schema::dropIfExists('asignaciones_docencia');
        Schema::dropIfExists('docentes');
        Schema::dropIfExists('cursos');
        Schema::dropIfExists('semestres');
        Schema::dropIfExists('programas');
        Schema::dropIfExists('grados');
        Schema::dropIfExists('users');
    }
};