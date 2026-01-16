<?php

namespace App\Services;

use Revolution\Google\Sheets\Facades\Sheets;
use Illuminate\Support\Facades\Log;

class GoogleSheetsService
{
    public function appendExpediente(array $data)
    {
        $this->appendData('2026-EXP-SISCON', $data);
    }

    public function updateExpediente(array $data, $expedienteId)
    {
        $this->updateDataExpediente('2026-EXP-SISCON', $data, $expedienteId);
    }

    public function appendPagoDocente(\App\Models\PagoDocente $pago)
    {
        // Cargar relaciones si no están cargadas
        $pago->loadMissing(['docente', 'curso.semestres.programa.facultad', 'curso.semestres.programa.grado']);

        $data = $this->formatPagoDocenteData($pago);
        $sheetId = env('GOOGLE_SHEETS_PAGOS_ID');

        if (!$sheetId) {
            Log::warning('GOOGLE_SHEETS_PAGOS_ID no está configurado en el .env');
            return;
        }

        $sheetName = '2026-PAGOS DOCENTES-SISCON';
        $tipo = strtolower($pago->docente->tipo_docente ?? '');

        if (str_contains($tipo, 'interno')) {
            $sheetName = 'INTERNOS';
        } elseif (str_contains($tipo, 'externo')) {
            $sheetName = 'EXTERNOS';
        }

        $this->appendData($sheetName, $data, $sheetId);
    }

    public function updatePagoDocente(\App\Models\PagoDocente $pago)
    {
        // Cargar relaciones si no están cargadas
        $pago->loadMissing(['docente', 'curso.semestres.programa.facultad', 'curso.semestres.programa.grado']);

        $data = $this->formatPagoDocenteData($pago);
        $sheetId = env('GOOGLE_SHEETS_PAGOS_ID');

        if (!$sheetId) {
            Log::warning('GOOGLE_SHEETS_PAGOS_ID no está configurado en el .env');
            return;
        }

        $sheetName = '2026-PAGOS DOCENTES-SISCON';
        $tipo = strtolower($pago->docente->tipo_docente ?? '');

        if (str_contains($tipo, 'interno')) {
            $sheetName = 'INTERNOS';
        } elseif (str_contains($tipo, 'externo')) {
            $sheetName = 'EXTERNOS';
        }

        $this->updateData($sheetName, $data, $pago->id, $sheetId);
    }

    private function formatPagoDocenteData(\App\Models\PagoDocente $pago): array
    {
        $programa = $pago->curso->semestres->first()->programa ?? null;
        $programaNombre = $programa ? "{$programa->grado->nombre} en {$programa->nombre}" : '';
        $mesPago = '';
        $docenteNombre = $pago->docente
            ? ($pago->docente->titulo_profesional ? $pago->docente->titulo_profesional . ' ' : '') .
            "{$pago->docente->nombres} {$pago->docente->apellido_paterno} {$pago->docente->apellido_materno}"
            : '';

        $tipoDocente = $pago->docente->tipo_docente ?? '';
        if ($pago->periodo) {
            $tipoDocente .= ' (' . $pago->periodo . ')';
        }

        if ($pago->fecha_constancia_pago) {
            $meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            $mesIndex = date('n', strtotime($pago->fecha_constancia_pago)) - 1;
            $mesPago = $meses[$mesIndex] ?? '';
        }

        $notaPago = $pago->nota_pago;
        if ($pago->nota_pago_2) {
            $notaPago .= "\n" . $pago->nota_pago_2;
        }

        $fechas = $this->formatFechasEnsenanza($pago->fechas_ensenanza);

        $fechaRecibo = $pago->fecha_recibo_honorario
            ? date('d-m-Y', strtotime($pago->fecha_recibo_honorario))
            : '';

        $expedienteNumero = $pago->numero_exp_siaf ?? '';

        return [
            $pago->id,
            strtoupper($pago->estado), // 2. ESTADO DE PAGO
            $pago->periodo, // 2. PERIODO
            $docenteNombre, // 3. Docente
            $mesPago, // 4. Tipo Docente
            $expedienteNumero, // 5. Expediente Siaf / Interno
            $notaPago, // 6. Nota de pago
            $pago->orden_servicio, // 7. Orden de servicio
            $pago->numero_pedido_servicio, // 8. Pedido de servicio
            $pago->numero_recibo_honorario, // 9. N° Recibo por honorario
            $fechaRecibo, // 10. Fecha de Emisión del Recibo
            $pago->curso->nombre ?? '', // 11. Curso
            $programaNombre, // 12. Programa
            $pago->importe_total, // 13. Importe
            $fechas, // 14. Fechas de enseñanza
            $pago->numero_resolucion_aprobacion, // 15. Resolución de aprobacion de pago
            $pago->numero_oficio_conformidad_direccion, // 16. Oficio de Conformidad Direccion
            $pago->numero_resolucion_pago, // 17. Resolución de pago
            $pago->numero_oficio_presentacion_facultad, // 18. Oficio de presentación de facultad
            $pago->numero_oficio_presentacion_coordinador, // 19. Oficio de presentación coordinador
            $pago->numero_oficio_conformidad_facultad, // 20. Oficio de conformidad facultad
            $pago->numero_oficio_conformidad_coordinador, // 21. Oficio de conformidad coordinador
            $pago->numero_informe_final, // 22. Informe final
            $pago->docente->fecha_nacimiento,
            $pago->docente->dni,
            $pago->docente->numero_telefono,
            $pago->docente->email,
        ];
    }

