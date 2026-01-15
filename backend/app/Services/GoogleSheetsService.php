<?php

namespace App\Services;

use Revolution\Google\Sheets\Facades\Sheets;
use Illuminate\Support\Facades\Log;

class GoogleSheetsService
{
    public function appendExpediente(array $data)
    {
        try {
            $spreadsheetId = env('GOOGLE_SHEETS_ID');
            $sheetName = '2026-EXP-SISCON'; // Nombre de la hoja por defecto

            if (!$spreadsheetId) {
                Log::warning('GOOGLE_SHEETS_ID no está configurado en el .env');
                return;
            }

            // Asegurar que tenemos el refresh token
            $refreshToken = env('GOOGLE_SHEETS_REFRESH_TOKEN');
            if (!$refreshToken) {
                Log::warning('GOOGLE_SHEETS_REFRESH_TOKEN no está configurado en el .env');
                return;
            }

            // Configurar cliente de Google manualmente para refrescar el token
            $client = new \Google\Client();
            $client->setClientId(config('google.client_id'));
            $client->setClientSecret(config('google.client_secret'));
            $client->setAccessType('offline');
            
            // Refrescar el token de acceso usando el refresh token
            $client->refreshToken($refreshToken);
            $accessToken = $client->getAccessToken();

            if (!$accessToken) {
                Log::error('No se pudo obtener el access token usando el refresh token.');
                return;
            }

            // Usar el token refrescado
            Sheets::setAccessToken($accessToken)
                  ->spreadsheet($spreadsheetId)
                  ->sheet($sheetName)
                  ->append([$data]);


        } catch (\Exception $e) {
            Log::error('Error al guardar en Google Sheets: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
        }
    }
}
