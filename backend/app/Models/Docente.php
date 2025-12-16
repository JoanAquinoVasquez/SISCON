<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Docente extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['nombres', 'dni', 'categoria', 'condicion', 'lugar_procedencia', /*...*/];

    // Relación con pagos de cursos
    public function asignaciones()
    {
        return $this->hasMany(AsignacionDocencia::class);
    }

    // Relación con pagos de coordinación
    public function pagosCoordinador()
    {
        return $this->hasMany(PagoCoordinador::class);
    }
}
