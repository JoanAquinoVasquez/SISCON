<?php

namespace App\Services;

class GoogleDriveService
{
    protected $client;

    public function __construct()
    {
        $this->client = new \Google\Client();
        $this->client->setClientId(config('google.client_id'));
        $this->client->setClientSecret(config('google.client_secret'));
        $this->client->setAccessType('offline');

        $refreshToken = env('GOOGLE_SHEETS_REFRESH_TOKEN');
        if ($refreshToken) {
            $this->client->refreshToken($refreshToken);
        }
    }

    /**
     * Upload a file to Google Drive.
     * 
     * @param \Illuminate\Http\UploadedFile $file The file to upload.
     * @param string|null $folderId The folder ID to upload to (optional).
     * @return string|null The web view link of the uploaded file.
     */
    public function uploadFile($file, $folderId = null)
    {
        // Increase memory limit and execution time for large file uploads
        ini_set('memory_limit', '512M');
        set_time_limit(300);

        try {
            $service = new \Google\Service\Drive($this->client);
            $driveFile = new \Google\Service\Drive\DriveFile();

            $driveFile->setName($file->getClientOriginalName());

            if ($folderId) {
                $driveFile->setParents([$folderId]);
            }

            // Defer execution to get the request object
            $this->client->setDefer(true);
            $request = $service->files->create($driveFile, [
                'fields' => 'id, webViewLink, webContentLink'
            ]);
            $this->client->setDefer(false);

            // Chunk size of 1MB (must be multiple of 256KB)
            $chunkSize = 1 * 1024 * 1024;
            $media = new \Google\Http\MediaFileUpload(
                $this->client,
                $request,
                $file->getMimeType(),
                null,
                true,
                $chunkSize
            );
            $media->setFileSize($file->getSize());

            $status = false;
            $handle = fopen($file->getRealPath(), 'rb');
            if ($handle === false) {
                throw new \Exception("Cannot open file stream");
            }

            while (!$status && !feof($handle)) {
                $chunk = fread($handle, $chunkSize);
                $status = $media->nextChunk($chunk);
            }

            fclose($handle);

            if ($status !== false) {
                return $status->webViewLink;
            }

            return null;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error uploading file to Drive: ' . $e->getMessage());
            return null;
        }
    }
}
