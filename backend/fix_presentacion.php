<?php
$file = __DIR__ . '/app/Http/Controllers/ExpedienteController.php';
$content = file_get_contents($file);

// Buscar y reemplazar la línea específica
$search = "if (\$pago && \$pago->estado === 'pendiente') {";
$replace = "if (\$pago) {";

$newContent = str_replace($search, $replace, $content);

if ($newContent !== $content) {
    file_put_contents($file, $newContent);
    echo "✅ Restricción de estado removida - ahora actualiza presentación incluso si está en_proceso\n";
} else {
    echo "❌ No se encontró la línea para reemplazar\n";
}
