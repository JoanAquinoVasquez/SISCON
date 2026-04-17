<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class PagoDocenteExport implements WithMultipleSheets
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        $sheets = [];

        // Sheet for Internos
        $sheets[] = new PagoDocenteSheet('interno', $this->filters);

        // Sheet for Externos
        $sheets[] = new PagoDocenteSheet('externo', $this->filters);

        // Sheet for Internos Enfermeria
        $sheets[] = new PagoDocenteSheet('interno_enfermeria', $this->filters);

        // Sheet for Externos Enfermeria
        $sheets[] = new PagoDocenteSheet('externo_enfermeria', $this->filters);

        return $sheets;
    }
}
