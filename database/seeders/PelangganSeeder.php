<?php

namespace Database\Seeders;

use App\Models\Pelanggan;
use Illuminate\Database\Seeder;

class PelangganSeeder extends Seeder
{
    public function run(): void
    {
        // Termin pembayaran (hari); 0 = tunai. Hanya diisi untuk pelanggan baru.
        $termin = ['PLG-001' => 14, 'PLG-002' => 0, 'PLG-003' => 0, 'PLG-004' => 30, 'PLG-005' => 14, 'PLG-006' => 30];

        $data = [
            ['PLG-001', 'Toko Busana Barokah', '0812-3456-7801', 'Jl. Brawijaya No. 21, Kediri'],
            ['PLG-002', 'Toko Pakaian Sinar Terang', '0813-2233-4402', 'Jl. Pahlawan No. 9, Nganjuk'],
            ['PLG-003', 'Reseller Fashion Mutiara', '0857-1122-3303', 'Jl. Ahmad Yani No. 55, Tulungagung'],
            ['PLG-004', 'Toko Sandang Murah Jaya', '0821-9988-7704', 'Jl. Merdeka No. 14, Blitar'],
            ['PLG-005', 'Butik Hijab Almira', '0878-5566-4405', 'Jl. Diponegoro No. 32, Madiun'],
            ['PLG-006', 'Grosir Pakaian Mandiri', '0896-7744-1106', 'Jl. Basuki Rahmat No. 77, Malang'],
        ];

        foreach ($data as [$kode, $nama, $telepon, $alamat]) {
            $pelanggan = Pelanggan::firstOrNew(['kode_pelanggan' => $kode]);
            if (! $pelanggan->exists) {
                $pelanggan->termin_hari = $termin[$kode];
            }
            $pelanggan->fill(['nama' => $nama, 'telepon' => $telepon, 'alamat' => $alamat])->save();
        }
    }
}
