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

        return $sheets;
    }
}
