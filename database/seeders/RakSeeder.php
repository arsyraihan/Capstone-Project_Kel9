<?php

namespace Database\Seeders;

use App\Models\Rak;
use Illuminate\Database\Seeder;

class RakSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['A-01', 'Lorong A, rak 1 - Kemeja'],
            ['A-02', 'Lorong A, rak 2 - Kaos'],
            ['B-01', 'Lorong B, rak 1 - Celana'],
            ['B-02', 'Lorong B, rak 2 - Jaket'],
            ['C-01', 'Lorong C, rak 1 - Hijab'],
            ['C-02', 'Lorong C, rak 2 - Gamis'],
        ];

        foreach ($data as [$kode, $keterangan]) {
            Rak::updateOrCreate(['kode_rak' => $kode], ['keterangan' => $keterangan]);
        }
    }
}
