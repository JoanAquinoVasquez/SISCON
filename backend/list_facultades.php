<?php

use App\Models\Facultad;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$facultades = Facultad::all();

foreach ($facultades as $f) {
    echo "ID: {$f->id}, Nombre: {$f->nombre}, Codigo: {$f->codigo}\n";
}
