<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PagoDocente extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pagos_docentes';

    protected $fillable = [
        'docente_id',
        'curso_id',
        'periodo',
        'estado',
        'facultad_nombre',
        'director_nombre',
        'coordinador_nombre',
        'numero_horas',
        'costo_por_hora',
        'importe_total',
        'importe_letras',
        'fechas_ensenanza',
        'numero_informe_final',
        'numero_informe_final_url',
        // Documentos internos
        'numero_oficio_presentacion_facultad',
        'numero_oficio_presentacion_facultad_url',
        'numero_oficio_presentacion_coordinador',
        'numero_oficio_presentacion_coordinador_url',
        'numero_oficio_conformidad_facultad',
        'numero_oficio_conformidad_facultad_url',
        'numero_oficio_conformidad_coordinador',
        'numero_oficio_conformidad_coordinador_url',
        'numero_oficio_conformidad_direccion',
        'numero_oficio_conformidad_direccion_url',
        'numero_resolucion',
        'numero_resolucion_url',
        'fecha_resolucion',
        'numero_oficio_contabilidad',
        'numero_oficio_contabilidad_url',
        'fecha_oficio_contabilidad',
        // Documentos externos
        'tiene_retencion_8_porciento',
        'numero_recibo_honorario',
        'numero_recibo_honorario_url',
        'fecha_recibo_honorario',
        'numero_pedido_servicio',
        'numero_pedido_servicio_url',
        // Doc Recibido
        'numero_oficio_pago_direccion',
        'numero_oficio_pago_direccion_url',
        'orden_servicio',
        'acta_conformidad',
        'numero_exp_siaf',
        'numero_exp_siaf',
        'nota_pago',
        'fecha_mesa_partes',
    ];

    protected $casts = [
        'numero_horas' => 'decimal:2',
        'costo_por_hora' => 'decimal:2',
        'importe_total' => 'decimal:2',
        'fechas_ensenanza' => 'array',
        'tiene_retencion_8_porciento' => 'boolean',
        'fecha_resolucion' => 'date',
        'fecha_recibo_honorario' => 'date',
        'fecha_oficio_contabilidad' => 'date',
        'fecha_mesa_partes' => 'date',
    ];

    // Relaciones
    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    public function programa()
    {
        // Como la relación es compleja (Pago -> Curso -> Semestre -> Programa)
        // y un curso puede tener muchos semestres, pero el pago es por un periodo específico
        // Lo mejor es definir un accessor o usar una relación manual si se necesita eager loading
        // Por ahora, para el index, podemos usar un accessor o modificar la consulta
        return $this->hasOneThrough(
            Programa::class,
            Curso::class,
            'id', // Foreign key on cursos table...
            'id', // Foreign key on programas table...
            'curso_id', // Local key on pagos_docentes table...
            'programa_id' // Local key on cursos table...
        );
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    // Accessors
    public function getEsInternoAttribute()
    {
        return $this->docente && $this->docente->tipo_docente === 'interno';
    }

    public function getEsExternoAttribute()
    {
        return $this->docente && $this->docente->tipo_docente === 'externo';
    }

    public function expedientes()
    {
        return $this->hasMany(Expediente::class);
    }
}
