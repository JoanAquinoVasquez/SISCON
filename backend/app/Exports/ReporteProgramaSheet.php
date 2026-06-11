<?php

namespace App\Exports;

use App\Models\PagoDocente;
use App\Models\Programa;
use App\Models\Semestre;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class ReporteProgramaSheet implements FromArray, WithStyles, WithTitle, WithEvents, WithColumnWidths
{
    protected $programaId;
    protected $periodo;
    protected $programa;
    protected $rows = [];
    protected $totalRows = 0;

    public function __construct($programaId, $periodo = null)
    {
        $this->programaId = $programaId;
        $this->periodo = $periodo;
        $this->programa = Programa::with('grado')->find($programaId);
        $this->buildRows();
    }

    private function buildRows()
    {
        // Get all semestres for this program, ordered by numero_semestre
        $semestres = Semestre::where('programa_id', $this->programaId)
            ->with(['cursos' => function ($q) {
                $q->orderBy('nombre');
            }])
            ->orderBy('numero_semestre')
            ->get();

        // Fetch all pagos docentes for this program and period, grouped by curso_id
        $pagosQuery = PagoDocente::with('docente')
            ->whereIn('curso_id', function ($query) {
                $query->select('curso_id')
                    ->from('curso_semestre')
                    ->whereIn('semestre_id', function ($q) {
                        $q->select('id')
                            ->from('semestres')
                            ->where('programa_id', $this->programaId);
                    });
            });

        if ($this->periodo && $this->periodo !== '__todos__') {
            $pagosQuery->where('periodo', $this->periodo);
        }

        $pagosGrouped = $pagosQuery->get()->groupBy('curso_id');

        // Build title row
        $gradoNombre = $this->programa->grado->nombre ?? '';
        $periodoSuffix = ($this->periodo && $this->periodo !== '__todos__') 
            ? ' - PERIODO ' . $this->periodo 
            : ' - TODOS LOS PERIODOS';
        $programaNombre = mb_strtoupper($gradoNombre . ' EN ' . $this->programa->nombre . $periodoSuffix, 'UTF-8');
        $this->rows[] = [$programaNombre, '', '', '', '', '', '', ''];

        // Header row
        $this->rows[] = [
            'SEMESTRE',
            'CURSO',
            'DOCENTE',
            'TOTAL HORAS',
            'LUGAR DE PROCEDENCIA',
            'COSTO HORA',
            'MONTO TOTAL',
            'ESSALUD 9%',
        ];

        // Populate rows
        foreach ($semestres as $semestre) {
            $semestreNum = $semestre->numero_semestre;
            $semestreLabel = $semestreNum > 0 ? $semestreNum . '°' : 'S/N';
            $isFirstInSemestre = true;

            foreach ($semestre->cursos as $curso) {
                $cursoPagos = $pagosGrouped->get($curso->id);

                if ($cursoPagos && $cursoPagos->count() > 0) {
                    // One or more teacher payments for this course
                    foreach ($cursoPagos as $pago) {
                        $docenteNombre = $pago->docente
                            ? ($pago->docente->titulo_profesional ? $pago->docente->titulo_profesional . ' ' : '') .
                              $pago->docente->nombres . ' ' .
                              $pago->docente->apellido_paterno . ' ' .
                              $pago->docente->apellido_materno
                            : '';

                        $totalHoras = (int) $pago->numero_horas;
                        $costoHora = (float) $pago->costo_por_hora;
                        $montoTotal = (float) $pago->importe_total;
                        
                        // EsSalud is only calculated for internal teachers (regular and enfermeria)
                        $esInterno = $pago->docente && in_array($pago->docente->tipo_docente, ['interno', 'interno_enfermeria']);
                        $essalud = $esInterno ? round($montoTotal * 0.09, 2) : '';

                        $this->rows[] = [
                            $isFirstInSemestre ? $semestreLabel : '',
                            $curso->nombre,
                            $docenteNombre,
                            $totalHoras,
                            '', // Lugar de procedencia - blank
                            $costoHora,
                            $montoTotal,
                            $essalud,
                        ];

                        $this->totalRows++;
                        $isFirstInSemestre = false;
                    }
                } else {
                    // No payments for this course, but we still list the course
                    $this->rows[] = [
                        $isFirstInSemestre ? $semestreLabel : '',
                        $curso->nombre,
                        '', // No docente
                        '', // No hours
                        '', // Lugar de procedencia - blank
                        '', // No hourly cost
                        '', // No total amount
                        '', // No EsSalud
                    ];

                    $this->totalRows++;
                    $isFirstInSemestre = false;
                }
            }
        }

        // Footer row - TOTAL A PAGAR
        $dataStartRow = 3; // Row 1 = title, Row 2 = headers, Row 3+ = data
        $dataEndRow = $dataStartRow + $this->totalRows - 1;

        if ($this->totalRows > 0) {
            $this->rows[] = [
                'TOTAL A PAGAR',
                '',
                '',
                '',
                '',
                '',
                "=SUM(G{$dataStartRow}:G{$dataEndRow})",
                "=SUM(H{$dataStartRow}:H{$dataEndRow})",
            ];
        } else {
            $this->rows[] = [
                'TOTAL A PAGAR',
                '',
                '',
                '',
                '',
                '',
                0,
                0,
            ];
        }
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function title(): string
    {
        $nombre = $this->programa->nombre ?? 'Programa';
        // Excel sheet name max 31 chars
        return mb_substr($nombre, 0, 31);
    }

    public function columnWidths(): array
    {
        return [
            'A' => 14,  // SEMESTRE
            'B' => 35,  // CURSO
            'C' => 40,  // DOCENTE
            'D' => 14,  // TOTAL HORAS
            'E' => 22,  // LUGAR DE PROCEDENCIA
            'F' => 14,  // COSTO HORA
            'G' => 16,  // MONTO TOTAL
            'H' => 14,  // ESSALUD 9%
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet;
                $highestRow = $sheet->getHighestRow();
                $lastCol = 'H';

                // === TITLE ROW (Row 1) ===
                $sheet->mergeCells("A1:{$lastCol}1");
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 14,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF1F4E79'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);
                $sheet->getRowDimension(1)->setRowHeight(35);

                // === HEADER ROW (Row 2) ===
                $sheet->getStyle("A2:{$lastCol}2")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 10,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF2E75B6'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FFFFFFFF'],
                        ],
                    ],
                ]);
                $sheet->getRowDimension(2)->setRowHeight(28);

                // === DATA ROWS ===
                if ($highestRow > 2) {
                    $dataEnd = $highestRow - 1; // Exclude footer
                    
                    if ($dataEnd >= 3) {
                        $sheet->getStyle("A3:{$lastCol}{$dataEnd}")->applyFromArray([
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color' => ['argb' => 'FFB4B4B4'],
                                ],
                            ],
                            'alignment' => [
                                'vertical' => Alignment::VERTICAL_CENTER,
                                'wrapText' => true,
                            ],
                        ]);

                        // Center specific columns
                        $sheet->getStyle("A3:A{$dataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("D3:D{$dataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        
                        // Currency format for COSTO HORA, MONTO TOTAL, ESSALUD
                        $currencyFormat = '"S/." #,##0.00';
                        $sheet->getStyle("F3:F{$dataEnd}")->getNumberFormat()->setFormatCode($currencyFormat);
                        $sheet->getStyle("G3:G{$dataEnd}")->getNumberFormat()->setFormatCode($currencyFormat);
                        $sheet->getStyle("H3:H{$dataEnd}")->getNumberFormat()->setFormatCode($currencyFormat);

                        // Number format for hours (only integer, no commas or decimals)
                        $sheet->getStyle("D3:D{$dataEnd}")->getNumberFormat()->setFormatCode('0');

                        // Alternate row coloring
                        for ($row = 3; $row <= $dataEnd; $row++) {
                            if (($row - 3) % 2 === 0) {
                                $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                                    'fill' => [
                                        'fillType' => Fill::FILL_SOLID,
                                        'startColor' => ['argb' => 'FFDCE6F1'],
                                    ],
                                ]);
                            }
                        }
                    }
                }

                // === FOOTER ROW (Last row) ===
                $sheet->getStyle("A{$highestRow}:{$lastCol}{$highestRow}")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF1F4E79'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FFFFFFFF'],
                        ],
                    ],
                ]);
                $sheet->getRowDimension($highestRow)->setRowHeight(28);

                // Currency format for footer totals
                $currencyFormat = '"S/." #,##0.00';
                $sheet->getStyle("G{$highestRow}")->getNumberFormat()->setFormatCode($currencyFormat);
                $sheet->getStyle("H{$highestRow}")->getNumberFormat()->setFormatCode($currencyFormat);

                // Merge TOTAL A PAGAR label across first columns
                $sheet->mergeCells("A{$highestRow}:F{$highestRow}");
            },
        ];
    }
}
