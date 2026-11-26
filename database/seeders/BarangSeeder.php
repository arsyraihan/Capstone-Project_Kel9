<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\Pemasok;
use App\Models\Rak;
use Illuminate\Database\Seeder;

class BarangSeeder extends Seeder
{
    /** Harga [beli/titip, jual] per kategori. Dipakai juga oleh SinkronKeuanganSeeder. */
    public const HARGA = [
        'Kemeja' => [85000, 120000],
        'Kaos' => [35000, 55000],
        'Celana' => [95000, 140000],
        'Jaket' => [110000, 165000],
        'Hijab' => [25000, 40000],
        'Gamis' => [120000, 175000],
    ];

    /**
     * Stok awal 0. Stok terisi lewat transaksi (StokService) di TransaksiSeeder.
     */
    public function run(): void
    {
        $rak = Rak::pluck('id', 'kode_rak');
        $penitip = Pemasok::where('kode_pemasok', 'PMS-004')->value('id');

        // [sku, nama, kategori, ukuran, warna, kode rak, stok minimum]
        $data = [
            ['KMJ-001-M-PTH', 'Kemeja Formal Pria', 'Kemeja', 'M', 'Putih', 'A-01', 10],
            ['KMJ-001-L-PTH', 'Kemeja Formal Pria', 'Kemeja', 'L', 'Putih', 'A-01', 10],
            ['KMJ-001-L-BRU', 'Kemeja Formal Pria', 'Kemeja', 'L', 'Biru', 'A-01', 10],
            ['KMJ-001-XL-BRU', 'Kemeja Formal Pria', 'Kemeja', 'XL', 'Biru', 'A-01', 10],
            ['KAO-001-S-HTM', 'Kaos Polos Cotton', 'Kaos', 'S', 'Hitam', 'A-02', 20],
            ['KAO-001-M-HTM', 'Kaos Polos Cotton', 'Kaos', 'M', 'Hitam', 'A-02', 20],
            ['KAO-001-L-PTH', 'Kaos Polos Cotton', 'Kaos', 'L', 'Putih', 'A-02', 20],
            ['KAO-001-XL-PTH', 'Kaos Polos Cotton', 'Kaos', 'XL', 'Putih', 'A-02', 20],
            ['CHN-001-M-KRM', 'Celana Chino', 'Celana', 'M', 'Krem', 'B-01', 10],
            ['CHN-001-L-KRM', 'Celana Chino', 'Celana', 'L', 'Krem', 'B-01', 10],
            ['CHN-001-L-HTM', 'Celana Chino', 'Celana', 'L', 'Hitam', 'B-01', 10],
            ['CHN-001-XL-HTM', 'Celana Chino', 'Celana', 'XL', 'Hitam', 'B-01', 10],
            ['JKT-001-M-ABU', 'Jaket Hoodie', 'Jaket', 'M', 'Abu-abu', 'B-02', 8],
            ['JKT-001-L-ABU', 'Jaket Hoodie', 'Jaket', 'L', 'Abu-abu', 'B-02', 8],
            ['JKT-001-XL-NVY', 'Jaket Hoodie', 'Jaket', 'XL', 'Navy', 'B-02', 8],
            ['HJB-001-ALL-KRM', 'Hijab Segi Empat', 'Hijab', 'All Size', 'Krem', 'C-01', 25],
            ['HJB-001-ALL-HTM', 'Hijab Segi Empat', 'Hijab', 'All Size', 'Hitam', 'C-01', 25],
            ['GMS-001-M-MRN', 'Gamis Polos', 'Gamis', 'M', 'Maroon', 'C-02', 8],
            ['GMS-001-L-MRN', 'Gamis Polos', 'Gamis', 'L', 'Maroon', 'C-02', 8],
            ['GMS-001-L-HJA', 'Gamis Polos', 'Gamis', 'L', 'Hijau', 'C-02', 8],
        ];

        foreach ($data as [$sku, $nama, $kategori, $ukuran, $warna, $kodeRak, $min]) {
            $barang = Barang::firstOrNew(['sku' => $sku]);

            // Harga dan jenis stok hanya diisi untuk barang baru (data bersama tidak diubah diam-diam).
            if (! $barang->exists) {
                [$barang->harga_beli, $barang->harga_jual] = self::HARGA[$kategori];

                // Kategori Hijab adalah barang titipan (konsinyasi) milik PMS-004.
                if ($kategori === 'Hijab') {
                    $barang->jenis_stok = 'konsinyasi';
                    $barang->pemasok_id = $penitip;
                }
            }

            $barang->fill([
                'nama' => $nama,
                'kategori' => $kategori,
                'ukuran' => $ukuran,
                'warna' => $warna,
                'satuan' => 'pcs',
                'stok_minimum' => $min,
                'rak_id' => $rak[$kodeRak] ?? null,
            ])->save();
        }
    }
}
