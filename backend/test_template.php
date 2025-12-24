<?php

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpWord\TemplateProcessor;

// Probar plantilla de docente externo
$templatePath = __DIR__ . '/storage/templates/Resoluciones Plantilla DocInt.docx';

if (!file_exists($templatePath)) {
    die("Plantilla no encontrada: {$templatePath}\n");
}

echo "Analizando plantilla: Resoluciones Plantilla DocInt.docx\n";
echo "=======================================================\n\n";

try {
    $template = new TemplateProcessor($templatePath);

    // Obtener las variables que PHPWord puede encontrar
    $variables = $template->getVariables();

    echo "Variables encontradas por PHPWord:\n";
    if (empty($variables)) {
        echo "  ⚠️  NO SE ENCONTRARON VARIABLES\n";
        echo "\nEsto significa que las variables en la plantilla Word no están en el formato correcto.\n";
        echo "PHPWord busca variables en formato: \${VARIABLE}\n";
        echo "\nPosibles problemas:\n";
        echo "1. Las variables tienen formato (negrita, cursiva, color)\n";
        echo "2. Las variables están divididas en múltiples 'runs' de texto\n";
        echo "3. El formato no es exactamente \${VARIABLE}\n";
    } else {
        foreach ($variables as $variable) {
            echo "  ✓ \${$variable}\n";
        }
    }

    echo "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=======================================================\n";
echo "SOLUCIÓN:\n";
echo "1. Abre la plantilla Word\n";
echo "2. Busca cada variable (ej: DOCENTE, CURSO, etc.)\n";
echo "3. Selecciona toda la variable incluyendo \${ y }\n";
echo "4. Quita TODO el formato (Ctrl+Espacio o Ctrl+Q)\n";
echo "5. Asegúrate de que esté escrita de corrido sin espacios\n";
echo "6. Guarda la plantilla\n";
echo "=======================================================\n";
