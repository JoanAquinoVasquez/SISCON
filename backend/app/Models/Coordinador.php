<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Coordinador extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'coordinadores';

    protected $fillable = [
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'genero',
        'dni',
        'numero_telefono',
        'tipo_coordinador',
    ];

    // Relaciones
    public function programas()
    {
        return $this->belongsToMany(Programa::class, 'coordinador_programa')
            ->withPivot('fecha_inicio', 'fecha_fin')
            ->withTimestamps();
    }

    public function pagos()
    {
        return $this->hasMany(PagoCoordinador::class);
    }

    // Scopes
    public function scopeInternos(Builder $query)
    {
        return $query->where('tipo_coordinador', 'interno');
    }

    public function scopeExternos(Builder $query)
    {
        return $query->where('tipo_coordinador', 'externo');
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }
}
