<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $fillable = ['semestre_id', 'nombre', 'creditos'];
    public function asignaciones()
    {
        return $this->hasMany(AsignacionDocencia::class);
    }
}
