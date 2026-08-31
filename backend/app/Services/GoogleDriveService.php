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

            // Open file stream to avoid reading whole file into memory
            $handle = fopen($file->getRealPath(), 'r');
            if ($handle === false) {
                throw new \Exception("Cannot open file stream");
            }

            $createdFile = $service->files->create($driveFile, [
                'data' => $handle,
                'mimeType' => $file->getMimeType(),
                'uploadType' => 'multipart',
                'fields' => 'id, webViewLink, webContentLink'
            ]);

            fclose($handle);

            return $createdFile->webViewLink;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error uploading file to Drive: ' . $e->getMessage());
            return null;
        }
    }
}
