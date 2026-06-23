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

class ReporteDetCompSheet implements FromArray, WithStyles, WithTitle, WithEvents, WithColumnWidths
{
    protected $month;
    protected $year;
    protected $rows = [];

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
        $this->rows[] = ['ESCUELA DE POSGRADO', '', '', '', '', '', '', '', '0', 'Sin retención'];
        $this->rows[] = ['LAMBAYEQUE', '', '', '', '', '', '', '', '1', 'Con retención'];
        $this->rows[] = ['']; // Row 4 (blank)

        // Row 5
        $this->rows[] = ["MES DE {$nombreMes} DE {$this->year}"];
        $this->rows[] = ['']; // Row 6 (blank)

        // Row 7 (Header 1)
        $this->rows[] = [
            'T-DOC',
            'DNI',
            'RUC',
            'COMPROBANTE', '', '',
            'IMP.TOTAL HONORARIOS',
            'FECHA EMISION',
            'FECHA PAGO',
            'CODIGO'
        ];

        // Row 8 (Header 2)
        $this->rows[] = [
            '',
            '',
            '',
            'T-COMP',
            'SERIE',
            'Nº',
            '',
            '',
            '',
            '1, 0'
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

        foreach ($pagos as $pago) {
            $docente = $pago->docente;
            if (!$docente) continue;

            $dni = $docente->dni ?? '';
            $ruc = $docente->ruc ?? '';
            
            $recibo = $pago->numero_recibo_honorario ?? '';
            $serie = '';
            $numero = '';
            if (!empty($recibo) && strpos($recibo, '-') !== false) {
                [$serie, $numero] = explode('-', $recibo, 2);
            } else {
                $serie = $recibo;
            }

            $fechaRecibo = $pago->fecha_recibo_honorario ? date('d/m/Y', strtotime($pago->fecha_recibo_honorario)) : '';
            $fechaPago = $pago->fecha_constancia_pago ? date('d/m/Y', strtotime($pago->fecha_constancia_pago)) : '';
            
            $impTotal = (float) $pago->importe_total;
            $codigo = $pago->tiene_retencion_8_porciento ? 1 : 0;

            $this->rows[] = [
                '01', // T-DOC always 01
                $dni,
                $ruc,
                'R.P.H.E', // T-COMP
                $serie,
                $numero,
                $impTotal,
                $fechaRecibo,
                $fechaPago,
                $codigo
            ];
        }
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function title(): string
    {
        return 'DET. DE COMP';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10, // T-DOC
            'B' => 15, // DNI
            'C' => 18, // RUC
            'D' => 12, // T-COMP
            'E' => 12, // SERIE
            'F' => 12, // Nº
            'G' => 20, // IMP.TOTAL HONORARIOS
            'H' => 16, // FECHA EMISION
            'I' => 16, // FECHA PAGO
            'J' => 12, // CODIGO
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
                $lastCol = 'J';

                // Row heights
                $sheet->getRowDimension(1)->setRowHeight(20);
                $sheet->getRowDimension(2)->setRowHeight(20);
                $sheet->getRowDimension(3)->setRowHeight(20);
                $sheet->getRowDimension(5)->setRowHeight(25);
                $sheet->getRowDimension(7)->setRowHeight(20);
                $sheet->getRowDimension(8)->setRowHeight(20);

                // Row 1 - 3 styles (bold, size 11, left-aligned)
                $sheet->getStyle('A1:A3')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                    ],
                ]);

                // Shading and border for legend I2:J3
                $sheet->getStyle('I2:I3')->applyFromArray([
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

                // Row 5 style (bold, size 12, merged A5:J5, centered)
                $sheet->mergeCells('A5:J5');
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

                // Merge headers vertically and horizontally
                $sheet->mergeCells('A7:A8'); // T-DOC
                $sheet->mergeCells('B7:B8'); // DNI
                $sheet->mergeCells('C7:C8'); // RUC
                $sheet->mergeCells('D7:F7'); // COMPROBANTE
                $sheet->mergeCells('G7:G8'); // IMP.TOTAL HONORARIOS
                $sheet->mergeCells('H7:H8'); // FECHA EMISION
                $sheet->mergeCells('I7:I8'); // FECHA PAGO
                $sheet->mergeCells('J7:J8'); // CODIGO

                // Header styling (thin borders, bold, centered)
                $sheet->getStyle("A7:J8")->applyFromArray([
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
                if ($highestRow >= 9) {
                    $sheet->getStyle("A9:{$lastCol}{$highestRow}")->applyFromArray([
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
                    $sheet->getStyle("A9:F{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("H9:J{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    
                    // Format for currency column
                    $currencyFormat = '"S/." #,##0.00';
                    $sheet->getStyle("G9:G{$highestRow}")->getNumberFormat()->setFormatCode($currencyFormat);

                    // Set text formats explicitly to prevent scientific notation or dropping leading zeros
                    for ($row = 9; $row <= $highestRow; $row++) {
                        $sheet->getCell("A{$row}")->setValueExplicit($sheet->getCell("A{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        $sheet->getCell("B{$row}")->setValueExplicit($sheet->getCell("B{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        $sheet->getCell("C{$row}")->setValueExplicit($sheet->getCell("C{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        $sheet->getCell("E{$row}")->setValueExplicit($sheet->getCell("E{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        $sheet->getCell("F{$row}")->setValueExplicit($sheet->getCell("F{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                    }
                }
            },
        ];
    }
}
