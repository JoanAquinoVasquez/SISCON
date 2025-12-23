<?php

namespace App\Services;

use App\Models\PagoDocente;
use PhpOffice\PhpWord\TemplateProcessor;
use Illuminate\Support\Facades\Storage;

class DocumentGeneratorService
{
    /**
     * Genera un documento de resolución para un pago docente
     */
    public function generateResolucion(PagoDocente $pago): string
    {
        // Cargar relaciones necesarias
        $pago->load(['docente', 'curso.semestres.programa.grado']);

        // Determinar plantilla según tipo de docente
        $templateName = $pago->docente->tipo_docente === 'interno'
            ? 'Resoluciones Plantilla DocInt 2024.docx'
            : 'Resoluciones Plantilla DocExt 2024.docx';

        $templatePath = storage_path('templates/' . $templateName);

        if (!file_exists($templatePath)) {
            throw new \Exception("Plantilla no encontrada: {$templateName}");
        }

        // Crear procesador de plantilla
        $template = new TemplateProcessor($templatePath);

        // Reemplazar variables
        $this->replaceVariables($template, $pago);

        // Generar nombre de archivo
        $fileName = 'Resolucion_' . $pago->docente->apellido_paterno . '_' . date('Ymd') . '.docx';
        $outputPath = storage_path('app/temp/' . $fileName);

        // Asegurar que el directorio existe
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        // Guardar documento
        $template->saveAs($outputPath);

        return $outputPath;
    }

    /**
     * Genera un oficio de contabilidad para un pago docente
     */
    public function generateOficioContabilidad(PagoDocente $pago): string
    {
        // Cargar relaciones necesarias
        $pago->load(['docente', 'curso.semestres.programa.grado']);

        // Determinar plantilla según tipo de docente
        $templateName = $pago->docente->tipo_docente === 'interno'
            ? 'Ofic. Conta Plantilla - DocInt.docx'
            : 'Ofic. Conta Plantilla - DocExt.docx';

        $templatePath = storage_path('templates/' . $templateName);

        if (!file_exists($templatePath)) {
            throw new \Exception("Plantilla no encontrada: {$templateName}");
        }

        // Crear procesador de plantilla
        $template = new TemplateProcessor($templatePath);

        // Reemplazar variables
        $this->replaceVariables($template, $pago);

        // Generar nombre de archivo
        $fileName = 'Oficio_Conta_' . $pago->docente->apellido_paterno . '_' . date('Ymd') . '.docx';
        $outputPath = storage_path('app/temp/' . $fileName);

        // Asegurar que el directorio existe
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        // Guardar documento
        $template->saveAs($outputPath);

        return $outputPath;
    }

    /**
     * Reemplaza las variables en la plantilla con datos del pago
     */
    private function replaceVariables(TemplateProcessor $template, PagoDocente $pago): void
    {
        // Obtener programa del primer semestre del curso
        $programa = $pago->curso->semestres->first()->programa ?? null;

        // Nombre completo del docente con título profesional
        $nombreCompleto = '';
        if ($pago->docente->titulo_profesional) {
            $nombreCompleto .= $pago->docente->titulo_profesional . ' ';
        }
        $nombreCompleto .= "{$pago->docente->nombres} {$pago->docente->apellido_paterno} {$pago->docente->apellido_materno}";

        // Nombre del programa
        $nombrePrograma = $programa
            ? "{$programa->grado->nombre} en {$programa->nombre} {$programa->periodo}"
            : '';

        // Formatear fechas de enseñanza
        $fechasEnsenanza = $this->formatearFechasEnsenanza($pago->fechas_ensenanza);

        // Determinar artículos según género del docente (asumiendo que existe el campo)
        // Si no existe, usar genérico
        $articuloDelODeLa = 'del'; // Por defecto masculino
        $articuloLaOEl = 'el';

        // Variables comunes - Usando nombres exactos de la plantilla
        $template->setValue('DOCENTE', $nombreCompleto);
        $template->setValue('DNI', $pago->docente->dni);
        $template->setValue('CURSO', $pago->curso->nombre);
        $template->setValue('CODIGO_CURSO', $pago->curso->codigo);
        $template->setValue('PROGRAMA', $nombrePrograma);
        $template->setValue('PERIODO', $pago->periodo);
        $template->setValue('PROMOCION', $pago->periodo); // PROMOCION es el periodo
        $template->setValue('NUMERO_HORAS', $pago->numero_horas);
        $template->setValue('COSTO_POR_HORA', number_format((float) $pago->costo_por_hora, 2));
        $template->setValue('IMPORTE_TOTAL', number_format((float) $pago->importe_total, 2));
        $template->setValue('IMPORTE_LETRAS', $pago->importe_letras);
        $template->setValue('FECHAS', $fechasEnsenanza); // FECHAS en lugar de FECHAS_ENSENANZA
        $template->setValue('FECHAS_ENSENANZA', $fechasEnsenanza); // Por compatibilidad
        $template->setValue('FACULTAD', $pago->facultad_nombre ?? '');
        $template->setValue('DIRECTOR', $pago->director_nombre ?? '');
        $template->setValue('COORDINADOR', $pago->coordinador_nombre ?? '');

        // Artículos de género
        $template->setValue('Articulo_del_o_de_la', $articuloDelODeLa);
        $template->setValue('Articulo_la_o_el', $articuloLaOEl);

        // Variables de resolución
        $template->setValue('RESOLUCION', $pago->numero_resolucion ?? '');
        $template->setValue('NUMERO_RESOLUCION', $pago->numero_resolucion ?? '');
        $template->setValue('FECHA_RESOLUCION', $this->formatearFecha($pago->fecha_resolucion));

        // Variables de oficios - Usando nombres exactos de la plantilla
        $template->setValue('OFICIO_DE_PRESENTACION_FAC', $pago->numero_oficio_presentacion_facultad ?? '');
        $template->setValue('OFICIO_PRESENTACION_COORDINADOR', $pago->numero_oficio_presentacion_coordinador ?? '');
        $template->setValue('OFICIO_DE_CONFORMIDAD_FAC', $pago->numero_oficio_conformidad_facultad ?? '');
        $template->setValue('OFICIO_CONFORMIDAD_COORDINADOR', $pago->numero_oficio_conformidad_coordinador ?? '');
        $template->setValue('OFICIO_DE_CONFORMIDAD_DIRECCION', $pago->numero_oficio_conformidad_direccion ?? '');

        // Variables de oficio de contabilidad
        $template->setValue('OFICIO_DE_CONTABILIDAD', $pago->numero_oficio_contabilidad ?? '');
        $template->setValue('NUMERO_OFICIO_CONTABILIDAD', $pago->numero_oficio_contabilidad ?? '');
        $template->setValue('FECHA_DE_OF_DE_CONTABILIDAD', $this->formatearFecha($pago->fecha_oficio_contabilidad));
        $template->setValue('FECHA_OFICIO_CONTABILIDAD', $this->formatearFecha($pago->fecha_oficio_contabilidad));

        // Variables solo para externos
        if ($pago->docente->tipo_docente === 'externo') {
            $template->setValue('NUMERO_RECIBO_HONORARIO', $pago->numero_recibo_honorario ?? '');
            $template->setValue('FECHA_RECIBO_HONORARIO', $this->formatearFecha($pago->fecha_recibo_honorario));
            $template->setValue('PS', $pago->numero_pedido_servicio ?? ''); // PS = Pedido de Servicio
            $template->setValue('NUMERO_PEDIDO_SERVICIO', $pago->numero_pedido_servicio ?? '');
            $template->setValue('RETENCION', $pago->tiene_retencion_8_porciento ? 'Sí' : 'No');
        }
    }

