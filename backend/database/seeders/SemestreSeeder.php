<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Semestre;

class SemestreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $semestres = [
            [
                'nombre' => '2024-II',
                'fecha_inicio' => '2024-08-01',
                'fecha_fin' => '2024-12-31',
                'activo' => false,
            ],
            [
                'nombre' => '2025-I',
                'fecha_inicio' => '2025-01-01',
                'fecha_fin' => '2025-07-31',
                'activo' => true,
            ],
        ];

        foreach ($semestres as $semestre) {
            Semestre::create($semestre);
        }
    }
}
