<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Programa;

class ListProgramas extends Command
{
    protected $signature = 'list:programas';
    protected $description = 'List all programas';

    public function handle()
    {
        $this->info("Total programas: " . Programa::count());

        $periodos = Programa::select('periodo')->distinct()->get();
        $this->info("Periodos disponibles:");
        foreach ($periodos as $p) {
            $this->info("  - " . $p->periodo);
        }

        $this->info("\nPrimeros 10 programas:");
        $programas = Programa::take(10)->get(['id', 'nombre', 'periodo']);
        foreach ($programas as $p) {
            $this->info($p->id . '|' . $p->periodo . '|' . $p->nombre);
        }
    }
}
