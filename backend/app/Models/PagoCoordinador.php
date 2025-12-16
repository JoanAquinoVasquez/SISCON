<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoCoordinador extends Model
{
    protected $table = 'pagos_coordinadores';
    protected $fillable = [
        'docente_id',
        'programa_id',
        'mes',
        'importe',
        'numero_resolucion',
        'registro_siaf',
        'pedido_servicio',
        'recibo_honorarios',
        'nce',
        'orden_servicio',
        'comprobante_pago'
    ];

    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }
    public function programa()
    {
        return $this->belongsTo(Programa::class);
    }
}
