<?php

namespace App\Jobs;

use App\Models\FileUpload;
use App\Services\GoogleDriveService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UploadFileToDriveJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 600;

    /**
     * The FileUpload record ID.
     */
    protected int $fileUploadId;

    public function __construct(int $fileUploadId)
    {
        $this->fileUploadId = $fileUploadId;
    }

    public function handle(): void
    {
        $fileUpload = FileUpload::find($this->fileUploadId);

        if (!$fileUpload) {
            Log::error("UploadFileToDriveJob: FileUpload record not found: {$this->fileUploadId}");
            return;
        }

        // Mark as processing
        $fileUpload->update(['status' => 'processing']);

        $localPath = storage_path('app/' . $fileUpload->local_path);

        if (!file_exists($localPath)) {
            $fileUpload->update([
                'status' => 'failed',
                'error_message' => 'Archivo temporal no encontrado en el servidor.',
            ]);
            Log::error("UploadFileToDriveJob: File not found at {$localPath}");
            return;
        }

        try {
            // Create a fake UploadedFile from the stored temp file
            $uploadedFile = new \Illuminate\Http\UploadedFile(
                $localPath,
                $fileUpload->original_name,
                mime_content_type($localPath),
                null,
                true // test mode = trust the file
            );

            // Upload to Google Drive
            $driveService = new GoogleDriveService();
            $folderId = env('GOOGLE_DRIVE_FOLDER_ID');
            $driveUrl = $driveService->uploadFile($uploadedFile, $folderId);

            if (!$driveUrl) {
                $fileUpload->update([
                    'status' => 'failed',
                    'error_message' => 'Google Drive no devolvió un enlace válido.',
                ]);
                Log::warning("UploadFileToDriveJob: Drive returned null for FileUpload ID: {$fileUpload->id}");
                return;
            }

            // Update FileUpload record
            $fileUpload->update([
                'status' => 'completed',
                'drive_url' => $driveUrl,
            ]);

            // Now update the related models based on uploadable_type
            $this->updateRelatedModels($fileUpload, $driveUrl);

            // Delete temp file
            if (file_exists($localPath)) {
                @unlink($localPath);
            }

            Log::info("UploadFileToDriveJob: Successfully uploaded file for {$fileUpload->uploadable_type}#{$fileUpload->uploadable_id} -> {$driveUrl}");

        } catch (\Exception $e) {
            $fileUpload->update([
                'status' => 'failed',
                'error_message' => 'Error: ' . $e->getMessage(),
            ]);
            Log::error("UploadFileToDriveJob: Exception for FileUpload ID {$fileUpload->id}: " . $e->getMessage());
            throw $e; // Re-throw so Laravel marks the job as failed and can retry
        }
    }

    /**
     * Update related database records after successful Drive upload.
     */
    private function updateRelatedModels(FileUpload $fileUpload, string $driveUrl): void
    {
        $metadata = $fileUpload->metadata ?? [];

        switch ($fileUpload->uploadable_type) {
            case 'App\\Models\\Expediente':
                $this->handleExpedienteUpload($fileUpload, $driveUrl, $metadata);
                break;

            case 'App\\Models\\PagoDocente':
                $this->handlePagoDocenteUpload($fileUpload, $driveUrl, $metadata);
                break;

            case 'App\\Models\\Devolucion':
                $this->handleDevolucionUpload($fileUpload, $driveUrl, $metadata);
                break;

            default:
                Log::warning("UploadFileToDriveJob: Unknown uploadable_type: {$fileUpload->uploadable_type}");
        }
    }

    /**
     * Handle post-upload for Expediente.
     */
    private function handleExpedienteUpload(FileUpload $fileUpload, string $driveUrl, array $metadata): void
    {
        $expediente = \App\Models\Expediente::find($fileUpload->uploadable_id);
        if (!$expediente) return;

        $expediente->update([
            'documento_respuesta_url' => $driveUrl,
            'documento_respuesta_nombre' => $fileUpload->original_name,
        ]);

        // Sync related Pago with Sheets if it exists
        if ($expediente->pago_docente_id) {
            $pago = \App\Models\PagoDocente::find($expediente->pago_docente_id);
            if ($pago) {
                try {
                    $googleSheetsService = app(\App\Services\GoogleSheetsService::class);
                    $googleSheetsService->updatePagoDocente($pago);
                } catch (\Exception $e) {
                    Log::error('UploadFileToDriveJob: Error syncing PagoDocente Sheets: ' . $e->getMessage());
                }
            }
        }

        // Sync Expediente with Google Sheets
        try {
            $googleSheetsService = app(\App\Services\GoogleSheetsService::class);
            $googleSheetsService->syncExpediente($expediente, true);
        } catch (\Exception $e) {
            Log::error('UploadFileToDriveJob: Error syncing Expediente Sheets: ' . $e->getMessage());
        }
    }

    /**
     * Handle post-upload for PagoDocente.
     */
    private function handlePagoDocenteUpload(FileUpload $fileUpload, string $driveUrl, array $metadata): void
    {
        $pago = \App\Models\PagoDocente::with('expedientes')->find($fileUpload->uploadable_id);
        if (!$pago) return;

        // Update all related expedientes with the Drive link
        foreach ($pago->expedientes as $expediente) {
            $expediente->update([
                'documento_respuesta_url' => $driveUrl,
                'documento_respuesta_nombre' => $fileUpload->original_name,
            ]);
        }

        // Sync with Google Sheets
        try {
            $googleSheetsService = app(\App\Services\GoogleSheetsService::class);
            $googleSheetsService->updatePagoDocente($pago);
        } catch (\Exception $e) {
            Log::error('UploadFileToDriveJob: Error syncing PagoDocente Sheets: ' . $e->getMessage());
        }
    }

    /**
     * Handle post-upload for Devolucion.
     */
    private function handleDevolucionUpload(FileUpload $fileUpload, string $driveUrl, array $metadata): void
    {
        $expedienteIds = $metadata['expediente_ids'] ?? [];

        if (!empty($expedienteIds)) {
            \App\Models\Expediente::whereIn('id', $expedienteIds)
                ->update([
                    'documento_respuesta_url' => $driveUrl,
                    'documento_respuesta_nombre' => $fileUpload->original_name,
                ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(?\Throwable $exception): void
    {
        $fileUpload = FileUpload::find($this->fileUploadId);

        if ($fileUpload) {
            $fileUpload->update([
                'status' => 'failed',
                'error_message' => $exception ? $exception->getMessage() : 'Error desconocido',
            ]);
        }

        Log::error("UploadFileToDriveJob FAILED for FileUpload ID {$this->fileUploadId}: " . ($exception ? $exception->getMessage() : 'Unknown'));
    }
}
