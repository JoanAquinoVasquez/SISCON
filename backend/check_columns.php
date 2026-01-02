<?php

use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$columns = ['facultad_nombre', 'director_nombre', 'coordinador_nombre'];
$table = 'pagos_docentes';

foreach ($columns as $column) {
    if (Schema::hasColumn($table, $column)) {
        echo "Column '$column' exists in '$table'.\n";
    } else {
        echo "Column '$column' DOES NOT exist in '$table'.\n";
    }
}
