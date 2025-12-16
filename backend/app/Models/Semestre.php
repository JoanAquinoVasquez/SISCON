<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Semestre extends Model
{
    protected $fillable = ['programa_id', 'numero'];
    public function cursos()
    {
        return $this->hasMany(Curso::class);
    }
}
