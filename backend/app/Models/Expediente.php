<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expediente extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'expedientes';

    protected $fillable = [
        'numero_expediente_mesa_partes',
        'numero_documento',
        'fecha_documento',
        'fecha_recepcion_contabilidad',
        'remitente',
        'tipo_asunto',
        'descripcion_asunto',
        'docente_id',
        'curso_id',
        'semestre_id',
        'fechas_ensenanza',
        'pago_docente_id',
        // Coordinator documents
        'numero_oficio_presentacion_coordinador',
        'numero_oficio_conformidad_coordinador',
        // Devolucion fields
        'persona_devolucion',
        'dni_devolucion',
        'programa_id',
        'proceso_admision',
        'tipo_devolucion',
        'importe_devolucion',
        'numero_voucher',
    ];

    protected $casts = [
        'fecha_documento' => 'date',
        'fecha_recepcion_contabilidad' => 'date',
        'fechas_ensenanza' => 'array',
        'importe_devolucion' => 'decimal:2',
    ];

    // Relaciones
    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function pagoDocente()
    {
        return $this->belongsTo(PagoDocente::class);
    }

    public function programa()
    {
        return $this->belongsTo(Programa::class);
    }

    public function devolucion()
    {
        return $this->hasOne(Devolucion::class, 'id', 'devolucion_id');
    }

    public function semestre()
    {
        return $this->belongsTo(Semestre::class);
    }

    // Business Logic Methods

    /**
     * Procesar expediente de tipo presentación
     * Crea un nuevo pago docente en estado pendiente
     */
    public function procesarPresentacion()
    {
        if ($this->tipo_asunto !== 'presentacion') {
            return null;
        }

        // Obtener el periodo desde el semestre
        if (!$this->semestre_id) {
            throw new \Exception('El expediente debe tener un semestre_id');
        }

        $semestre = \App\Models\Semestre::with('programa')->find($this->semestre_id);
        if (!$semestre || !$semestre->programa) {
            throw new \Exception('No se encontró el semestre o programa asociado');
        }

        $periodo = $semestre->programa->periodo;

        // Crear pago docente pendiente
        $pago = PagoDocente::create([
            'docente_id' => $this->docente_id,
            'curso_id' => $this->curso_id,
            'periodo' => $periodo,
            'estado' => 'pendiente',
            'fechas_ensenanza' => $this->fechas_ensenanza,
            'numero_horas' => 0,
            'costo_por_hora' => 0,
            'importe_total' => 0,
            'importe_letras' => '',
            // Documentos de presentación (se llenarán desde el expediente)
            'numero_oficio_presentacion_facultad' => $this->numero_documento,
            'numero_oficio_presentacion_coordinador' => $this->numero_oficio_presentacion_coordinador,
        ]);

        // Vincular expediente con pago
        $this->pago_docente_id = $pago->id;
        $this->save();

        return $pago;
    }

    /**
     * Procesar expediente de tipo conformidad
     * Busca y actualiza el pago docente correspondiente
     */
    public function procesarConformidad()
    {
        if ($this->tipo_asunto !== 'conformidad') {
            return null;
        }

        // Obtener el periodo desde el semestre
        if (!$this->semestre_id) {
            throw new \Exception('El expediente debe tener un semestre_id');
        }

        $semestre = \App\Models\Semestre::with('programa')->find($this->semestre_id);
        if (!$semestre || !$semestre->programa) {
            throw new \Exception('No se encontró el semestre o programa asociado');
        }

        $periodo = $semestre->programa->periodo;

        // Si ya tiene un pago vinculado, actualizarlo
        if ($this->pago_docente_id) {
            $pago = PagoDocente::find($this->pago_docente_id);
            if ($pago) {
                $pago->update([
                    'numero_oficio_conformidad_direccion' => $this->numero_documento,
                    'numero_oficio_conformidad_coordinador' => $this->numero_oficio_conformidad_coordinador,
                    'estado' => 'en_proceso',
                ]);
                return $pago;
            }
            // Si el pago fue eliminado, continuar con la búsqueda/creación
        }

        // Buscar pago pendiente que coincida (incluyendo fechas)
        $pagos = PagoDocente::where('docente_id', $this->docente_id)
            ->where('curso_id', $this->curso_id)
            ->where('periodo', $periodo)
            ->where('estado', 'pendiente')
            ->get();

        // Buscar el pago que tenga las mismas fechas de enseñanza
        $pago = null;
        foreach ($pagos as $p) {
            // Comparar arrays de fechas (ordenados para comparación correcta)
            $fechasPago = is_array($p->fechas_ensenanza) ? $p->fechas_ensenanza : (is_string($p->fechas_ensenanza) ? json_decode($p->fechas_ensenanza, true) : []);
            $fechasExpediente = is_array($this->fechas_ensenanza) ? $this->fechas_ensenanza : (is_string($this->fechas_ensenanza) ? json_decode($this->fechas_ensenanza, true) : []);

            sort($fechasPago);
            sort($fechasExpediente);

            if ($fechasPago === $fechasExpediente) {
                $pago = $p;
                break;
            }
        }

        if ($pago) {
            // Encontró un pago pendiente con mismo docente, curso, periodo y fechas → Vincular
            $pago->update([
                'numero_oficio_conformidad_direccion' => $this->numero_documento,
                'numero_oficio_conformidad_coordinador' => $this->numero_oficio_conformidad_coordinador,
                'estado' => 'en_proceso',
            ]);

            $this->pago_docente_id = $pago->id;
            $this->save();

            return $pago;
        } else {
            // No encontró pago coincidente → Crear nuevo pago
            $nuevoPago = PagoDocente::create([
                'docente_id' => $this->docente_id,
                'curso_id' => $this->curso_id,
                'periodo' => $periodo,
                'fechas_ensenanza' => $this->fechas_ensenanza,
                'numero_horas' => 0, // Se actualizará después
                'costo_por_hora' => 0, // Se actualizará después
                'importe_total' => 0, // Se calculará después
                'numero_oficio_conformidad_direccion' => $this->numero_documento,
                'numero_oficio_conformidad_coordinador' => $this->numero_oficio_conformidad_coordinador,
                'estado' => 'en_proceso',
            ]);

            $this->pago_docente_id = $nuevoPago->id;
            $this->save();

            return $nuevoPago;
        }
    }

    /**
     * Procesar expediente de tipo resolución
     * Finaliza el pago docente
     * Note: This is now used for devolucion type, but kept for backward compatibility
     */
    public function procesarResolucion()
    {
        if ($this->tipo_asunto !== 'resolucion') {
            return null;
        }

        // Obtener el periodo desde el semestre si hay curso
        if ($this->curso_id && !$this->semestre_id) {
            throw new \Exception('El expediente debe tener un semestre_id');
        }

        if (!$this->curso_id) {
            return null;
        }

        $semestre = \App\Models\Semestre::with('programa')->find($this->semestre_id);
        if (!$semestre || !$semestre->programa) {
            throw new \Exception('No se encontró el semestre o programa asociado');
        }

        $periodo = $semestre->programa->periodo;

        // Buscar pago en proceso que coincida
        $pago = PagoDocente::where('docente_id', $this->docente_id)
            ->where('curso_id', $this->curso_id)
            ->where('periodo', $periodo)
            ->whereIn('estado', ['pendiente', 'en_proceso'])
            ->first();

        if ($pago) {
            // Actualizar con documento de resolución
            $pago->update([
                'numero_resolucion' => $this->numero_documento,
                'fecha_resolucion' => $this->fecha_documento,
                'estado' => 'completado',
            ]);

            // Vincular expediente con pago
            $this->pago_docente_id = $pago->id;
            $this->save();

            return $pago;
        }

        return null;
    }

    /**
     * Procesar expediente de tipo devolución
     * Crea un nuevo registro de devolución
     */
    public function procesarDevolucion()
    {
        if ($this->tipo_asunto !== 'devolucion') {
            return null;
        }

        // Crear registro de devolución
        $devolucion = Devolucion::create([
            'persona' => $this->persona_devolucion,
            'dni' => $this->dni_devolucion,
            'programa_id' => $this->programa_id,
            'proceso_admision' => $this->proceso_admision,
            'tipo_devolucion' => $this->tipo_devolucion,
            'importe' => $this->importe_devolucion,
            'numero_voucher' => $this->numero_voucher,
            'estado' => 'pendiente',
        ]);

        return $devolucion;
    }
}
