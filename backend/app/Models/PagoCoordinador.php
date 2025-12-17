<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PagoCoordinador extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pagos_coordinadores';

    protected $fillable = [
        'coordinador_id',
        'programa_id',
        'mes',
        'anio',
        'importe',
        'numero_resolucion',
        'registro_siaf',
        'pedido_servicio',
        'recibo_honorarios',
        'nce',
        'orden_servicio',
        'comprobante_pago',
        'nota_abono',
    ];

    protected $casts = [
        'anio' => 'integer',
        'importe' => 'decimal:2',
    ];

    // Relaciones
    public function coordinador()
    {
        return $this->belongsTo(Coordinador::class);
    }

    public function programa()
    {
        return $this->belongsTo(Programa::class);
    }

    // Accessor para periodo completo
    public function getPeriodoCompletoAttribute()
    {
        return "{$this->mes} {$this->anio}";
    }
}
