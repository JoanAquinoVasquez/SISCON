<?php
// Script para reemplazar el método update del ExpedienteController

$file = __DIR__ . '/app/Http/Controllers/ExpedienteController.php';
$content = file_get_contents($file);

// Buscar y reemplazar el bloque del método update
$pattern = '/\/\/ Re-procesar si es presentación o conformidad y tiene pago vinculado.*?}\s+}/s';

$replacement = <<<'EOD'
// Re-procesar si es presentación o conformidad
            if (in_array($expediente->tipo_asunto, ['presentacion', 'conformidad'])) {
                
                if ($expediente->tipo_asunto === 'presentacion' && $pagoAnterior) {
                    $pago = PagoDocente::find($pagoAnterior);
                    if ($pago && $pago->estado === 'pendiente') {
                        $semestre = \App\Models\Semestre::with('programa')->find($expediente->semestre_id);
                        if ($semestre && $semestre->programa) {
                            $pago->update([
                                'docente_id' => $expediente->docente_id,
                                'curso_id' => $expediente->curso_id,
                                'periodo' => $semestre->programa->periodo,
                                'fechas_ensenanza' => $expediente->fechas_ensenanza,
                                'numero_oficio_presentacion_facultad' => $expediente->numero_documento,
                                'numero_oficio_presentacion_coordinador' => $expediente->numero_oficio_presentacion_coordinador,
                            ]);
                        }
                    }
                } elseif ($expediente->tipo_asunto === 'conformidad') {
                    // Re-evaluar vinculación basada en fechas
                    $semestre = \App\Models\Semestre::with('programa')->find($expediente->semestre_id);
                    if ($semestre && $semestre->programa) {
                        $periodo = $semestre->programa->periodo;
                        
                        $pagos = PagoDocente::where('docente_id', $expediente->docente_id)
                            ->where('curso_id', $expediente->curso_id)
                            ->where('periodo', $periodo)
                            ->where('estado', 'pendiente')
                            ->get();
                        
                        $pagoCoincidente = null;
                        foreach ($pagos as $p) {
                            $fechasPago = is_array($p->fechas_ensenanza) ? $p->fechas_ensenanza : (is_string($p->fechas_ensenanza) ? json_decode($p->fechas_ensenanza, true) : []);
                            $fechasExpediente = is_array($expediente->fechas_ensenanza) ? $expediente->fechas_ensenanza : (is_string($expediente->fechas_ensenanza) ? json_decode($expediente->fechas_ensenanza, true) : []);
                            
                            sort($fechasPago);
                            sort($fechasExpediente);
                            
                            if ($fechasPago === $fechasExpediente) {
                                $pagoCoincidente = $p;
                                break;
                            }
                        }
                        
                        if ($pagoCoincidente) {
                            if ($pagoAnterior && $pagoAnterior !== $pagoCoincidente->id) {
                                $pagoAnteriorObj = PagoDocente::find($pagoAnterior);
                                if ($pagoAnteriorObj && $pagoAnteriorObj->estado === 'en_proceso') {
                                    $pagoAnteriorObj->update([
                                        'numero_oficio_conformidad_direccion' => null,
                                        'numero_oficio_conformidad_coordinador' => null,
                                        'estado' => 'pendiente',
                                    ]);
                                }
                            }
                            
                            $pagoCoincidente->update([
                                'numero_oficio_conformidad_direccion' => $expediente->numero_documento,
                                'numero_oficio_conformidad_coordinador' => $expediente->numero_oficio_conformidad_coordinador,
                                'estado' => 'en_proceso',
                            ]);
                            
                            $expediente->pago_docente_id = $pagoCoincidente->id;
                            $expediente->save();
                        } else {
                            if ($pagoAnterior) {
                                $pagoAnteriorObj = PagoDocente::find($pagoAnterior);
                                if ($pagoAnteriorObj && $pagoAnteriorObj->estado === 'en_proceso') {
                                    $pagoAnteriorObj->update([
                                        'numero_oficio_conformidad_direccion' => null,
                                        'numero_oficio_conformidad_coordinador' => null,
                                        'estado' => 'pendiente',
                                    ]);
                                }
                                
                                $expediente->pago_docente_id = null;
                                $expediente->save();
                            }
                        }
                    }
                }
            }
EOD;

$newContent = preg_replace($pattern, $replacement, $content);

if ($newContent !== $content) {
    file_put_contents($file, $newContent);
    echo "✅ Archivo actualizado correctamente\n";
} else {
    echo "❌ No se encontró el patrón para reemplazar\n";
}