    /**
     * Formatea una fecha para mostrar en el documento
     */
    private function formatearFecha(?string $fecha): string
    {
        if (!$fecha) {
            return '';
        }

        try {
            $date = new \DateTime($fecha);
            // Formato: "23 de diciembre de 2025"
            $meses = [
                1 => 'enero',
                2 => 'febrero',
                3 => 'marzo',
                4 => 'abril',
                5 => 'mayo',
                6 => 'junio',
                7 => 'julio',
                8 => 'agosto',
                9 => 'septiembre',
                10 => 'octubre',
                11 => 'noviembre',
                12 => 'diciembre'
            ];

            $dia = $date->format('j');
            $mes = $meses[(int) $date->format('n')];
            $anio = $date->format('Y');

            return "{$dia} de {$mes} de {$anio}";
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * Formatea las fechas de enseñanza para mostrar en el documento
     */
    private function formatearFechasEnsenanza($fechas): string
    {
        if (!$fechas || (is_array($fechas) && count($fechas) === 0)) {
            return '';
        }

        // Si viene como JSON string, decodificar
        if (is_string($fechas)) {
            $fechas = json_decode($fechas, true);
        }

        if (!is_array($fechas)) {
            return '';
        }

        // Agrupar por mes y año
        $fechasPorMes = [];
        foreach ($fechas as $fechaStr) {
            try {
                $fecha = new \DateTime($fechaStr);
                $mesAnio = $fecha->format('n-Y');
                if (!isset($fechasPorMes[$mesAnio])) {
                    $fechasPorMes[$mesAnio] = [
                        'mes' => (int) $fecha->format('n'),
                        'anio' => $fecha->format('Y'),
                        'dias' => []
                    ];
                }
                $fechasPorMes[$mesAnio]['dias'][] = (int) $fecha->format('j');
            } catch (\Exception $e) {
                continue;
            }
        }

        $meses = [
            1 => 'enero',
            2 => 'febrero',
            3 => 'marzo',
            4 => 'abril',
            5 => 'mayo',
            6 => 'junio',
            7 => 'julio',
            8 => 'agosto',
            9 => 'septiembre',
            10 => 'octubre',
            11 => 'noviembre',
            12 => 'diciembre'
        ];

        $resultado = [];
        foreach ($fechasPorMes as $grupo) {
            sort($grupo['dias']);
            $diasStr = $this->formatearListaDias($grupo['dias']);
            $resultado[] = "{$diasStr} de {$meses[$grupo['mes']]} de {$grupo['anio']}";
        }

        return implode(', ', $resultado);
    }

    /**
     * Formatea una lista de días con formato "1, 2 y 3"
     */
    private function formatearListaDias(array $dias): string
    {
        if (count($dias) === 0) {
            return '';
        }

        if (count($dias) === 1) {
            return (string) $dias[0];
        }

        if (count($dias) === 2) {
            return $dias[0] . ' y ' . $dias[1];
        }

        $ultimos = array_pop($dias);
        return implode(', ', $dias) . ' y ' . $ultimos;
    }
}
