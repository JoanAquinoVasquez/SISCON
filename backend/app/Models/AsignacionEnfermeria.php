<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AsignacionEnfermeria extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'asignaciones_enfermeria';

    protected $fillable = [
        'docente_id',
        'curso_id',
        'horas_teoricas',
        'horas_practicas',
        'total_horas',
        'fechas_clase',
        'mes_pago',
        'fecha_emision_rh',
        'costo_por_hora',
        'importe',
        'essalud_9_porciento',
        'monto_neto',
        'nota_pago',
        'registro_siaf',
        'orden_servicio',
        'pedido_servicio',
        'recibo_honorarios',
        'numero_resolucion',
    ];

    protected $casts = [
        'horas_teoricas' => 'decimal:2',
        'horas_practicas' => 'decimal:2',
        'total_horas' => 'decimal:2',
        'costo_por_hora' => 'decimal:2',
        'importe' => 'decimal:2',
        'essalud_9_porciento' => 'decimal:2',
        'monto_neto' => 'decimal:2',
        'fechas_clase' => 'array',
        'fecha_emision_rh' => 'date',
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

    // Calcular total de horas y montos automáticamente
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($asignacion) {
            $asignacion->total_horas = $asignacion->horas_teoricas + $asignacion->horas_practicas;
            $asignacion->importe = $asignacion->total_horas * $asignacion->costo_por_hora;
            $asignacion->essalud_9_porciento = $asignacion->importe * 0.09;
            $asignacion->monto_neto = $asignacion->importe - $asignacion->essalud_9_porciento;
        });
    }
}
