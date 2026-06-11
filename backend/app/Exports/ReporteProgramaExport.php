<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ReporteProgramaExport implements WithMultipleSheets
{
    protected $programaIds;
    protected $periodo;

    /**
     * @param array|int $programaIds  One or more programa IDs
     * @param string|null $periodo    Optional period filter
     */
    public function __construct($programaIds, $periodo = null)
    {
        $this->programaIds = is_array($programaIds) ? $programaIds : [$programaIds];
        $this->periodo = $periodo;
    }

    public function sheets(): array
    {
        $sheets = [];

        foreach ($this->programaIds as $programaId) {
            $sheets[] = new ReporteProgramaSheet($programaId, $this->periodo);
        }

        return $sheets;
    }
}
