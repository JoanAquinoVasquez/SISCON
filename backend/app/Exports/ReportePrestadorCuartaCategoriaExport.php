<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ReportePrestadorCuartaCategoriaExport implements WithMultipleSheets
{
    protected $month;
    protected $year;

    public function __construct($month, $year)
    {
        $this->month = intval($month);
        $this->year = intval($year);
    }

    public function sheets(): array
    {
        return [
            new ReportePrestadorCuartaCategoriaSheet($this->month, $this->year),
            new ReporteRetencionImpuestoSheet($this->month, $this->year),
        ];
    }
}
