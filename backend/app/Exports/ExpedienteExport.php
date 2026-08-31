<?php

namespace App\Exports;

use App\Models\Expediente;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ExpedienteExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle, WithEvents
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Expediente::with(['docente', 'curso', 'pagoDocente', 'semestre.programa.grado', 'devolucion.programa.grado']);

        if (isset($this->filters['search']) && $this->filters['search']) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('numero_documento', 'LIKE', "%{$search}%")
                    ->orWhere('numero_expediente_mesa_partes', 'LIKE', "%{$search}%")
                    ->orWhere('remitente', 'LIKE', "%{$search}%")
                    ->orWhere('tipo_asunto', 'LIKE', "%{$search}%")
                    ->orWhere('descripcion_asunto', 'LIKE', "%{$search}%")
                    ->orWhereHas('docente', function ($qDocente) use ($search) {
                        $qDocente->where('nombres', 'LIKE', "%{$search}%")
                            ->orWhere('apellido_paterno', 'LIKE', "%{$search}%")
                            ->orWhere('apellido_materno', 'LIKE', "%{$search}%")
                            ->orWhereRaw("CONCAT_WS(' ', nombres, apellido_paterno, apellido_materno) LIKE ?", ["%{$search}%"])
                            ->orWhereRaw("CONCAT_WS(' ', apellido_paterno, apellido_materno, nombres) LIKE ?", ["%{$search}%"]);
                    })
                    ->orWhereHas('curso', function ($qCurso) use ($search) {
                        $qCurso->where('nombre', 'LIKE', "%{$search}%")
                            ->orWhere('codigo', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('semestre.programa', function ($qPrograma) use ($search) {
                        $qPrograma->where('nombre', 'LIKE', "%{$search}%")
                            ->orWhereHas('grado', function ($qGrado) use ($search) {
                                $qGrado->where('nombre', 'LIKE', "%{$search}%");
                            });
                    })
                    ->orWhereHas('pagoDocente', function ($qPago) use ($search) {
                        $qPago->where('estado', 'LIKE', "%{$search}%");
                    });
            });
        }

        if (isset($this->filters['tipo_asunto']) && $this->filters['tipo_asunto']) {
            $query->where('tipo_asunto', $this->filters['tipo_asunto']);
        }

        if (isset($this->filters['estado']) && $this->filters['estado']) {
            $query->where('estado', $this->filters['estado']);
        }

        return $query->latest()->get();
    }

    public function headings(): array
    {
        return [
            ['RELACIÓN DE EXPEDIENTES RECIBIDOS EN CONTABILIDAD'],
            [
                'ID',
                'N° Expediente MP',
                'Fecha Mesa Partes',
                'Documento Recibido',
                'Remitente',
                'Tipo Asunto',
                'Docente / Solicitante',
                'Curso / Detalle',
                'Estado',
                'Fecha Recep. Conta'
            ]
        ];
    }

    public function map($exp): array
    {
        $programa = $exp->programa ?? ($exp->semestre->programa ?? null);
        $gradoPrograma = $programa ? "{$programa->grado->nombre} en {$programa->nombre}" : '';
        
        // Docente o Persona Devolucion
        $solicitante = '';
        if ($exp->tipo_asunto === 'devolucion') {
            $solicitante = $exp->devolucion->persona ?? $exp->persona_devolucion ?? '';
        } else if ($exp->docente) {
            $solicitante = ($exp->docente->titulo_profesional ? $exp->docente->titulo_profesional . ' ' : '') .
                "{$exp->docente->nombres} {$exp->docente->apellido_paterno} {$exp->docente->apellido_materno}";
        }

        // Curso o Detalle Devolucion
        $detalle = '';
        if ($exp->tipo_asunto === 'devolucion') {
            $tipoDev = $exp->devolucion->tipo_devolucion ?? $exp->tipo_devolucion ?? '';
            $importe = $exp->devolucion->importe ?? $exp->importe_devolucion ?? 0;
            $detalle = "Devolución (" . ucfirst($tipoDev) . ") - Importe: S/ " . number_format($importe, 2);
        } else if ($exp->curso) {
            $periodo = ($exp->semestre && $exp->semestre->programa) ? $exp->semestre->programa->periodo : '';
            $detalle = "Curso: {$exp->curso->nombre} - {$gradoPrograma}" . ($periodo ? " ({$periodo})" : '');
        } else if ($exp->descripcion_asunto) {
            $detalle = $exp->descripcion_asunto;
        }

        // Label Tipo Asunto
        $tipos = [
            'descripcion' => 'Descripción',
            'presentacion' => 'Presentación',
            'conformidad' => 'Conformidad',
            'devolucion' => 'Devolución',
        ];
        $tipoLabel = $tipos[$exp->tipo_asunto] ?? $exp->tipo_asunto;

        // Label Estado
        $estados = [
            'pendiente' => 'Pendiente',
            'en_proceso' => 'En Proceso',
            'completado' => 'Completado',
            'rechazado' => 'Rechazado',
            'sin_efecto' => 'Sin Efecto',
            'para_conocimiento' => 'Para Conocimiento',
        ];
        $estadoLabel = $estados[$exp->estado] ?? $exp->estado;

        return [
            $exp->id,
            $exp->numero_expediente_mesa_partes,
            $exp->fecha_mesa_partes ? date('d-m-Y', strtotime($exp->fecha_mesa_partes)) : '',
            $exp->numero_documento,
            $exp->remitente,
            $tipoLabel,
            $solicitante,
            $detalle,
            $estadoLabel,
            $exp->fecha_recepcion_contabilidad ? date('d-m-Y', strtotime($exp->fecha_recepcion_contabilidad)) : '',
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
                        'startColor' => ['argb' => 'FF1F4E78'], // Darker Blue
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
                        'startColor' => ['argb' => 'FF2F5597'], // Medium Dark Blue
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

                    // Left alignment for text heavy columns: Remitente (E), Docente/Solicitante (G), Curso/Detalle (H)
                    $sheet->getStyle('E3:E' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle('G3:G' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle('H3:H' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                }
            },
        ];
    }

    public function title(): string
    {
        return 'Expedientes';
    }
}
