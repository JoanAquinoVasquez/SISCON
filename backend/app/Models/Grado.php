<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grado extends Model
{
    protected $fillable = ['nombre'];
    public function programas()
    {
        return $this->hasMany(Programa::class);
    }
}
