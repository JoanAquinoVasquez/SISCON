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

class ReportePrestadorCuartaCategoriaSheet implements FromArray, WithStyles, WithTitle, WithEvents, WithColumnWidths
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
        $this->rows[] = ['']; // Row 4 (blank)

        // Row 5
        $this->rows[] = ["DATOS PRINCIPALES DEL PRESTADOR DE SERVICIOS DE CUARTA CATEGORIA MES DE {$nombreMes} DE {$this->year}"];
        $this->rows[] = ['']; // Row 6 (blank)

        // Row 7
        $this->rows[] = [
            'TIPO',
            'DNI',
            'RUC',
            'APELL. PAT',
            'APELL. MAT',
            'NOMBRES',
            'FECHA NAC',
            'SEXO',
            'NACION'
        ];

        // Row 8
        $this->rows[] = [
            'DOC.',
            '',
            '',
            '',
            '',
            '',
            '',
            '1: H, 2: F',
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

        foreach ($pagos as $pago) {
            $docente = $pago->docente;
            if (!$docente) continue;

            $dni = $docente->dni ?? '';
            $ruc = $docente->ruc ?? '';
            $apellPat = mb_strtoupper($docente->apellido_paterno ?? '', 'UTF-8');
            $apellMat = mb_strtoupper($docente->apellido_materno ?? '', 'UTF-8');
            $nombres = mb_strtoupper($docente->nombres ?? '', 'UTF-8');

            $fechaNac = '';
            if ($docente->fecha_nacimiento) {
                $fechaNac = date('d/m/Y', strtotime($docente->fecha_nacimiento));
            }

            $genero = strtoupper($docente->genero ?? '');
            if ($genero === 'M') {
                $sexo = 1;
            } elseif ($genero === 'F') {
                $sexo = 2;
            } else {
                $sexo = '';
            }

            $this->rows[] = [
                '1', // TIPO DOC
                $dni,
                $ruc,
                $apellPat,
                $apellMat,
                $nombres,
                $fechaNac,
                $sexo,
                '9589' // NACION
            ];
        }
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function title(): string
    {
        return 'DATOS PRINCIPALES';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10, // TIPO DOC.
            'B' => 15, // DNI
            'C' => 18, // RUC
            'D' => 25, // APELL. PAT
            'E' => 25, // APELL. MAT
            'F' => 30, // NOMBRES
            'G' => 15, // FECHA NAC
            'H' => 15, // SEXO
            'I' => 12, // NACION
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
                $lastCol = 'I';

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

                // Row 5 style (bold, size 12, merged A5:I5, centered)
                $sheet->mergeCells('A5:I5');
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

                // Merge headers vertically for columns without row 7/8 split
                $sheet->mergeCells('B7:B8');
                $sheet->mergeCells('C7:C8');
                $sheet->mergeCells('D7:D8');
                $sheet->mergeCells('E7:E8');
                $sheet->mergeCells('F7:F8');
                $sheet->mergeCells('G7:G8');
                $sheet->mergeCells('I7:I8');

                // Header styling (thin borders, bold, centered)
                $sheet->getStyle("A7:I8")->applyFromArray([
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

                // Specific header H7:H8 shading (grey background)
                $sheet->getStyle("H7:H8")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FFE0E0E0'],
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

                    // Alignments for specific data columns
                    $sheet->getStyle("A9:C{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("G9:I{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    
                    // Set RUC and DNI as text format explicitly to prevent scientific notation or dropping leading zeros
                    for ($row = 9; $row <= $highestRow; $row++) {
                        $sheet->getCell("B{$row}")->setValueExplicit($sheet->getCell("B{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        $sheet->getCell("C{$row}")->setValueExplicit($sheet->getCell("C{$row}")->getValue(), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                    }
                }
            },
        ];
    }
}
