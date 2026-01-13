<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Docente extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'docentes';

    protected $fillable = [
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'titulo_profesional',
        'genero',
        'fecha_nacimiento',
        'dni',
        'numero_telefono',
        'email',
        'tipo_docente',
        'lugar_procedencia_id',
    ];

    // Relaciones
    public function lugarProcedencia()
    {
        return $this->belongsTo(LugarProcedencia::class);
    }

    public function asignacionesDocencia()
    {
        return $this->hasMany(AsignacionDocencia::class);
    }

    public function asignacionesEnfermeria()
    {
        return $this->hasMany(AsignacionEnfermeria::class);
    }

    public function pagos()
    {
        return $this->hasMany(PagoDocente::class);
    }

    // Scopes para filtrar por tipo
    public function scopeInternos(Builder $query)
    {
        return $query->where('tipo_docente', 'interno');
    }

    public function scopeExternos(Builder $query)
    {
        return $query->where('tipo_docente', 'externo');
    }

    public function scopeEnfermeria(Builder $query)
    {
        return $query->whereIn('tipo_docente', ['interno_enfermeria', 'externo_enfermeria']);
    }

    public function scopeRegulares(Builder $query)
    {
        return $query->whereIn('tipo_docente', ['interno', 'externo']);
    }

    public function scopeInternosEnfermeria(Builder $query)
    {
        return $query->where('tipo_docente', 'interno_enfermeria');
    }

    public function scopeExternosEnfermeria(Builder $query)
    {
        return $query->where('tipo_docente', 'externo_enfermeria');
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }

    // Verificar si es docente de enfermería
    public function esEnfermeria()
    {
        return in_array($this->tipo_docente, ['interno_enfermeria', 'externo_enfermeria']);
    }

    // Verificar si es docente regular
    public function esRegular()
    {
        return in_array($this->tipo_docente, ['interno', 'externo']);
    }
}
