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

class ReporteDatosPrestadorSheet implements FromArray, WithStyles, WithTitle, WithEvents, WithColumnWidths
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
        $this->rows[] = ['ESCUELA DE POSGRADO'];
        $this->rows[] = ['LAMBAYEQUE'];
        $this->rows[] = ['']; // Row 4

        // Row 5
        $this->rows[] = ["DATOS DEL PERSONAL DE SERVICIOS - 4TA. CATEGORÍA"];
        
        // Row 6
        $this->rows[] = ["MES DE {$nombreMes} DE {$this->year}"];
        $this->rows[] = ['']; // Row 7

        // Row 8 (Header)
        $this->rows[] = [
            '', '', '',
            'DNI',
            'RUC'
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

            $this->rows[] = [
                '', '', '',
                $dni,
                $ruc
            ];
        }
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function title(): string
    {
        return 'DATOS PRESTADOR';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10,
            'B' => 10,
            'C' => 10,
            'D' => 18, // DNI
            'E' => 20, // RUC
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

                // Row heights
                $sheet->getRowDimension(1)->setRowHeight(20);
                $sheet->getRowDimension(2)->setRowHeight(20);
                $sheet->getRowDimension(3)->setRowHeight(20);
                $sheet->getRowDimension(5)->setRowHeight(25);
                $sheet->getRowDimension(6)->setRowHeight(25);
                $sheet->getRowDimension(8)->setRowHeight(20);

                // Row 1 - 3 styles (bold, size 11, left-aligned)
                $sheet->getStyle('A1:A3')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                    ],
                ]);

                // Row 5 style (bold, size 12, merged A5:E5, centered)
                $sheet->mergeCells('A5:E5');
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

                // Row 6 style (bold, size 12, merged A6:E6, centered)
                $sheet->mergeCells('A6:E6');
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

                // Header styling for D8:E8 (thin borders, bold, centered)
                $sheet->getStyle("D8:E8")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 10,
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

                // Data rows styling for D9:E$highestRow
                if ($highestRow >= 9) {
                    $sheet->getStyle("D9:E{$highestRow}")->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FF000000'],
                            ],
                        ],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                    // Set DNI and RUC explicitly as text format to prevent scientific notation/dropped zeros
                    for ($row = 9; $row <= $highestRow; $row++) {
                        $sheet->getCell("D{$row}")->setValueExplicit($sheet->getCell("D{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        $sheet->getCell("E{$row}")->setValueExplicit($sheet->getCell("E{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                    }
                }
            },
        ];
    }
}
