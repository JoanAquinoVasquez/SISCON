<?php

namespace App\Services;

use App\Models\PagoDocente;
use Illuminate\Support\Facades\Log;
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
        $pago->load([
            'docente',
            'curso.semestres.programa.grado',
            'curso.semestres.programa.facultad',
            'curso.semestres.programa.coordinadores'
        ]);

        // Determinar plantilla según tipo de docente
        if ($pago->periodo === '2025-I' && $pago->docente->tipo_docente === 'interno') {
            $templateName = 'Resoluciones Plantilla DI.docx';
        } elseif ($pago->periodo === '2025-I' && $pago->docente->tipo_docente === 'externo') {
            $templateName = 'Resoluciones Plantilla DE.docx';
        } elseif ($pago->periodo === '2024-II') {
            $templateName = 'Resolucion Plantilla 2024.docx';
        }

        $templatePath = storage_path('templates/' . $templateName);

        if (!file_exists($templatePath)) {
            throw new \Exception("Plantilla no encontrada: {$templateName}");
        }

        // Crear procesador de plantilla
        $template = new TemplateProcessor($templatePath);

        // Reemplazar variables
        $this->replaceVariables($template, $pago);

        // Generar nombre de archivo
        $fileName = 'RES ' . $pago->numero_resolucion . '.docx';
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
        $pago->load([
            'docente',
            'curso.semestres.programa.grado',
            'curso.semestres.programa.facultad',
            'curso.semestres.programa.coordinadores'
        ]);

        // Determinar plantilla según tipo de docente
        if ($pago->periodo === '2025-I' && $pago->docente->tipo_docente === 'interno') {
            $templateName = 'Ofic. Conta Plantilla DI 2025.docx';
        } elseif ($pago->periodo === '2025-I' && $pago->docente->tipo_docente === 'externo') {
            $templateName = 'Ofic. Conta Plantilla DE 2025.docx';
        } elseif ($pago->periodo === '2024-II') {
            $templateName = 'Ofic. Conta Plantilla 2024.docx';
        }

        $templatePath = storage_path('templates/' . $templateName);

        if (!file_exists($templatePath)) {
            throw new \Exception("Plantilla no encontrada: {$templateName}");
        }

        // Crear procesador de plantilla
        $template = new TemplateProcessor($templatePath);

        // Reemplazar variables
        $this->replaceVariables($template, $pago);

        // Generar nombre de archivo
        $fileName = 'OFICIO ' . $pago->numero_oficio_contabilidad . '.docx';
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
            ? "{$programa->grado->nombre} en {$programa->nombre}"
            : '';

        // Formatear fechas de enseñanza
        $fechasEnsenanza = $this->formatearFechasEnsenanza($pago->fechas_ensenanza);

        // Determinar artículos según género del docente
        $genero = strtoupper($pago->docente->genero ?? 'M'); // Por defecto masculino si no está definido

        if ($genero === 'F') {
            $articuloDelODeLa = 'de la';
            $articuloLaOEl = 'la';
            $articuloAloAla = 'a la';
        } else {
            $articuloDelODeLa = 'del';
            $articuloLaOEl = 'el';
            $articuloAloAla = 'al';
        }

        // Determinar artículos y títulos según género del director
        $directorGenero = 'M'; // Por defecto
        $directorODirectora = 'Director';
        $artDirectorFacultad = 'el';

        if ($programa && $programa->facultad && $programa->facultad->director_genero) {
            $directorGenero = strtoupper($programa->facultad->director_genero);
            if ($directorGenero === 'F') {
                $directorODirectora = 'Directora';
                $artDirectorFacultad = 'la';
            }
        }

        // Determinar artículos y títulos según género del coordinador
        $coordinadorGenero = 'M'; // Por defecto
        $coordinadorOCoordinadora = 'Coordinador';
        $artCoordinador = 'el';

        if ($programa && $programa->coordinadores && $programa->coordinadores->isNotEmpty()) {
            // Buscar coordinador activo (sin fecha_fin o con fecha_fin futura)
            $coordinadorActivo = $programa->coordinadores
                ->filter(function ($coord) {
                    return is_null($coord->pivot->fecha_fin) || $coord->pivot->fecha_fin >= now();
                })
                ->first();

            if ($coordinadorActivo && $coordinadorActivo->genero) {
                $coordinadorGenero = strtoupper($coordinadorActivo->genero);
                if ($coordinadorGenero === 'F') {
                    $coordinadorOCoordinadora = 'Coordinadora';
                    $artCoordinador = 'la';
                }
            }
        }

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
        $template->setValue('DIRECTOR_FACULTAD', $pago->director_nombre ?? '');
        $template->setValue('COORDINADOR', $pago->coordinador_nombre ?? '');

        // Artículos de género del docente
        $template->setValue('Articulo_del_o_de_la', $articuloDelODeLa);
        $template->setValue('Articulo_la_o_el', $articuloLaOEl);
        $template->setValue('Articulo_al_o_a_la', $articuloAloAla);


        // Artículos y títulos del director
        $template->setValue('Director_o_directora', $directorODirectora);
        $template->setValue('Art_Director_Facultad', $artDirectorFacultad);

        //Informe final docente
        $template->setValue('N_INFORME_FINAL_DOCENTE', $pago->numero_informe_final ?? '');

        // Artículos y títulos del coordinador
        $template->setValue('Coordinador_o_Coordinadora', $coordinadorOCoordinadora);
        $template->setValue('Art_Coordinador', $artCoordinador);

        // Variables de resolución
        $template->setValue('RESOLUCION', $pago->numero_resolucion ?? '');
        $template->setValue('NUMERO_RESOLUCION', $pago->numero_resolucion ?? '');
        $template->setValue('FECHA_DE_RESOLUCION', $this->formatearFecha($pago->fecha_resolucion));

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

        //Importe y costo
        $template->setValue('IMPORTE', number_format((float) $pago->importe_total, 2));
        $template->setValue('COSTO_X_HORA', number_format((float) $pago->costo_por_hora, 2));

        // Convertir importe en letras a formato de oración (primera letra mayúscula, resto minúsculas)
        $importeLetras = $pago->importe_letras;
        if ($importeLetras) {
            $importeLetras = mb_strtolower($importeLetras, 'UTF-8');
            $importeLetras = mb_strtoupper(mb_substr($importeLetras, 0, 1, 'UTF-8'), 'UTF-8') . mb_substr($importeLetras, 1, null, 'UTF-8');
        }
        $template->setValue('IMPORTE_EN_LETRAS', $importeLetras);
        $template->setValue('N_HORAS', number_format((float) $pago->numero_horas, 0));

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
