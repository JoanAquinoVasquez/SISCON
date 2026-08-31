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
        // Increase memory limit, execution time, and prevent user abort for large file uploads
        ini_set('memory_limit', '1024M');
        set_time_limit(600);
        @ignore_user_abort(true);

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

            // Chunk size of 4MB (must be a multiple of 256KB = 262144 bytes)
            // 4MB = 4,194,304 bytes -> 4x faster than 1MB chunks for large files (e.g. 86MB)
            $chunkSize = 4 * 1024 * 1024;
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
                throw new \Exception("Cannot open file stream for upload");
            }

            while (!$status && !feof($handle)) {
                $chunk = fread($handle, $chunkSize);
                if ($chunk === false) {
                    fclose($handle);
                    throw new \Exception("Failed reading file chunk");
                }
                $status = $media->nextChunk($chunk);
            }

            fclose($handle);

            if ($status !== false) {
                return $status->webViewLink;
            }

            return null;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error uploading file to Drive (' . $file->getClientOriginalName() . '): ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return null;
        }
    }
}
