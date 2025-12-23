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
        Schema::table('pagos_docentes', function (Blueprint $table) {
            if (Schema::hasColumn('pagos_docentes', 'programa_id')) {
                $table->dropForeign(['programa_id']);
                $table->dropColumn('programa_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pagos_docentes', function (Blueprint $table) {
            if (!Schema::hasColumn('pagos_docentes', 'programa_id')) {
                $table->foreignId('programa_id')->nullable()->constrained('programas')->onDelete('cascade');
            }
        });
    }
};
