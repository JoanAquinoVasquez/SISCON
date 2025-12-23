<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update enum to include 'devolucion'
        DB::statement("ALTER TABLE expedientes MODIFY COLUMN tipo_asunto ENUM('descripcion', 'presentacion', 'conformidad', 'resolucion', 'devolucion') NOT NULL");

        // Add devolucion-specific fields
        Schema::table('expedientes', function (Blueprint $table) {
            $table->string('persona_devolucion')->nullable()->after('fechas_ensenanza');
            $table->string('dni_devolucion')->nullable()->after('persona_devolucion');
            $table->foreignId('programa_id')->nullable()->constrained('programas')->onDelete('set null')->after('dni_devolucion');
            $table->string('proceso_admision')->nullable()->after('programa_id');
            $table->enum('tipo_devolucion', ['inscripcion', 'idiomas', 'grados_titulos'])->nullable()->after('proceso_admision');
            $table->decimal('importe_devolucion', 10, 2)->nullable()->after('tipo_devolucion');
            $table->string('numero_voucher')->nullable()->after('importe_devolucion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expedientes', function (Blueprint $table) {
            $table->dropForeign(['programa_id']);
            $table->dropColumn([
                'persona_devolucion',
                'dni_devolucion',
                'programa_id',
                'proceso_admision',
                'tipo_devolucion',
                'importe_devolucion',
                'numero_voucher',
            ]);
        });

        // Revert enum
        DB::statement("ALTER TABLE expedientes MODIFY COLUMN tipo_asunto ENUM('descripcion', 'presentacion', 'conformidad', 'resolucion') NOT NULL");
    }
};
