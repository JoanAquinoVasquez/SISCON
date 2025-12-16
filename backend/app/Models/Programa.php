<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Programa extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ['grado_id', 'nombre', 'periodo'];
    
    public function grado()
    {
        return $this->belongsTo(Grado::class);
    }

    public function semestres()
    {
        return $this->hasMany(Semestre::class);
    }

    // Para obtener todos los cursos del programa a través de semestres
    public function cursos()
    {
        return $this->hasManyThrough(Curso::class, Semestre::class);
    }
}
