<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AsignacionDocencia extends Model
{
    use SoftDeletes;

    protected $table = 'asignaciones_docencia';

    protected $fillable = [
        'docente_id',
        'curso_id',
        'oficio_id',
        'horas_teoricas',
        'horas_practicas',
        'total_horas',
        'fechas_clase',
        'costo_por_hora',
        'monto_bruto',
        'essalud_9_porciento',
        'monto_neto',
        'numero_resolucion',
        'registro_siaf',
        'nota_pago',
    ];

    protected $casts = [
        'horas_teoricas' => 'decimal:2',
        'horas_practicas' => 'decimal:2',
        'total_horas' => 'decimal:2',
        'costo_por_hora' => 'decimal:2',
        'monto_bruto' => 'decimal:2',
        'essalud_9_porciento' => 'decimal:2',
        'monto_neto' => 'decimal:2',
        'fechas_clase' => 'array',
    ];

    // Relaciones
    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function oficio()
    {
        return $this->belongsTo(Oficio::class);
    }

    // Calcular total de horas automáticamente
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($asignacion) {
            $asignacion->total_horas = $asignacion->horas_teoricas + $asignacion->horas_practicas;
            $asignacion->monto_bruto = $asignacion->total_horas * $asignacion->costo_por_hora;
            $asignacion->essalud_9_porciento = $asignacion->monto_bruto * 0.09;
            $asignacion->monto_neto = $asignacion->monto_bruto - $asignacion->essalud_9_porciento;
        });
    }
}
