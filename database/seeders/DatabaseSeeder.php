<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@inventaris.test'],
            ['name' => 'Administrator', 'password' => 'password', 'role' => 'admin']
        );

        User::updateOrCreate(
            ['email' => 'petugas@inventaris.test'],
            ['name' => 'Petugas Gudang', 'password' => 'password', 'role' => 'petugas']
        );

        $this->call([
            RakSeeder::class,
            PemasokSeeder::class,
            PelangganSeeder::class,
            BarangSeeder::class,
        ]);
    }
}
