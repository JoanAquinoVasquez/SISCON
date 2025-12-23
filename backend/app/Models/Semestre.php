<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Semestre extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'semestres';

    protected $fillable = [
        'programa_id',
        'numero_semestre',
        'nombre',
        'descripcion',
    ];

    protected $casts = [
        'numero_semestre' => 'integer',
    ];

    // Relaciones
    public function programa()
    {
        return $this->belongsTo(Programa::class);
    }

    public function cursos()
    {
        return $this->belongsToMany(Curso::class, 'curso_semestre')
            ->withTimestamps();
    }
}
