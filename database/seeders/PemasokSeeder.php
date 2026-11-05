<?php

namespace Database\Seeders;

use App\Models\Pemasok;
use Illuminate\Database\Seeder;

class PemasokSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['PMS-001', 'CV Garmen Sentosa', '0341-551234', 'Jl. Raya Mojosari No. 12, Malang'],
            ['PMS-002', 'PT Konveksi Jaya Abadi', '031-8765432', 'Jl. Industri Rungkut No. 45, Surabaya'],
            ['PMS-003', 'UD Tekstil Makmur', '0354-689012', 'Jl. Dhoho No. 88, Kediri'],
            ['PMS-004', 'CV Busana Nusantara', '0274-445566', 'Jl. Kaliurang Km 7, Sleman, Yogyakarta'],
            ['PMS-005', 'PT Mitra Garmindo', '022-6001234', 'Jl. Cigondewah Kaler No. 20, Bandung'],
        ];

        foreach ($data as [$kode, $nama, $telepon, $alamat]) {
            Pemasok::updateOrCreate(
                ['kode_pemasok' => $kode],
                ['nama' => $nama, 'telepon' => $telepon, 'alamat' => $alamat]
            );
        }
    }
}
