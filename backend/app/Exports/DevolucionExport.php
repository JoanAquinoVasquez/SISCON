<?php

namespace App\Exports;

use App\Models\Devolucion;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class DevolucionExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle, WithColumnFormatting, WithEvents
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Devolucion::with(['programa.grado', 'programa.facultad', 'expedientes']);

        if (isset($this->filters['search']) && $this->filters['search']) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('persona', 'LIKE', "%{$search}%")
                    ->orWhere('dni', 'LIKE', "%{$search}%")
                    ->orWhere('numero_voucher', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_direccion', 'LIKE', "%{$search}%");
            });
        }

        if (isset($this->filters['tipo_devolucion']) && $this->filters['tipo_devolucion']) {
            $query->where('tipo_devolucion', $this->filters['tipo_devolucion']);
        }

        if (isset($this->filters['estado']) && $this->filters['estado']) {
            $estado = $this->filters['estado'];
            $query->whereHas('expedientes', function ($q) use ($estado) {
                $q->where('estado', $estado);
            });
        }

        if (isset($this->filters['programa_id']) && $this->filters['programa_id']) {
            $query->where('programa_id', $this->filters['programa_id']);
        }

        if (isset($this->filters['id']) && $this->filters['id']) {
            $query->where('id', $this->filters['id']);
        }

        return $query->latest('id')->get();
    }

    public function headings(): array
    {
        return [
            ['RELACIÓN DE SOLICITUDES DE DEVOLUCIÓN DE DINERO'],
            [
                'ID',
                'Persona Solicitante',
                'DNI',
                'Programa de Posgrado',
                'Proceso Admisión',
                'Tipo Devolución',
                'Importe',
                'N° Voucher',
                'N° Oficio Dirección',
                'N° Expediente MP',
                'Estado'
            ]
        ];
    }

    public function map($dev): array
    {
        $programa = $dev->programa;
        $programaNombre = $programa ? "{$programa->grado->nombre} en {$programa->nombre} ({$programa->periodo})" : '';
        
        $tipoLabel = '';
        switch ($dev->tipo_devolucion) {
            case 'inscripcion': $tipoLabel = 'Derecho de Inscripción'; break;
            case 'idiomas': $tipoLabel = 'Idiomas'; break;
            case 'grados_titulos': $tipoLabel = 'Grados y Títulos'; break;
            case 'certificado_estudios': $tipoLabel = 'Certificado de Estudios'; break;
            case 'otros': $tipoLabel = 'Otros'; break;
            default: $tipoLabel = $dev->tipo_devolucion; break;
        }

        $expedienteNumero = $dev->expedientes->first()?->numero_expediente_mesa_partes ?? '';
        $estadoLabel = $dev->expedientes->first()?->estado ?? 'pendiente';

        $estados = [
            'pendiente' => 'Pendiente',
            'en_proceso' => 'En Proceso',
            'completado' => 'Completado',
            'rechazado' => 'Rechazado',
            'sin_efecto' => 'Sin Efecto',
            'para_conocimiento' => 'Para Conocimiento',
        ];
        $estadoLabel = $estados[$estadoLabel] ?? $estadoLabel;

        return [
            $dev->id,
            $dev->persona,
            $dev->dni,
            $programaNombre,
            $dev->proceso_admision,
            $tipoLabel,
            (float) $dev->importe,
            $dev->numero_voucher,
            $dev->numero_oficio_direccion,
            $expedienteNumero,
            ucfirst($estadoLabel)
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
                $highestColumn = $sheet->getHighestColumn();
                $highestRow = $sheet->getHighestRow();

                // Merge Title Row
                $sheet->mergeCells('A1:' . $highestColumn . '1');

                // Style Title
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 16,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF1F4E78'], // Dark Blue
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);
                $sheet->getRowDimension(1)->setRowHeight(30);

                // Style Headers (Row 2)
                $sheet->getStyle('A2:' . $highestColumn . '2')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF2F5597'], // Medium Blue
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
                $sheet->getRowDimension(2)->setRowHeight(25);

                // Style Data Rows
                if ($highestRow > 2) {
                    $sheet->getStyle('A3:' . $highestColumn . $highestRow)->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FFBFBFBF'],
                            ],
                        ],
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                    // Default center alignment
                    $sheet->getStyle('A3:' . $highestColumn . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    // Left alignment for specific columns: Persona (B), Programa (D)
                    $sheet->getStyle('B3:B' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle('D3:D' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                }

                // Add Footer Row with total amount
                $footerRow = $highestRow + 1;
                $sheet->setCellValue('A' . $footerRow, 'TOTAL IMPORTES:');
                $sheet->setCellValue('G' . $footerRow, "=SUM(G3:G{$highestRow})");

                $sheet->getStyle('A' . $footerRow . ':' . $highestColumn . $footerRow)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF2F5597'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);
                $sheet->getRowDimension($footerRow)->setRowHeight(25);
            },
        ];
    }

    public function columnFormats(): array
    {
        return [
            'G' => '"S/." #,##0.00',
        ];
    }

    public function title(): string
    {
        return 'Devoluciones';
    }
}