    private function formatFechasEnsenanza($fechas): string
    {
        if (!$fechas || !is_array($fechas) || empty($fechas)) {
            return '';
        }

        // Sort dates
        sort($fechas);

        $meses = [
            1 => 'enero',
            2 => 'febrero',
            3 => 'marzo',
            4 => 'abril',
            5 => 'mayo',
            6 => 'junio',
            7 => 'julio',
            8 => 'agosto',
            9 => 'septiembre',
            10 => 'octubre',
            11 => 'noviembre',
            12 => 'diciembre'
        ];

        $groups = [];
        foreach ($fechas as $fecha) {
            $timestamp = strtotime($fecha);
            $month = date('n', $timestamp);
            $year = date('Y', $timestamp);
            $day = date('d', $timestamp);

            $key = "{$month}-{$year}";
            if (!isset($groups[$key])) {
                $groups[$key] = ['month' => $month, 'year' => $year, 'days' => []];
            }
            $groups[$key]['days'][] = $day;
        }

        $parts = [];
        $keys = array_keys($groups);
        $lastIndex = count($keys) - 1;

        foreach ($keys as $index => $key) {
            $group = $groups[$key];
            $days = $group['days'];

            $daysStr = '';
            if (count($days) === 1) {
                $daysStr = $days[0];
            } else {
                $lastDay = array_pop($days);
                $daysStr = implode(', ', $days) . ' y ' . $lastDay;
            }

            $part = "{$daysStr} de {$meses[$group['month']]}";

            $nextKey = $keys[$index + 1] ?? null;
            $nextYear = $nextKey ? $groups[$nextKey]['year'] : null;

            if ($index === $lastIndex || $group['year'] !== $nextYear) {
                $part .= " de {$group['year']}";
            }
            $parts[] = $part;
        }

        return implode(', ', $parts);
    }

