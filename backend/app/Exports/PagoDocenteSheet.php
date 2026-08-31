<?php

namespace App\Exports;

use App\Models\PagoDocente;
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

class PagoDocenteSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle, WithColumnFormatting, WithEvents
{
    protected $tipoDocente;
    protected $filters;

    public function __construct($tipoDocente, $filters)
    {
        $this->tipoDocente = $tipoDocente;
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = PagoDocente::with(['docente', 'curso.semestres.programa.facultad', 'curso.semestres.programa.grado']);

        if (isset($this->filters['search']) && $this->filters['search']) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                // Docente
                $q->whereHas('docente', function ($q) use ($search) {
                    $q->where('nombres', 'LIKE', "%{$search}%")
                        ->orWhere('apellido_paterno', 'LIKE', "%{$search}%")
                        ->orWhere('apellido_materno', 'LIKE', "%{$search}%")
                        ->orWhereRaw("CONCAT_WS(' ', nombres, apellido_paterno, apellido_materno) LIKE ?", ["%{$search}%"])
                        ->orWhereRaw("CONCAT_WS(' ', apellido_paterno, apellido_materno, nombres) LIKE ?", ["%{$search}%"])
                        ->orWhere('dni', 'LIKE', "%{$search}%");
                })
                    // Curso
                    ->orWhereHas('curso', function ($q) use ($search) {
                        $q->where('nombre', 'LIKE', "%{$search}%")
                            ->orWhere('codigo', 'LIKE', "%{$search}%");
                    })
                    // Programa (via Curso -> Semestres -> Programa) and Grado
                    ->orWhereHas('curso.semestres.programa', function ($q) use ($search) {
                        $q->where('nombre', 'LIKE', "%{$search}%")
                            ->orWhereHas('grado', function ($qGrado) use ($search) {
                                $qGrado->where('nombre', 'LIKE', "%{$search}%");
                            });
                    })
                    // Direct fields
                    ->orWhere('periodo', 'LIKE', "%{$search}%")
                    ->orWhere('importe_total', 'LIKE', "%{$search}%")
                    ->orWhere('numero_horas', 'LIKE', "%{$search}%")
                    // Document Numbers
                    ->orWhere('numero_oficio_presentacion_facultad', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_presentacion_coordinador', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_presentacion_direccion', 'LIKE', "%{$search}%")
                    ->orWhere('numero_resolucion_aprobacion', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_conformidad_facultad', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_conformidad_coordinador', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_conformidad_direccion', 'LIKE', "%{$search}%")
                    ->orWhere('numero_resolucion_pago', 'LIKE', "%{$search}%")
                    ->orWhere('numero_oficio_contabilidad', 'LIKE', "%{$search}%");
            });
        }

        if (isset($this->filters['periodo']) && $this->filters['periodo']) {
            $query->where('periodo', $this->filters['periodo']);
        }

        if (isset($this->filters['programa_id']) && $this->filters['programa_id']) {
            $programaId = $this->filters['programa_id'];
            $query->whereHas('curso.semestres', function ($q) use ($programaId) {
                $q->where('programa_id', $programaId);
            });
        }

        if (isset($this->filters['id']) && $this->filters['id']) {
            $query->where('id', $this->filters['id']);
        }

        if (isset($this->filters['estado']) && $this->filters['estado'] && $this->filters['estado'] !== 'todos') {
            $estado = $this->filters['estado'];
            $query->whereHas('expedientes', function ($q) use ($estado) {
                $q->where('estado', $estado);
            });
        }

        // Filter by the specific type for this sheet
        $tipoDocente = $this->tipoDocente;
        $query->whereHas('docente', function ($q) use ($tipoDocente) {
            $q->where('tipo_docente', $tipoDocente);
        });

        return $query->get();
    }

    public function headings(): array
    {
        $periodo = isset($this->filters['periodo']) ? ' - ' . $this->filters['periodo'] : '';
        $title = 'RELACIÓN DE DOCENTES ' . strtoupper($this->tipoDocente) . 'S' . $periodo;

        $headers = [];
        if (strpos($this->tipoDocente, 'externo') !== false) {
            $headers = [
                'N°',
                'MES DE PAGO',
                'NOTA DE PAGO',
                'Registro SIAF',
                'O/S',
                'P/S',
                'DOCENTE',
                'CURSO',
                'PROGRAMA',
                'N° HORAS',
                'COSTO HORA',
                'IMPORTE',
                'FECHAS',
                'OF. PRES. COORD',
                'OF. PRES. FACULTAD',
                'OF. PRES. DIRECCIÓN',
                'OF. CONF. COORD',
                'OF. CONF. FACULTAD',
                'OF. CONF. DIRECCIÓN',
                'OF. CONTABILIDAD',
                'OF. DIRECCIÓN (ESP)',
                'RESOLUCIÓN N°',
                'FN',
                'DNI',
                'TELEFONO',
                'CORREO',
                'R/H',
                'F/E',
                'ESTADO DE PAGO'
            ];
        } elseif (strpos($this->tipoDocente, 'interno') !== false) {
            $headers = [
                'N°',
                'ESTADO DE PAGO',
                'DOCENTE',
                'CURSO',
                'PROGRAMA',
                'N° HORAS',
                'COSTO HORA',
                'IMPORTE',
                'FECHAS',
                'OF. PRES. COORD',
                'OF. PRES. FACULTAD',
                'OF. PRES. DIRECCIÓN',
                'OF. CONF. COORD',
                'OF. CONF. FACULTAD',
                'OF. CONF. DIRECCIÓN',
                'OF. CONTABILIDAD',
                'OF. DIRECCIÓN (ESP)',
                'RESOLUCIÓN N°',
                'Registro SIAF',
                'N/P',
            ];
        }

        return [
            [$title],
            $headers
        ];
    }

    public function map($pago): array
    {
        $semestre = $pago->curso->semestres->first(function ($s) use ($pago) {
            return $s->programa && $s->programa->periodo === $pago->periodo;
        });
        $programa = $semestre ? $semestre->programa : ($pago->curso->semestres->first()->programa ?? null);
        $programaNombre = $programa ? "{$programa->grado->nombre} en {$programa->nombre}" : '';

        $docenteNombre = $pago->docente
            ? ($pago->docente->titulo_profesional ? $pago->docente->titulo_profesional . ' ' : '') .
            "{$pago->docente->nombres} {$pago->docente->apellido_paterno} {$pago->docente->apellido_materno}"
            : '';

        $fechas = $this->formatFechasEnsenanza($pago->fechas_ensenanza);

        $notaPago = $pago->nota_pago;
        if ($pago->nota_pago_2) {
            $notaPago .= "\n" . $pago->nota_pago_2;
        }

        if (strpos($this->tipoDocente, 'externo') !== false) {
            $mesPago = '';
            if ($pago->fecha_constancia_pago) {
                $meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                $mesIndex = date('n', strtotime($pago->fecha_constancia_pago)) - 1;
                $mesPago = $meses[$mesIndex] ?? '';
            }

            $fechaRecibo = $pago->fecha_recibo_honorario
                ? date('d-m-Y', strtotime($pago->fecha_recibo_honorario))
                : '';

            return [
                $pago->id,
                $mesPago,
                $notaPago,
                $pago->numero_exp_siaf,
                $pago->orden_servicio,
                $pago->numero_pedido_servicio,
                $docenteNombre,
                $pago->curso->nombre ?? '',
                $programaNombre,
                $pago->numero_horas,
                (float) $pago->costo_por_hora,
                (float) $pago->importe_total,
                $fechas,
                $pago->numero_oficio_presentacion_coordinador,
                $pago->numero_oficio_presentacion_facultad,
                $pago->numero_oficio_presentacion_direccion,
                $pago->numero_oficio_conformidad_coordinador,
                $pago->numero_oficio_conformidad_facultad,
                $pago->numero_oficio_conformidad_direccion,
                $pago->numero_oficio_contabilidad,
                $pago->oficio_direccion_exp_docentes,
                $pago->numero_resolucion_pago,
                $pago->docente->fecha_nacimiento ?? '',
                $pago->docente->dni ?? '',
                $pago->docente->numero_telefono ?? '',
                $pago->docente->email ?? '',
                $pago->numero_recibo_honorario,
                $fechaRecibo,
                ucfirst($pago->estado),
            ];
        }

        if (strpos($this->tipoDocente, 'interno') !== false) {
            return [
                $pago->id,
                ucfirst($pago->estado),
                $docenteNombre,
                $pago->curso->nombre ?? '',
                $programaNombre,
                $pago->numero_horas,
                (float) $pago->costo_por_hora,
                (float) $pago->importe_total,
                $fechas,
                $pago->numero_oficio_presentacion_coordinador,
                $pago->numero_oficio_presentacion_facultad,
                $pago->numero_oficio_presentacion_direccion,
                $pago->numero_oficio_conformidad_coordinador,
                $pago->numero_oficio_conformidad_facultad,
                $pago->numero_oficio_conformidad_direccion,
                $pago->numero_oficio_contabilidad,
                $pago->oficio_direccion_exp_docentes,
                $pago->numero_resolucion_pago,
                $pago->numero_exp_siaf,
                $notaPago,
            ];
        }

        return [];
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
                $groups[$key] = [
                    'month' => $month,
                    'year' => $year,
                    'days' => []
                ];
            }
            $groups[$key]['days'][] = $day;
        }

        $parts = [];
        $keys = array_keys($groups);
        $lastIndex = count($keys) - 1;

        foreach ($keys as $index => $key) {
            $group = $groups[$key];
            $days = $group['days'];

            // Format days: "05, 12, 19 y 26"
            $daysStr = '';
            if (count($days) === 1) {
                $daysStr = $days[0];
            } else {
                $lastDay = array_pop($days);
                $daysStr = implode(', ', $days) . ' y ' . $lastDay;
            }

            $part = "{$daysStr} de {$meses[$group['month']]}";

            // Add year if it's the last group or if the next group has a different year
            $nextKey = $keys[$index + 1] ?? null;
            $nextYear = $nextKey ? $groups[$nextKey]['year'] : null;

            if ($index === $lastIndex || $group['year'] !== $nextYear) {
                $part .= " de {$group['year']}";
            }

            $parts[] = $part;
        }

        return implode(', ', $parts);
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
                        'startColor' => ['argb' => 'FF4472C4'],
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
                        'startColor' => ['argb' => 'FF4472C4'],
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
                                'color' => ['argb' => 'FF000000'],
                            ],
                        ],
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_CENTER,
                            'wrapText' => true,
                        ],
                    ]);

                    // Center alignment for specific columns (N°, Dates, Codes)
                    // This depends on column index, which varies by type.
                    // A simple approach is to center everything except Names and Descriptions
                    // But names are in different columns.
                    // Externo: G (Docente), H (Curso), I (Programa), K (Fechas), L (Oficio) -> Left/Justify
                    // Interno: C (Docente), D (Curso), E (Programa), G (Fechas), H (Oficio) -> Left/Justify
    
                    // Default center all, then override specific columns
                    $sheet->getStyle('A3:' . $highestColumn . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    if (strpos($this->tipoDocente, 'externo') !== false) {
                        // Docente (G), Curso (H), Programa (I), Fechas (M)
                        $sheet->getStyle('G3:G' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle('H3:H' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle('I3:I' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle('M3:M' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    } elseif (strpos($this->tipoDocente, 'interno') !== false) {
                        // Docente (C), Curso (D), Programa (E), Fechas (I)
                        $sheet->getStyle('C3:C' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle('D3:D' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle('E3:E' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle('I3:I' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    }
                }
                // Add Footer Row with Totals
                $footerRow = $highestRow + 1;
                $totalDocentes = $highestRow - 2; // Subtract title and header rows
    
                // Calculate Total Importe
                // Column L for Externo, H for Interno
                $importeColumn = (strpos($this->tipoDocente, 'externo') !== false) ? 'L' : 'H';
                $totalImporteFormula = "=SUM({$importeColumn}3:{$importeColumn}{$highestRow})";

                // Set values
                $sheet->setCellValue('A' . $footerRow, 'TOTAL DOCENTES: ' . $totalDocentes);
                $sheet->setCellValue($importeColumn . $footerRow, $totalImporteFormula);

                // Merge cells for Total Docentes label if needed, or just set it in A
                // Let's merge A to (ImporteColumn - 1) for the label "TOTAL DOCENTES: X"
                // Actually, user asked for "Total Docentes" and "Total Importe".
                // Let's put "TOTAL DOCENTES: X" in the first few columns and "TOTAL IMPORTE" in the importe column.
    
                // Better approach:
                // A: "TOTAL DOCENTES: " . $totalDocentes
                // Importe Column: Total Sum
    
                // Style Footer
                $sheet->getStyle('A' . $footerRow . ':' . $highestColumn . $footerRow)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF4472C4'],
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
                $sheet->getRowDimension($footerRow)->setRowHeight(25);

                // Format Footer Importe
                $sheet->getStyle($importeColumn . $footerRow)->getNumberFormat()->setFormatCode('"S/." #,##0.00');
            },
        ];
    }

    public function columnFormats(): array
    {
        $currencyFormat = '"S/." #,##0.00';

        if (strpos($this->tipoDocente, 'externo') !== false) {
            return [
                'K' => $currencyFormat, // Costo Hora
                'L' => $currencyFormat, // Importe Total
            ];
        }

        if (strpos($this->tipoDocente, 'interno') !== false) {
            return [
                'G' => $currencyFormat, // Costo Hora
                'H' => $currencyFormat, // Importe Total
            ];
        }

        return [];
    }

    public function title(): string
    {
        return ucfirst($this->tipoDocente) . 's';
    }
}
