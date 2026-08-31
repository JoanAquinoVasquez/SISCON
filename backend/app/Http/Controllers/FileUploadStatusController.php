<?php

namespace App\Http\Controllers;

use App\Models\FileUpload;
use Illuminate\Http\Request;

class FileUploadStatusController extends Controller
{
    /**
     * Check the status of a background file upload.
     * 
     * GET /api/file-uploads/{uuid}/status
     */
    public function status(string $uuid)
    {
        $fileUpload = FileUpload::where('uuid', $uuid)->first();

        if (!$fileUpload) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Upload no encontrado',
            ], 404);
        }

        return response()->json([
            'status' => $fileUpload->status,
            'drive_url' => $fileUpload->drive_url,
            'original_name' => $fileUpload->original_name,
            'error_message' => $fileUpload->error_message,
        ]);
    }
}
