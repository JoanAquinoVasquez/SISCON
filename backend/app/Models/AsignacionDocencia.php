<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsignacionDocencia extends Model
{
    protected $table = 'asignaciones_docencia';
    protected $fillable = [
        'docente_id',
        'curso_id',
        'horas_teoricas',
        'horas_practicas',
        'total_horas',
        'fechas_clase',
        'costo_hora',
        'monto_bruto',
        'essalud',
        'monto_neto',
        'numero_resolucion',
        'oficio_direccion',
        'registro_siaf',
        'nota_de_pago',
        'orden_servicio',
        'pedido_servicio',
        'recibo_honorarios',
        'fecha_emision_rh',
        'mes_pago'
    ];

    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }
    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }
}
