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
        Schema::table('users', function (Blueprint $table) {
            $table->index('name');
            $table->index('role');
            $table->index('is_active');
        });

        Schema::table('coordinadores', function (Blueprint $table) {
            $table->index('nombres');
            $table->index('apellido_paterno');
            $table->index('apellido_materno');
            $table->index('genero');
        });

        Schema::table('docentes', function (Blueprint $table) {
            $table->index('nombres');
            $table->index('apellido_paterno');
            $table->index('apellido_materno');
            $table->index('genero');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['role']);
            $table->dropIndex(['is_active']);
        });

        Schema::table('coordinadores', function (Blueprint $table) {
            $table->dropIndex(['nombres']);
            $table->dropIndex(['apellido_paterno']);
            $table->dropIndex(['apellido_materno']);
            $table->dropIndex(['genero']);
        });

        Schema::table('docentes', function (Blueprint $table) {
            $table->dropIndex(['nombres']);
            $table->dropIndex(['apellido_paterno']);
            $table->dropIndex(['apellido_materno']);
            $table->dropIndex(['genero']);
        });
    }
};
