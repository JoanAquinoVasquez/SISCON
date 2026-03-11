<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PagoDocente;
use App\Models\Expediente;
use Illuminate\Support\Facades\DB;

class FixPagosDocentes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pagos:fix-duplicates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix duplicate PagoDocente entries by merging presentacion and conformidad';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix duplicate PagoDocente entries...');

        // Get all pagos that might have duplicates grouped by (docente_id, curso_id, periodo)
        $groupedPagos = PagoDocente::with('expedientes')
            ->get()
            ->groupBy(function ($pago) {
                $monthsYears = $this->extractMonthsYears($pago->fechas_ensenanza);
                $key = implode(',', $monthsYears);
                return $pago->docente_id . '-' . $pago->curso_id . '-' . $pago->periodo . '-' . $key;
            });

        $mergedCount = 0;
        $deletedCount = 0;

        foreach ($groupedPagos as $key => $pagos) {
            if ($pagos->count() > 1) {
                $this->info("Found duplicates for key: {$key}");

                // We have multiple pagos that correspond to the same teacher, course, period and dates.
                // We should merge them into one. Let's pick the one with the most expedientes or the one with 'conformidad' if any.
                $mainPago = null;
                $otherPagos = [];

                // Prefer the one that has a 'conformidad' expediente
                foreach ($pagos as $pago) {
                    $hasConformidad = $pago->expedientes->where('tipo_asunto', 'conformidad')->count() > 0;
                    if ($hasConformidad && !$mainPago) {
                        $mainPago = $pago;
                    } else if (!$mainPago) {
                        $mainPago = $pago;
                    } else {
                        $otherPagos[] = $pago;
                    }
                }

                if ($mainPago && count($otherPagos) > 0) {
                    DB::beginTransaction();
                    try {
                        foreach ($otherPagos as $other) {
                            // Migrate Expedientes
                            foreach ($other->expedientes as $exp) {
                                // Force update via DB facade to avoid triggering observers just in case
                                DB::table('expedientes')->where('id', $exp->id)->update(['pago_docente_id' => $mainPago->id]);
                                $this->line("  Migrated Expediente {$exp->id} from Pago {$other->id} to {$mainPago->id}");
                            }

                            // Copy data from $other to $mainPago (if $mainPago is missing it)
                            $updateData = [];
                            $fields = [
                                'numero_oficio_presentacion_facultad',
                                'numero_oficio_presentacion_coordinador',
                                'fecha_mesa_partes',
                                'numero_oficio_conformidad_direccion',
                                'numero_oficio_conformidad_coordinador',
                                'numero_oficio_conformidad_facultad',
                                'numero_expediente_nota_pago',
                                'numero_resolucion_aprobacion',
                                'fecha_resolucion_aprobacion',
                                'numero_resolucion_pago',
                                'numero_oficio_contabilidad'
                            ];

                            foreach ($fields as $f) {
                                if (empty($mainPago->$f) && !empty($other->$f)) {
                                    $updateData[$f] = $other->$f;
                                }
                            }

                            if (!empty($updateData)) {
                                DB::table('pagos_docentes')->where('id', $mainPago->id)->update($updateData);
                            }

                            // Advance the state if needed
                            if ($mainPago->estado === 'pendiente' && $other->estado === 'en_proceso') {
                                DB::table('pagos_docentes')->where('id', $mainPago->id)->update(['estado' => 'en_proceso']);
                                $mainPago->estado = 'en_proceso'; // Keep instance updated
                            } else if ($mainPago->estado !== 'completado' && $other->estado === 'completado') {
                                DB::table('pagos_docentes')->where('id', $mainPago->id)->update(['estado' => 'completado']);
                                $mainPago->estado = 'completado';
                            }

                            // Delete the duplicate row in Google Sheets
                            try {
                                $appSheet = app(\App\Services\GoogleSheetsService::class);
                                $otherFull = PagoDocente::with(['docente', 'curso.semestres.programa.facultad', 'curso.semestres.programa.grado'])->find($other->id);
                                if ($otherFull) {
                                    $sheetName = $appSheet->resolveSheetName($otherFull);
                                    $appSheet->deleteDataRow($sheetName, $other->id, env('GOOGLE_SHEETS_PAGOS_ID'));
                                    $this->line("  Deleted row for Pago {$other->id} from sheet {$sheetName}");
                                }
                            } catch (\Exception $e) {
                                $this->error("Failed to delete duplicate row from sheets: " . $e->getMessage());
                            }

                            // Delete the duplicate using DB facade to skip observers, since its soft delete in model let's use model
                            $other->delete();
                            $deletedCount++;
                        }

                        $mergedCount++;
                        DB::commit();

                        // Sync updated MainPago to google sheets inside queue or manual, actually manual here
                        try {
                            $appSheet = app(\App\Services\GoogleSheetsService::class);
                            $updatedMain = PagoDocente::with(['docente', 'curso.semestres.programa.facultad', 'curso.semestres.programa.grado'])->find($mainPago->id);
                            $appSheet->updatePagoDocente($updatedMain);
                        } catch (\Exception $e) {
                            $this->error("Failed to sync main pago to sheets: " . $e->getMessage());
                        }

                    } catch (\Exception $e) {
                        DB::rollBack();
                        $this->error("Failed to merge for key $key: " . $e->getMessage());
                    }
                }
            }
        }

        $this->info("Finished! Merged groups: {$mergedCount}, deleted duplicate Pagos: {$deletedCount}");
    }

    private function extractMonthsYears($fechas)
    {
        if (is_string($fechas)) {
            $fechas = json_decode($fechas, true);
        }

        if (!is_array($fechas) || empty($fechas)) {
            return [];
        }

        $monthsYears = [];
        foreach ($fechas as $fecha) {
            $date = \Carbon\Carbon::parse($fecha);
            $monthYear = $date->format('Y-m');
            if (!in_array($monthYear, $monthsYears)) {
                $monthsYears[] = $monthYear;
            }
        }

        sort($monthsYears);
        return $monthsYears;
    }
}
