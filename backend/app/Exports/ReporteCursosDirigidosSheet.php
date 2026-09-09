<?php

namespace App\Exports;

use App\Models\Curso;
use App\Models\PagoDocente;
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

class ReporteCursosDirigidosSheet implements FromArray, WithStyles, WithTitle, WithEvents, WithColumnWidths
{
    protected $periodo;
    protected $programaId;
    protected $rows = [];
    protected $totalRows = 0;

    public function __construct($periodo = null, $programaId = null)
    {
        $this->periodo = $periodo;
        $this->programaId = $programaId;
        $this->buildRows();
    }

    private function buildRows()
    {
        // Query todos los cursos dirigidos
        $cursosQuery = Curso::where('tipo', 'dirigido')
            ->with(['semestres.programa.grado']);

        if ($this->programaId && $this->programaId !== '__todos__') {
            $cursosQuery->whereHas('semestres', function ($q) {
                $q->where('programa_id', $this->programaId);
            });
        }

        $cursos = $cursosQuery->get();
        $cursoIds = $cursos->pluck('id');

        // Consultar pagos docentes para estos cursos dirigidos
        $pagosQuery = PagoDocente::with('docente')
            ->whereIn('curso_id', $cursoIds);

        if ($this->periodo && $this->periodo !== '__todos__') {
            $pagosQuery->where('periodo', $this->periodo);
        }

        $pagosGrouped = $pagosQuery->get()->groupBy('curso_id');

        // Título del reporte
        $periodoSuffix = ($this->periodo && $this->periodo !== '__todos__') 
            ? ' - PERIODO ' . $this->periodo 
            : ' - TODOS LOS PERIODOS';
        $titleText = 'REPORTE GENERAL DE CURSOS DIRIGIDOS' . $periodoSuffix;
        $this->rows[] = [$titleText, '', '', '', '', '', '', '', '', '', ''];

        // Header row
        $this->rows[] = [
            'PERIODO',
            'PROGRAMA',
            'SEMESTRE',
            'CÓDIGO',
            'CURSO DIRIGIDO',
            'DOCENTE',
            'TOTAL HORAS',
            'LUGAR DE PROCEDENCIA',
            'COSTO HORA',
            'MONTO TOTAL',
            'ESSALUD 9%',
        ];

        // Populate rows
        foreach ($cursos as $curso) {
            $semestre = $curso->semestres->first();
            $programa = $semestre?->programa;
            $gradoNombre = $programa?->grado?->nombre ?? '';
            $programaNombre = $programa ? ($gradoNombre ? $gradoNombre . ' en ' : '') . $programa->nombre : 'S/N';
            $semestreNum = $semestre?->numero_semestre ?? 0;
            $semestreLabel = $semestre?->nombre ? $semestre->nombre : ($semestreNum > 0 ? $semestreNum . '° Semestre' : 'S/N');

            $cursoPagos = $pagosGrouped->get($curso->id);

            if ($cursoPagos && $cursoPagos->count() > 0) {
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
                    
                    $esInterno = $pago->docente && in_array($pago->docente->tipo_docente, ['interno', 'interno_enfermeria']);
                    $essalud = $esInterno ? round($montoTotal * 0.09, 2) : '';

                    $periodoFila = $pago->periodo ?? $programa?->periodo ?? '-';

                    $this->rows[] = [
                        $periodoFila,
                        $programaNombre,
                        $semestreLabel,
                        $curso->codigo,
                        $curso->nombre,
                        $docenteNombre,
                        $totalHoras,
                        '', // Lugar de procedencia
                        $costoHora,
                        $montoTotal,
                        $essalud,
                    ];

                    $this->totalRows++;
                }
            } else {
                $periodoFila = $programa?->periodo ?? '-';
                $this->rows[] = [
                    $periodoFila,
                    $programaNombre,
                    $semestreLabel,
                    $curso->codigo,
                    $curso->nombre,
                    '', // No docente
                    '', // No hours
                    '', // Lugar de procedencia
                    '', // No cost
                    '', // No total
                    '', // No EsSalud
                ];

                $this->totalRows++;
            }
        }

        // Footer row - TOTAL A PAGAR
        $dataStartRow = 3;
        $dataEndRow = $dataStartRow + $this->totalRows - 1;

        if ($this->totalRows > 0) {
            $this->rows[] = [
                'TOTAL A PAGAR',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                "=SUM(J{$dataStartRow}:J{$dataEndRow})",
                "=SUM(K{$dataStartRow}:K{$dataEndRow})",
            ];
        } else {
            $this->rows[] = [
                'TOTAL A PAGAR',
                '',
                '',
                '',
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
        return 'Cursos Dirigidos';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 14,  // PERIODO
            'B' => 38,  // PROGRAMA
            'C' => 16,  // SEMESTRE
            'D' => 14,  // CÓDIGO
            'E' => 35,  // CURSO DIRIGIDO
            'F' => 40,  // DOCENTE
            'G' => 14,  // TOTAL HORAS
            'H' => 22,  // LUGAR DE PROCEDENCIA
            'I' => 14,  // COSTO HORA
            'J' => 16,  // MONTO TOTAL
            'K' => 14,  // ESSALUD 9%
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
                $lastCol = 'K';

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
                        'startColor' => ['argb' => 'FF5B21B6'], // Purple theme for dirigidos
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
                        'startColor' => ['argb' => 'FF7C3AED'],
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
                    $dataEnd = $highestRow - 1;
                    
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
                        $sheet->getStyle("C3:D{$dataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("G3:G{$dataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        
                        // Currency format for COSTO HORA, MONTO TOTAL, ESSALUD
                        $currencyFormat = '"S/." #,##0.00';
                        $sheet->getStyle("I3:I{$dataEnd}")->getNumberFormat()->setFormatCode($currencyFormat);
                        $sheet->getStyle("J3:J{$dataEnd}")->getNumberFormat()->setFormatCode($currencyFormat);
                        $sheet->getStyle("K3:K{$dataEnd}")->getNumberFormat()->setFormatCode($currencyFormat);

                        // Number format for hours
                        $sheet->getStyle("G3:G{$dataEnd}")->getNumberFormat()->setFormatCode('0');

                        // Alternate row coloring
                        for ($row = 3; $row <= $dataEnd; $row++) {
                            if (($row - 3) % 2 === 0) {
                                $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                                    'fill' => [
                                        'fillType' => Fill::FILL_SOLID,
                                        'startColor' => ['argb' => 'FDF4FF'],
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
                        'startColor' => ['argb' => 'FF5B21B6'],
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

                $currencyFormat = '"S/." #,##0.00';
                $sheet->getStyle("J{$highestRow}")->getNumberFormat()->setFormatCode($currencyFormat);
                $sheet->getStyle("K{$highestRow}")->getNumberFormat()->setFormatCode($currencyFormat);

                // Merge TOTAL A PAGAR label across first 9 columns
                $sheet->mergeCells("A{$highestRow}:I{$highestRow}");
            },
        ];
    }
}
