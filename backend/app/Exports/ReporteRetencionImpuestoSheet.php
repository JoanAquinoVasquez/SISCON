<?php

namespace App\Exports;

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

class ReporteRetencionImpuestoSheet implements FromArray, WithStyles, WithTitle, WithEvents, WithColumnWidths
{
    protected $month;
    protected $year;
    protected $rows = [];
    protected $dataCount = 0;

    public function __construct($month, $year)
    {
        $this->month = intval($month);
        $this->year = intval($year);
        $this->buildRows();
    }

    private function buildRows()
    {
        $meses = [
            1 => 'ENERO',
            2 => 'FEBRERO',
            3 => 'MARZO',
            4 => 'ABRIL',
            5 => 'MAYO',
            6 => 'JUNIO',
            7 => 'JULIO',
            8 => 'AGOSTO',
            9 => 'SETIEMBRE',
            10 => 'OCTUBRE',
            11 => 'NOVIEMBRE',
            12 => 'DICIEMBRE'
        ];

        $nombreMes = $meses[$this->month] ?? 'MAYO';

        // Row 1 - 3
        $this->rows[] = ['UNIVERSIDAD NACIONAL PEDRO RUIZ GALLO'];
        $this->rows[] = ['ESCUELA DE POSGRADO', '', '', '', '', '', '', '', '', '', '', '', '', '', '0', 'Sin retención'];
        $this->rows[] = ['LAMBAYEQUE', '', '', '', '', '', '', '', '', '', '', '', '', '', '1', 'Con retención'];
        $this->rows[] = ['']; // Row 4 (blank)

        // Row 5
        $this->rows[] = ["RETENCION DEL IMPUESTO A LA RENTA DE - 4TA. CATEGORÍA"];
        
        // Row 6
        $this->rows[] = ["MES DE {$nombreMes} DE {$this->year}"];
        $this->rows[] = ['']; // Row 6 (blank)

        // Row 7 (Header 1)
        $this->rows[] = [
            'COMPROB. PAGO', '', '', '',
            'RUC',
            'RAZON SOCIAL', '', '',
            'RECIBO POR HONORARIOS', '', '', '', '', '',
            'CODIGO',
            'RETENCIÓN',
            'FACULTAD'
        ];

        // Row 8 (Header 2)
        $this->rows[] = [
            'N/P N°', 'FECHA', 'F PAGO', 'CCI',
            '',
            'PERSONAS NATURALES', '', '',
            'SERIE', 'N°', 'FECHA', 'IMP. TOTAL', 'IMPORT', 'NETO A PAG.',
            '',
            '',
            ''
        ];

        // Fetch payments for external teachers in the given month/year
        $pagos = PagoDocente::with('docente')
            ->whereHas('docente', function ($q) {
                $q->where('tipo_docente', 'LIKE', '%externo%');
            })
            ->whereYear('fecha_constancia_pago', $this->year)
            ->whereMonth('fecha_constancia_pago', $this->month)
            ->orderBy('fecha_constancia_pago')
            ->get();

        $this->dataCount = $pagos->count();

        foreach ($pagos as $pago) {
            $docente = $pago->docente;
            if (!$docente) continue;

            $np = $pago->nota_pago ?? '';
            $fechaNota = $pago->fecha_nota_pago ? date('d/m/Y', strtotime($pago->fecha_nota_pago)) : '';
            $fechaPago = $pago->fecha_constancia_pago ? date('d/m/Y', strtotime($pago->fecha_constancia_pago)) : '';
            $cci = ''; // Left empty
            $ruc = $docente->ruc ?? '';
            
            $apellPat = mb_strtoupper($docente->apellido_paterno ?? '', 'UTF-8');
            $apellMat = mb_strtoupper($docente->apellido_materno ?? '', 'UTF-8');
            $nombres = mb_strtoupper($docente->nombres ?? '', 'UTF-8');

            $recibo = $pago->numero_recibo_honorario ?? '';
            $serie = '';
            $numero = '';
            if (!empty($recibo) && strpos($recibo, '-') !== false) {
                [$serie, $numero] = explode('-', $recibo, 2);
            } else {
                $serie = $recibo;
            }

            $fechaRecibo = $pago->fecha_recibo_honorario ? date('d/m/Y', strtotime($pago->fecha_recibo_honorario)) : '';
            
            $impTotal = (float) $pago->importe_total;
            if ($pago->tiene_retencion_8_porciento) {
                $import = round($impTotal * 0.08, 2);
                $neto = round($impTotal * 0.92, 2);
                $codigo = 1;
            } else {
                $import = ''; // blank cell
                $neto = $impTotal;
                $codigo = 0;
            }

            $this->rows[] = [
                $np,
                $fechaNota,
                $fechaPago,
                $cci,
                $ruc,
                $apellPat,
                $apellMat,
                $nombres,
                $serie,
                $numero,
                $fechaRecibo,
                $impTotal,
                $import,
                $neto,
                $codigo,
                '8',
                'E.P.G'
            ];
        }

        // Add bottom TOTAL row if there is data
        $dataStartRow = 10;
        $dataEndRow = $dataStartRow + $this->dataCount - 1;

        if ($this->dataCount > 0) {
            $this->rows[] = [
                '', '', '', '', '',
                'TOTAL',
                '->',
                '', '', '', '',
                "=SUM(L{$dataStartRow}:L{$dataEndRow})",
                "=SUM(M{$dataStartRow}:M{$dataEndRow})",
                "=SUM(N{$dataStartRow}:N{$dataEndRow})",
                '', '', ''
            ];
        } else {
            $this->rows[] = [
                '', '', '', '', '',
                'TOTAL',
                '->',
                '', '', '', '',
                0,
                0,
                0,
                '', '', ''
            ];
        }
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function title(): string
    {
        return 'RETENCIÓN DEL IMPUESTO';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10, // N/P N°
            'B' => 12, // FECHA
            'C' => 12, // F PAGO
            'D' => 15, // CCI
            'E' => 18, // RUC
            'F' => 20, // APELL. PAT
            'G' => 20, // APELL. MAT
            'H' => 25, // NOMBRES
            'I' => 10, // SER
            'J' => 12, // N°
            'K' => 12, // FECHA RECIBO
            'L' => 14, // IMP. TOTAL
            'M' => 14, // IMPORT
            'N' => 14, // NETO A PAG.
            'O' => 10, // CODIGO
            'P' => 12, // RETENCION
            'Q' => 12, // FACULTAD
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
                $lastCol = 'Q';

                // Row heights
                $sheet->getRowDimension(1)->setRowHeight(20);
                $sheet->getRowDimension(2)->setRowHeight(20);
                $sheet->getRowDimension(3)->setRowHeight(20);
                $sheet->getRowDimension(5)->setRowHeight(25);
                $sheet->getRowDimension(6)->setRowHeight(25);
                $sheet->getRowDimension(8)->setRowHeight(20);
                $sheet->getRowDimension(9)->setRowHeight(20);

                // Row 1 - 3 styles (bold, size 11, left-aligned)
                $sheet->getStyle('A1:A3')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                    ],
                ]);

                // Shading and border for legend O2:P3
                $sheet->getStyle('O2:O3')->applyFromArray([
                    'font' => [
                        'bold' => true,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FF000000'],
                        ],
                    ],
                ]);

                // Row 5 style (bold, size 12, merged A5:Q5, centered)
                $sheet->mergeCells('A5:Q5');
                $sheet->getStyle('A5')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 12,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // Row 6 style (bold, size 12, merged A6:Q6, centered)
                $sheet->mergeCells('A6:Q6');
                $sheet->getStyle('A6')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 12,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // Merge headers vertically and horizontally
                $sheet->mergeCells('A8:D8'); // COMPROB. PAGO
                $sheet->mergeCells('E8:E9'); // RUC
                $sheet->mergeCells('F8:H8'); // RAZON SOCIAL
                $sheet->mergeCells('F9:H9'); // PERSONAS NATURALES
                $sheet->mergeCells('I8:N8'); // RECIBO POR HONORARIOS
                $sheet->mergeCells('O8:O9'); // CODIGO
                $sheet->mergeCells('P8:P9'); // RETENCIÓN
                $sheet->mergeCells('Q8:Q9'); // FACULTAD

                // Header styling (thin borders, bold, centered)
                $sheet->getStyle("A8:Q9")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 10,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FF000000'],
                        ],
                    ],
                ]);

                // Data rows styling
                if ($highestRow >= 10) {
                    $dataEnd = $highestRow;
                    $hasTotal = false;

                    // If the last row contains the TOTAL formula, it's a footer row
                    if ($sheet->getCell("F{$highestRow}")->getValue() === 'TOTAL') {
                        $dataEnd = $highestRow - 1;
                        $hasTotal = true;
                    }

                    if ($dataEnd >= 10) {
                        $sheet->getStyle("A10:{$lastCol}{$dataEnd}")->applyFromArray([
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color' => ['argb' => 'FF000000'],
                                ],
                            ],
                            'alignment' => [
                                'vertical' => Alignment::VERTICAL_CENTER,
                            ],
                        ]);

                        // Alignments for specific columns
                        $sheet->getStyle("A10:E{$dataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("I10:K{$dataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("O10:Q{$dataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        
                        // Formats for currency columns
                        $currencyFormat = '"S/." #,##0.00';
                        $sheet->getStyle("L10:N{$dataEnd}")->getNumberFormat()->setFormatCode($currencyFormat);

                        // Set RUC and receipt details as string explicitly to prevent scientific notation or dropping leading zeros
                        for ($row = 10; $row <= $dataEnd; $row++) {
                            $sheet->getCell("E{$row}")->setValueExplicit($sheet->getCell("E{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                            $sheet->getCell("I{$row}")->setValueExplicit($sheet->getCell("I{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                            $sheet->getCell("J{$row}")->setValueExplicit($sheet->getCell("J{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        }
                    }

                    // TOTAL row styling
                    if ($hasTotal) {
                        $sheet->getRowDimension($highestRow)->setRowHeight(25);
                        $sheet->getStyle("A{$highestRow}:{$lastCol}{$highestRow}")->applyFromArray([
                            'font' => [
                                'bold' => true,
                            ],
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color' => ['argb' => 'FF000000'],
                                ],
                            ],
                            'alignment' => [
                                'vertical' => Alignment::VERTICAL_CENTER,
                            ],
                        ]);

                        $sheet->getStyle("F{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("G{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                        // Currency formats for total sums
                        $currencyFormat = '"S/." #,##0.00';
                        $sheet->getStyle("L{$highestRow}:N{$highestRow}")->getNumberFormat()->setFormatCode($currencyFormat);
                    }
                }
            },
        ];
    }
}
