<?php

use App\Models\Expediente;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing Expediente creation...\n";

    DB::beginTransaction();

    $data = [
        'numero_expediente_mesa_partes' => 'TEST-EXP-001',
        'numero_documento' => 'TEST-DOC-001',
        'fecha_mesa_partes' => '2025-01-01', // The new field
        'fecha_recepcion_contabilidad' => '2025-01-02',
        'remitente' => 'Test Remitente',
        'tipo_asunto' => 'descripcion',
        'descripcion_asunto' => 'Test Description',
    ];

    $expediente = Expediente::create($data);

    echo "Expediente created successfully with ID: " . $expediente->id . "\n";
    echo "Fecha Mesa Partes: " . $expediente->fecha_mesa_partes->format('Y-m-d') . "\n";

    DB::rollBack(); // Rollback to not pollute DB
    echo "Transaction rolled back.\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    if (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
}
