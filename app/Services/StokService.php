<?php

namespace App\Services;

use App\Exceptions\StokException;
use App\Models\Barang;
use App\Models\MutasiStok;
use App\Models\Pembelian;
use App\Models\Pesanan;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * Satu-satunya tempat stok berubah. Setiap perubahan:
 *  - berjalan di dalam DB::transaction,
 *  - mengunci baris dengan lockForUpdate,
 *  - dicatat di mutasi_stok.
 */
class StokService
{
    /**
     * Penerimaan barang dari PO: stok bertambah, mutasi `masuk` dicatat, status PO menjadi `diterima`.
     *
     * @throws StokException
     */
    public function terimaPembelian(Pembelian $po, int $userId, ?string $keterangan = null, ?CarbonInterface $waktu = null): Pembelian
    {
        return DB::transaction(function () use ($po, $userId, $keterangan, $waktu) {
            $waktu ??= now();

            $po = Pembelian::query()->lockForUpdate()->findOrFail($po->id);

            if ($po->status !== 'dipesan') {
                throw new StokException("PO {$po->no_po} sudah diterima sebelumnya.");
            }

            // Jumlah per barang (jaga-jaga bila ada barang ganda), urut id agar kunci tidak saling menunggu.
            $jumlahPerBarang = $po->detail()->get()->groupBy('barang_id')->map->sum('jumlah')->sortKeys();

            foreach ($jumlahPerBarang as $barangId => $jumlah) {
                $barang = Barang::query()->lockForUpdate()->findOrFail($barangId);
                $barang->stok += $jumlah;
                $barang->save();

                MutasiStok::create([
                    'barang_id' => $barang->id,
                    'tanggal' => $waktu,
                    'jenis' => 'masuk',
                    'jumlah' => $jumlah,
                    'stok_akhir' => $barang->stok,
                    'referensi' => $po->no_po,
                    'keterangan' => 'Penerimaan barang dari PO',
                    'user_id' => $userId,
                ]);
            }

            $catatan = $po->keterangan;
            if ($keterangan !== null && trim($keterangan) !== '') {
                $catatan = trim(($catatan ? $catatan."\n" : '').'Penerimaan: '.trim($keterangan));
            }

            $po->update([
                'status' => 'diterima',
                'tanggal_terima' => $waktu->toDateString(),
                'diterima_oleh' => $userId,
                'keterangan' => $catatan,
            ]);

            return $po;
        });
    }

    /**
     * Pengambilan barang untuk pesanan: stok dicek, berkurang, mutasi `keluar` dicatat,
     * status pesanan menjadi `diambil`. Jika stok ada yang kurang, seluruh proses dibatalkan.
     *
     * @throws StokException
     */
    public function ambilPesanan(Pesanan $pesanan, int $userId, ?CarbonInterface $waktu = null): Pesanan
    {
        return DB::transaction(function () use ($pesanan, $userId, $waktu) {
            $waktu ??= now();

            $pesanan = Pesanan::query()->lockForUpdate()->findOrFail($pesanan->id);

            if ($pesanan->status !== 'baru') {
                throw new StokException("Pesanan {$pesanan->no_pesanan} tidak berstatus baru, sehingga tidak dapat diambil.");
            }

            $jumlahPerBarang = $pesanan->detail()->get()->groupBy('barang_id')->map->sum('jumlah')->sortKeys();

            // Kunci semua barang dulu, lalu validasi seluruh stok sebelum ada yang dikurangi.
            $barangTerkunci = [];
            $kekurangan = [];
            foreach ($jumlahPerBarang as $barangId => $jumlah) {
                $barang = Barang::query()->lockForUpdate()->findOrFail($barangId);
                $barangTerkunci[$barangId] = $barang;

                if ($barang->stok < $jumlah) {
                    $kekurangan[] = "{$barang->sku} (tersedia {$barang->stok}, dibutuhkan {$jumlah})";
                }
            }

            if ($kekurangan !== []) {
                throw new StokException('Stok tidak mencukupi untuk: '.implode('; ', $kekurangan).'.');
            }

            foreach ($jumlahPerBarang as $barangId => $jumlah) {
                $barang = $barangTerkunci[$barangId];
                $barang->stok -= $jumlah;
                $barang->save();

                MutasiStok::create([
                    'barang_id' => $barang->id,
                    'tanggal' => $waktu,
                    'jenis' => 'keluar',
                    'jumlah' => $jumlah,
                    'stok_akhir' => $barang->stok,
                    'referensi' => $pesanan->no_pesanan,
                    'keterangan' => 'Pengambilan barang untuk pesanan',
                    'user_id' => $userId,
                ]);
            }

            $pesanan->update(['status' => 'diambil']);

            return $pesanan;
        });
    }
}
