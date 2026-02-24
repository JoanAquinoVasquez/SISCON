<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Devolucion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'devoluciones';

    protected $fillable = [
        'persona',
        'dni',
        'programa_id',
        'proceso_admision',
        'tipo_devolucion',
        'importe',
        'numero_voucher',
        'numero_oficio_direccion',
        'observaciones',
    ];

    protected $casts = [
        'importe' => 'decimal:2',
    ];

    // Relaciones
    public function programa()
    {
        return $this->belongsTo(Programa::class);
    }

    public function expedientes()
    {
        return $this->hasMany(Expediente::class);
    }

    // Helper methods
    public function getTipoDevolucionLabelAttribute()
    {
        $labels = [
            'inscripcion' => 'Derecho de Inscripción',
            'idiomas' => 'Idiomas',
            'grados_titulos' => 'Grados y Títulos',
        ];

        return $labels[$this->tipo_devolucion] ?? $this->tipo_devolucion;
    }

    // Accessors for consolidated state
    public function getEstadoAttribute()
    {
        return $this->expedientes()->first()?->estado ?? 'pendiente';
    }

    public function setEstadoAttribute($value)
    {
        // When setting state on Devolucion, update all its related expedientes
        $this->expedientes()->update(['estado' => $value]);
    }

    public function getEstadoLabelAttribute()
    {
        $labels = [
            'pendiente' => 'Pendiente',
            'en_proceso' => 'En Proceso',
            'completado' => 'Completado',
            'rechazado' => 'Rechazado',
        ];

        return $labels[$this->estado] ?? $this->estado;
    }
}