    private function appendData(string $sheetName, array $data, ?string $spreadsheetId = null)
    {
        try {
            $spreadsheetId = $spreadsheetId ?? env('GOOGLE_SHEETS_ID');

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
            // Asegurar que sea una lista de listas y que todos los valores sean strings (null -> '')
            $cleanData = array_map(function ($item) {
                return is_null($item) ? '' : (string) $item;
            }, array_values($data));

            $values = [$cleanData];

            Sheets::setAccessToken($accessToken)
                ->spreadsheet($spreadsheetId)
                ->sheet($sheetName)
                ->append($values, 'USER_ENTERED', 'INSERT_ROWS');

        } catch (\Exception $e) {
            Log::error('Error al guardar en Google Sheets: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            // Don't throw here for automated background tasks to avoid breaking the main flow
            // But for manual actions we might want to know. 
            // Let's log it and maybe throw if it's a manual action? 
        }
    }

    private function updateData(string $sheetName, array $data, $id, ?string $spreadsheetId = null)
    {
        try {
            $spreadsheetId = $spreadsheetId ?? env('GOOGLE_SHEETS_ID');

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
            $sheets = Sheets::setAccessToken($accessToken)
                ->spreadsheet($spreadsheetId)
                ->sheet($sheetName);

            // Obtener todos los IDs de la columna A
            $rows = $sheets->range('A:A')->get();

            // Buscar el índice de la fila que contiene el ID
            $rowIndex = -1;
            foreach ($rows as $index => $row) {
                if (isset($row[0]) && $row[0] == $id) {
                    $rowIndex = $index + 1; // Sheets es 1-indexed
                    break;
                }
            }

            // Limpiar datos
            $cleanData = array_map(function ($item) {
                return is_null($item) ? '' : (string) $item;
            }, array_values($data));
            $values = [$cleanData];

            if ($rowIndex !== -1) {
                // Actualizar fila existente
                // Calcular el número de columnas basado en los datos
                $numColumns = count($cleanData);
                $lastColumn = $this->getColumnLetter($numColumns);

                // Rango completo: A{rowIndex}:{LastColumn}{rowIndex}
                $range = 'A' . $rowIndex . ':' . $lastColumn . $rowIndex;
                $sheets->range($range)->update($values, 'USER_ENTERED');
                Log::info("Fila actualizada en Google Sheets: {$sheetName} - Row {$rowIndex} - Range: {$range}");
            } else {
                // No encontrado, agregar nueva fila
                $sheets->append($values, 'USER_ENTERED', 'INSERT_ROWS');
                Log::info("Nueva fila agregada en Google Sheets: {$sheetName}");
            }

        } catch (\Exception $e) {
            Log::error('Error al actualizar en Google Sheets: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
        }
    }

    /**
     * Convert column number to letter (1 = A, 27 = AA, etc.)
     */
    private function getColumnLetter($columnNumber)
    {
        $letter = '';
        while ($columnNumber > 0) {
            $temp = ($columnNumber - 1) % 26;
            $letter = chr($temp + 65) . $letter;
            $columnNumber = ($columnNumber - $temp - 1) / 26;
        }
        return $letter;
    }

    private function updateDataExpediente(string $sheetName, array $data, $expedienteId, ?string $spreadsheetId = null)
    {
        try {
            $spreadsheetId = $spreadsheetId ?? env('GOOGLE_SHEETS_ID');

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
            $sheets = Sheets::setAccessToken($accessToken)
                ->spreadsheet($spreadsheetId)
                ->sheet($sheetName);

            // Obtener la columna A (ID del expediente) para buscar
            $rows = $sheets->range('A:A')->get();

            // Buscar el índice de la fila que contiene el ID
            $rowIndex = -1;

            foreach ($rows as $index => $row) {
                if (isset($row[0]) && $row[0] == $expedienteId) {
                    $rowIndex = $index + 1; // Sheets es 1-indexed
                    break;
                }
            }

            $cleanData = array_map(function ($item) {
                return is_null($item) ? '' : (string) $item;
            }, array_values($data));
            $values = [$cleanData];

            if ($rowIndex !== -1) {
                // Actualizar fila existente
                $numColumns = count($cleanData);
                $lastColumn = $this->getColumnLetter($numColumns);

                // Rango completo: A{rowIndex}:{LastColumn}{rowIndex}
                $range = 'A' . $rowIndex . ':' . $lastColumn . $rowIndex;
                $sheets->range($range)->update($values, 'USER_ENTERED');
                Log::info("Expediente actualizado en Google Sheets: {$sheetName} - Row {$rowIndex} - Range: {$range}");
            } else {
                // No encontrado, agregar nueva fila
                $sheets->append($values, 'USER_ENTERED', 'INSERT_ROWS');
                Log::info("Nuevo expediente agregado en Google Sheets: {$sheetName}");
            }

        } catch (\Exception $e) {
            Log::error('Error al actualizar expediente en Google Sheets: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
        }
    }
}
