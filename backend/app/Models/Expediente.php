<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

class Expediente extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'expedientes';

    protected $fillable = [
        'numero_expediente_mesa_partes',
        'numero_documento',
        'fecha_mesa_partes',
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
        // Coordinator documents - REMOVED as they belong to PagoDocente
        // 'numero_oficio_presentacion_coordinador',
        // 'numero_oficio_conformidad_coordinador',
        // 'numero_oficio_conformidad_facultad',
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
        'fecha_mesa_partes' => 'date',
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
     * Extract unique month-year combinations from a date array
     * Returns array of "YYYY-MM" strings
     */
    private function extractMonthsYears($fechas)
    {
        // Handle JSON string input
        if (is_string($fechas)) {
            $fechas = json_decode($fechas, true);
        }

        // Handle null or empty array
        if (!is_array($fechas) || empty($fechas)) {
            return [];
        }

        $monthsYears = [];
        foreach ($fechas as $fecha) {
            // Extract YYYY-MM from date string
            $date = \Carbon\Carbon::parse($fecha);
            $monthYear = $date->format('Y-m');
            if (!in_array($monthYear, $monthsYears)) {
                $monthsYears[] = $monthYear;
            }
        }

        sort($monthsYears);
        return $monthsYears;
    }

    /**
     * Procesar expediente de tipo presentación
     * Crea un nuevo pago docente en estado pendiente
     */
    public function procesarPresentacion($oficioPresentacionCoordinador = null)
    {
        if ($this->tipo_asunto !== 'presentacion') {
            return null;
        }

        // Obtener el periodo desde el semestre
        if (!$this->semestre_id) {
            throw new \Exception('El expediente debe tener un semestre_id');
        }

        $semestre = \App\Models\Semestre::with(['programa.facultad', 'programa.coordinadores'])->find($this->semestre_id);
        if (!$semestre || !$semestre->programa) {
            throw new \Exception('No se encontró el semestre o programa asociado');
        }

        $periodo = $semestre->programa->periodo;
        $facultadNombre = $semestre->programa->facultad ? $semestre->programa->facultad->nombre : null;
        $directorNombre = $semestre->programa->facultad ? $semestre->programa->facultad->director_nombre : null;

        // Obtener coordinador (asumiendo el primero activo o el más reciente)
        $coordinador = $semestre->programa->coordinadores->first();
        $coordinadorNombre = $coordinador ? ($coordinador->nombres . ' ' . $coordinador->apellidos) : null;

        // Crear pago docente pendiente
        $pago = PagoDocente::create([
            'docente_id' => $this->docente_id,
            'curso_id' => $this->curso_id,
            'periodo' => $periodo,
            'estado' => 'pendiente',
            'fechas_ensenanza' => $this->fechas_ensenanza,
            'facultad_nombre' => $facultadNombre,
            'director_nombre' => $directorNombre,
            'coordinador_nombre' => $coordinadorNombre,
            'numero_horas' => 0,
            'costo_por_hora' => 0,
            'importe_total' => 0,
            'importe_letras' => '',
            // Documentos de presentación (se llenarán desde el expediente)
            'numero_oficio_presentacion_facultad' => $this->numero_documento,
            'numero_oficio_presentacion_coordinador' => $oficioPresentacionCoordinador,
            'fecha_mesa_partes' => $this->fecha_mesa_partes,
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
    public function procesarConformidad($oficioConformidadCoordinador = null, $oficioConformidadFacultad = null)
    {
        if ($this->tipo_asunto !== 'conformidad') {
            return null;
        }

        // Obtener el periodo desde el semestre
        if (!$this->semestre_id) {
            throw new \Exception('El expediente debe tener un semestre_id');
        }

        $semestre = \App\Models\Semestre::with(['programa.facultad', 'programa.coordinadores'])->find($this->semestre_id);
        if (!$semestre || !$semestre->programa) {
            throw new \Exception('No se encontró el semestre o programa asociado');
        }

        $periodo = $semestre->programa->periodo;
        $facultadNombre = $semestre->programa->facultad ? $semestre->programa->facultad->nombre : null;
        $directorNombre = $semestre->programa->facultad ? $semestre->programa->facultad->decano : null;

        $coordinador = $semestre->programa->coordinadores->first();
        $coordinadorNombre = $coordinador ? ($coordinador->nombres . ' ' . $coordinador->apellidos) : null;

        // Si ya tiene un pago vinculado, actualizarlo
        if ($this->pago_docente_id) {
            $pago = PagoDocente::find($this->pago_docente_id);
            if ($pago) {
                $pago->update([
                    'numero_oficio_conformidad_direccion' => $this->numero_documento,
                    'numero_oficio_conformidad_coordinador' => $oficioConformidadCoordinador,
                    'numero_oficio_conformidad_facultad' => $oficioConformidadFacultad,
                    'estado' => 'en_proceso',
                    // Actualizar nombres por si cambiaron
                    'facultad_nombre' => $facultadNombre,
                    'director_nombre' => $directorNombre,
                    'coordinador_nombre' => $coordinadorNombre,
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

        // Buscar el pago que tenga las mismas fechas de enseñanza (por mes y año)
        $pago = null;
        foreach ($pagos as $p) {
            // Comparar por mes y año en lugar de fechas exactas
            $monthsYearsPago = $this->extractMonthsYears($p->fechas_ensenanza);
            $monthsYearsExpediente = $this->extractMonthsYears($this->fechas_ensenanza);

            // Si los meses y años coinciden, vincular
            if ($monthsYearsPago === $monthsYearsExpediente && !empty($monthsYearsPago)) {
                $pago = $p;
                break;
            }
        }

        if ($pago) {
            // Encontró un pago pendiente con mismo docente, curso, periodo y fechas → Vincular
            $pago->update([
                'numero_oficio_conformidad_direccion' => $this->numero_documento,
                'numero_oficio_conformidad_coordinador' => $oficioConformidadCoordinador,
                'numero_oficio_conformidad_facultad' => $oficioConformidadFacultad,
                'estado' => 'en_proceso',
                'facultad_nombre' => $facultadNombre,
                'director_nombre' => $directorNombre,
                'coordinador_nombre' => $coordinadorNombre,
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
                'facultad_nombre' => $facultadNombre,
                'director_nombre' => $directorNombre,
                'coordinador_nombre' => $coordinadorNombre,
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
                'numero_resolucion_pago' => $this->numero_documento,
                'fecha_resolucion' => $this->fecha_mesa_partes,
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
