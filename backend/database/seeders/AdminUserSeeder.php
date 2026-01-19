<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Administrador',
            'email' => 'jaquinov@unprg.edu.pe',

            'role' => 'admin',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Usuario Demo',
            'email' => 'alopezca@unprg.edu.pe',

            'role' => 'user',
            'is_active' => true,
        ]);
        User::create([
            'name' => 'Usuario Demo',
            'email' => 'cacostam@unprg.edu.pe',
            'role' => 'user',
            'is_active' => true,
        ]);
        User::create([
            'name' => 'Usuario Demo',
            'email' => 'kdavilade@unprg.edu.pe',
            'role' => 'user',
            'is_active' => true,
        ]);
        User::create([
            'name' => 'Usuario Demo',
            'email' => 'mcanevaroc@unprg.edu.pe',
            'role' => 'user',
            'is_active' => true,
        ]);
        User::create([
            'name' => 'Usuario Demo',
            'email' => 'mcromero@unprg.edu.pe',
            'role' => 'user',
            'is_active' => true,
        ]);
        User::create([
            'name' => 'Usuario Demo',
            'email' => 'contabilidad_epg@unprg.edu.pe',
            'role' => 'user',
            'is_active' => true,
        ]);
    }
}