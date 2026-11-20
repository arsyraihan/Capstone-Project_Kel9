<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AkunPeranSeeder::class,
            RakSeeder::class,
            PemasokSeeder::class,
            PelangganSeeder::class,
            BarangSeeder::class,
            TransaksiSeeder::class,
        ]);
    }
}
