<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== PAGOS DOCENTES - CAMPOS DE CONFORMIDAD ===\n";
$pagos = App\Models\PagoDocente::orderBy('id')->get();
foreach ($pagos as $pago) {
    echo sprintf(
        "ID: %d | Conformidad Dirección: '%s' | Conformidad Coordinador: '%s'\n",
        $pago->id,
        $pago->numero_oficio_conformidad_direccion ?? 'NULL',
        $pago->numero_oficio_conformidad_coordinador ?? 'NULL'
    );
}
