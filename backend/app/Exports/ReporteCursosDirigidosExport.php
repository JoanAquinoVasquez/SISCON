<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ReporteCursosDirigidosExport implements WithMultipleSheets
{
    protected $periodo;
    protected $programaId;

    public function __construct($periodo = null, $programaId = null)
    {
        $this->periodo = $periodo;
        $this->programaId = $programaId;
    }

    public function sheets(): array
    {
        return [
            new ReporteCursosDirigidosSheet($this->periodo, $this->programaId),
        ];
    }
}
