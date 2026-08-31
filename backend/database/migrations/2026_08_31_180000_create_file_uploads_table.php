<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_uploads', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->string('uploadable_type'); // App\Models\Expediente, PagoDocente, Devolucion
            $table->unsignedBigInteger('uploadable_id');
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->string('local_path'); // temp file path in storage
            $table->string('drive_url')->nullable(); // Google Drive link after upload
            $table->string('original_name'); // original filename
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable(); // extra context (expediente_ids, pago_docente_id, etc.)
            $table->timestamps();

            $table->index(['uploadable_type', 'uploadable_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_uploads');
    }
};
