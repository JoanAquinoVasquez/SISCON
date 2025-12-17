<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grado extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'grados';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    // Relaciones
    public function programas()
    {
        return $this->hasMany(Programa::class);
    }
}
