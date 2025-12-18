<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Programa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'programas';

    protected $fillable = [
        'grado_id',
        'facultad_id',
        'nombre',
        'periodo',
        'descripcion',
    ];

    // Relaciones
    public function grado()
    {
        return $this->belongsTo(Grado::class);
    }

    public function facultad()
    {
        return $this->belongsTo(Facultad::class);
    }

    public function semestres()
    {
        return $this->hasMany(Semestre::class);
    }

    public function coordinadores()
    {
        return $this->belongsToMany(Coordinador::class, 'coordinador_programa')
            ->withPivot('fecha_inicio', 'fecha_fin')
            ->withTimestamps();
    }

    public function pagosCoordinadores()
    {
        return $this->hasMany(PagoCoordinador::class);
    }

    // Obtener todos los cursos del programa a través de semestres
    public function cursos()
    {
        return $this->hasManyThrough(Curso::class, Semestre::class);
    }
}
