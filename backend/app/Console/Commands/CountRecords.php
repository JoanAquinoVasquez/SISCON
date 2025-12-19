<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Programa;
use App\Models\Semestre;
use App\Models\Curso;

class CountRecords extends Command
{
    protected $signature = 'count:records';
    protected $description = 'Count all records';

    public function handle()
    {
        $this->info("=== CONTEO DE REGISTROS ===");
        $this->info("Programas: " . Programa::count());
        $this->info("Semestres: " . Semestre::count());
        $this->info("Cursos: " . Curso::count());

        $this->info("\n=== CURSOS POR PROGRAMA (Top 10) ===");
        $programas = Programa::withCount(['semestres', 'cursos'])->orderBy('cursos_count', 'desc')->take(10)->get();
        foreach ($programas as $p) {
            $this->info($p->nombre . ": " . $p->semestres_count . " semestres, " . $p->cursos_count . " cursos");
        }
    }
}
