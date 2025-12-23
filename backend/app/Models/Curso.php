<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Curso extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'cursos';

    protected $fillable = [
        'nombre',
        'codigo',
        'creditos',
        'descripcion',
    ];

    protected $casts = [
        'creditos' => 'integer',
    ];

    // Relaciones
    public function semestres()
    {
        return $this->belongsToMany(Semestre::class, 'curso_semestre')
            ->withTimestamps();
    }

    public function asignacionesDocencia()
    {
        return $this->hasMany(AsignacionDocencia::class);
    }

    public function asignacionesEnfermeria()
    {
        return $this->hasMany(AsignacionEnfermeria::class);
    }

    // Obtener todas las asignaciones (regulares + enfermería)
    public function todasAsignaciones()
    {
        return $this->asignacionesDocencia->merge($this->asignacionesEnfermeria);
    }
}
