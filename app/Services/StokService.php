<?php

namespace App\Services;

use App\Exceptions\StokException;
use App\Models\Barang;
use App\Models\MutasiStok;
use App\Models\Pembelian;
use App\Models\Pesanan;
use App\Models\RiwayatPesanan;
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
     * Penerimaan barang dari PO: stok bertambah sebanyak yang DATANG, mutasi `masuk` dicatat,
     * status PO menjadi `diterima`, lalu nilai hutang dan jatuh temponya dihitung.
     *
     * @param  array<int|string, int|string>|null  $diterima  detail_pembelian.id => jumlah datang;
     *                                                       null = semua datang sesuai PO.
     *
     * @throws StokException
     */
    public function terimaPembelian(Pembelian $po, int $userId, ?string $keterangan = null, ?CarbonInterface $waktu = null, ?array $diterima = null): Pembelian
    {
        return DB::transaction(function () use ($po, $userId, $keterangan, $waktu, $diterima) {
            $waktu ??= now();

            $po = Pembelian::query()->lockForUpdate()->findOrFail($po->id);

            if ($po->status !== 'dipesan') {
                throw new StokException("PO {$po->no_po} sudah diterima sebelumnya.");
            }

            $detail = $po->detail()->get();
            $datang = [];
            foreach ($detail as $baris) {
                $jumlah = $diterima === null ? $baris->jumlah : ($diterima[$baris->id] ?? null);

                if ($jumlah === null || (int) $jumlah < 0 || (int) $jumlah > $baris->jumlah) {
                    throw new StokException("Jumlah datang harus diisi antara 0 dan jumlah yang dipesan (PO {$po->no_po}).");
                }
                $datang[$baris->id] = (int) $jumlah;
            }

            if (array_sum($datang) === 0) {
                throw new StokException('Minimal satu barang harus datang (jumlah lebih dari 0).');
            }

            // Jumlah per barang (jaga-jaga bila ada barang ganda), urut id agar kunci tidak saling menunggu.
            $jumlahPerBarang = $detail->groupBy('barang_id')
                ->map(fn ($grup) => $grup->sum(fn ($d) => $datang[$d->id]))
                ->sortKeys();

            foreach ($jumlahPerBarang as $barangId => $jumlah) {
                if ($jumlah === 0) {
                    continue;
                }

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

            $total = 0;
            $jenisKurang = 0;
            foreach ($detail as $baris) {
                $baris->update(['jumlah_diterima' => $datang[$baris->id]]);
                $total += $datang[$baris->id] * $baris->harga_satuan;
                $jenisKurang += $datang[$baris->id] < $baris->jumlah ? 1 : 0;
            }

            $catatan = $po->keterangan;
            if ($keterangan !== null && trim($keterangan) !== '') {
                $catatan = trim(($catatan ? $catatan."\n" : '').'Penerimaan: '.trim($keterangan));
            }
            if ($jenisKurang > 0) {
                $catatan = trim(($catatan ? $catatan."\n" : '')."Kurang kirim dari pemasok: {$jenisKurang} jenis barang.");
            }

            $jatuhTempo = match ($po->cara_bayar) {
                'tempo' => $waktu->copy()->addDays($po->pemasok->termin_hari)->toDateString(),
                'konsinyasi' => null, // kewajiban timbul saat barang terjual
                default => $waktu->toDateString(),
            };

            $po->update([
                'status' => 'diterima',
                'tanggal_terima' => $waktu->toDateString(),
                'diterima_oleh' => $userId,
                'keterangan' => $catatan,
                'total' => $total,
                'jatuh_tempo' => $jatuhTempo,
            ]);

            return $po;
        });
    }

    /**
     * Retur barang titipan ke pemiliknya: stok berkurang dan mutasi `keluar` dicatat.
     * Retur bukan penjualan, jadi tidak ikut ditagih.
     *
     * @return string nomor referensi retur (RTR-YYYYMMDD-001)
     *
     * @throws StokException
     */
    public function returKonsinyasi(int $barangId, int $jumlah, int $userId, ?string $keterangan = null): string
    {
        return DB::transaction(function () use ($barangId, $jumlah, $userId, $keterangan) {
            $barang = Barang::query()->lockForUpdate()->findOrFail($barangId);

            if (! $barang->isKonsinyasi()) {
                throw new StokException("{$barang->sku} bukan barang konsinyasi.");
            }
            if ($jumlah < 1 || $jumlah > $barang->stok) {
                throw new StokException("Jumlah retur {$barang->sku} harus antara 1 dan stok yang ada ({$barang->stok}).");
            }

            $prefix = 'RTR-'.now()->format('Ymd').'-';
            DB::select('SELECT pg_advisory_xact_lock(hashtext(?))', [$prefix]);
            $terakhir = MutasiStok::where('referensi', 'like', $prefix.'%')->max('referensi');
            $urut = $terakhir ? ((int) substr($terakhir, strlen($prefix))) + 1 : 1;
            $nomor = $prefix.str_pad((string) $urut, 3, '0', STR_PAD_LEFT);

            $barang->stok -= $jumlah;
            $barang->save();

            MutasiStok::create([
                'barang_id' => $barang->id,
                'tanggal' => now(),
                'jenis' => 'keluar',
                'jumlah' => $jumlah,
                'stok_akhir' => $barang->stok,
                'referensi' => $nomor,
                'keterangan' => trim('Retur konsinyasi ke pemasok. '.$keterangan),
                'user_id' => $userId,
            ]);

            return $nomor;
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

            // Jejak pelaksana: siapa yang mengambil barang, dan kapan.
            RiwayatPesanan::create([
                'pesanan_id' => $pesanan->id,
                'status' => 'diambil',
                'user_id' => $userId,
                'waktu' => $waktu,
            ]);

            return $pesanan;
        });
    }
}
