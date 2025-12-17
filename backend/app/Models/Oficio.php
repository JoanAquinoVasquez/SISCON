<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Oficio extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'oficios';

    protected $fillable = [
        'numero_oficio',
        'fecha_emision',
        'descripcion',
    ];

    protected $casts = [
        'fecha_emision' => 'date',
    ];

    // Relaciones
    public function asignacionesDocencia()
    {
        return $this->hasMany(AsignacionDocencia::class);
    }

    // Obtener total de pagos asociados a este oficio
    public function getTotalPagosAttribute()
    {
        return $this->asignacionesDocencia()->sum('monto_neto');
    }
}
