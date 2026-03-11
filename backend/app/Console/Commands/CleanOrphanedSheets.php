<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Revolution\Google\Sheets\Facades\Sheets;
use Illuminate\Support\Facades\Log;

class CleanOrphanedSheets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pagos:clean-sheets';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean orphaned and duplicate rows from Google Sheets';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to sync Google Sheets DB Pagos Docentes...');

        try {
            $spreadsheetId = env('GOOGLE_SHEETS_PAGOS_ID');

            if (!$spreadsheetId) {
                $this->error('GOOGLE_SHEETS_PAGOS_ID no está configurado en el .env');
                return;
            }

            // Asegurar que tenemos el refresh token
            $refreshToken = env('GOOGLE_SHEETS_REFRESH_TOKEN');
            if (!$refreshToken) {
                $this->error('GOOGLE_SHEETS_REFRESH_TOKEN no está configurado en el .env');
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
                $this->error('No se pudo obtener el access token usando el refresh token.');
                return;
            }

            $service = new \Google_Service_Sheets($client);
            $spreadsheetInfo = $service->spreadsheets->get($spreadsheetId);
            $sheetsList = $spreadsheetInfo->getSheets();

            $deletedRowsTotal = 0;

            foreach ($sheetsList as $s) {
                $sheetName = $s->getProperties()->getTitle();
                $sheetId = $s->getProperties()->getSheetId();

                $this->info("Verifying sheet: {$sheetName}");

                // Ignore "Docentes" base sheet if present. Only check specific ones.
                if (in_array($sheetName, ['INTERNOS FE', 'INTERNOS', 'EXTERNOS FE', 'EXTERNOS', '2026-PAGOS DOCENTES-SISCON'])) {
                    $sheets = Sheets::setAccessToken($accessToken)
                        ->spreadsheet($spreadsheetId)
                        ->sheet($sheetName);

                    try {
                        // All IDs
                        $rows = $sheets->range('A:A')->get();

                        $requests = [];

                        // We must delete from bottom to top to preserve row indexes!
                        $rowsArray = is_array($rows) ? $rows : (method_exists($rows, 'toArray') ? $rows->toArray() : (array) $rows);
                        $rowsReversed = array_reverse($rowsArray, true);

                        foreach ($rowsReversed as $index => $row) {
                            if (isset($row[0]) && is_numeric($row[0])) {
                                $idStr = (string) $row[0];

                                // Check if this ID actually exists in the local DB
                                $exists = \App\Models\PagoDocente::where('id', $idStr)->exists();

                                if (!$exists) {
                                    $rowIndex = $index + 1;

                                    $requests[] = new \Google_Service_Sheets_Request([
                                        'deleteDimension' => [
                                            'range' => [
                                                'sheetId' => $sheetId,
                                                'dimension' => 'ROWS',
                                                'startIndex' => $rowIndex - 1,
                                                'endIndex' => $rowIndex
                                            ]
                                        ]
                                    ]);

                                    $this->line("  Marked row $rowIndex (ID: $idStr) for deletion.");
                                    $deletedRowsTotal++;
                                }
                            }
                        }

                        if (!empty($requests)) {
                            // We reverse requests so we delete highest row indices first!
                            // Important since removing row N affects row N+1
                            // But since we iterated reversed, they are already top-to-bottom indices?
                            // Actually it's better to sort requests by descending startIndex just in case
                            usort($requests, function ($a, $b) {
                                $idxA = $a->getDeleteDimension()->getRange()->getStartIndex();
                                $idxB = $b->getDeleteDimension()->getRange()->getStartIndex();
                                return $idxB - $idxA;
                            });

                            $batchUpdateRequest = new \Google_Service_Sheets_BatchUpdateSpreadsheetRequest([
                                'requests' => $requests
                            ]);
                            $service->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
                            $this->info("  Executed batch delete for sheet {$sheetName}.");
                        }
                    } catch (\Exception $e) {
                        $this->error("Error reading/deleting rows on $sheetName: " . $e->getMessage());
                    }
                }
            }

            $this->info("Finished cleaning up Google Sheets. Deleted $deletedRowsTotal rows total.");

        } catch (\Exception $e) {
            $this->error('Fatal Error sync: ' . $e->getMessage());
        }
    }
}
