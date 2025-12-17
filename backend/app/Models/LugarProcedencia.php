<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LugarProcedencia extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'lugares_procedencia';

    protected $fillable = [
        'nombre',
        'costo_por_hora',
        'descripcion',
    ];

    protected $casts = [
        'costo_por_hora' => 'decimal:2',
    ];

    // Relaciones
    public function docentes()
    {
        return $this->hasMany(Docente::class);
    }
}
