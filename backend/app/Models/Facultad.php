<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Facultad extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'facultads';

    protected $fillable = [
        'nombre',
        'codigo',
    ];

    // Relaciones
    public function programas()
    {
        return $this->hasMany(Programa::class);
    }
}
