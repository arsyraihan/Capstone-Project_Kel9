<?php

namespace Database\Seeders;

use App\Models\MutasiStok;
use App\Models\Pembelian;
use App\Models\Pesanan;
use App\Models\RiwayatPesanan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Menyesuaikan DATA CONTOH yang sudah ada di database dengan sistem enam peran.
 * (Database baru yang diisi lewat `php artisan db:seed` tidak membutuhkan seeder ini.)
 *
 *  1. Membuat akun demo setiap peran (akun `petugas@` lama tidak disentuh).
 *  2. Menetapkan pelaksana yang sesuai peran pada transaksi contoh: pengadaan membuat PO/pesanan,
 *     gudang menerima barang, picker mengambil barang.
 *  3. Menyusun riwayat (jejak) proses untuk pesanan contoh.
 *
 * Aman dijalankan berulang. Hanya data yang dibuat sebelum BATAS_DATA_CONTOH yang disentuh,
 * jadi transaksi buatan anggota kelompok sesudahnya tidak ikut berubah.
 *
 * Jalankan: php artisan db:seed --class=SinkronPeranSeeder
 */
class SinkronPeranSeeder extends Seeder
{
    private const BATAS_DATA_CONTOH = '2026-11-06 00:00:00';

    public function run(): void
    {
        $this->call(AkunPeranSeeder::class);

        $pengadaan = User::where('email', 'pengadaan@inventaris.test')->firstOrFail()->id;
        $gudang = User::where('email', 'gudang@inventaris.test')->firstOrFail()->id;
        $picker = User::where('email', 'picker@inventaris.test')->firstOrFail()->id;
        $pengiriman = User::where('email', 'pengiriman@inventaris.test')->firstOrFail()->id;

        $batas = self::BATAS_DATA_CONTOH;

        Pembelian::where('created_at', '<', $batas)->update(['dibuat_oleh' => $pengadaan]);
        Pembelian::where('created_at', '<', $batas)->where('status', 'diterima')->update(['diterima_oleh' => $gudang]);
        Pesanan::where('created_at', '<', $batas)->update(['dibuat_oleh' => $pengadaan]);
        MutasiStok::where('created_at', '<', $batas)->where('jenis', 'masuk')->update(['user_id' => $gudang]);
        MutasiStok::where('created_at', '<', $batas)->where('jenis', 'keluar')->update(['user_id' => $picker]);

        $dibuat = 0;
        $pesanan = Pesanan::where('created_at', '<', $batas)->whereDoesntHave('riwayat')->get();

        foreach ($pesanan as $p) {
            $baris = $this->susunRiwayat($p, $pengadaan, $picker, $pengiriman);
            RiwayatPesanan::insert($baris);
            $dibuat += count($baris);
        }

        $this->command?->info("Peran disinkronkan. Riwayat dibuat: {$dibuat} baris untuk {$pesanan->count()} pesanan.");
    }

    /** @return array<int, array<string, mixed>> */
    private function susunRiwayat(Pesanan $p, int $pengadaan, int $picker, int $pengiriman): array
    {
        $tanggal = Carbon::parse($p->tanggal);

        $ambil = MutasiStok::where('referensi', $p->no_pesanan)->where('jenis', 'keluar')->min('tanggal');
        $waktuAmbil = $ambil ? Carbon::parse($ambil) : null;

        $waktuBaru = $tanggal->copy()->setTime(8, 0);
        if ($waktuAmbil && $waktuBaru->greaterThanOrEqualTo($waktuAmbil)) {
            $waktuBaru = $waktuAmbil->copy()->subHour();
        }

        $peristiwa = [['baru', $pengadaan, $waktuBaru]];

        if ($p->status === 'batal') {
            $peristiwa[] = ['batal', $pengadaan, $tanggal->copy()->setTime(15, 0)];
        } else {
            $sampai = array_search($p->status, Pesanan::ALUR_STATUS, true);
            $waktuAmbil ??= $waktuBaru->copy()->addHours(3);

            if ($sampai >= 1) {
                $peristiwa[] = ['diambil', $picker, $waktuAmbil];
            }
            $waktuKemas = $this->batasi($waktuAmbil->copy()->addHours(2));
            if ($sampai >= 2) {
                $peristiwa[] = ['dikemas', $pengiriman, $waktuKemas];
            }
            $waktuKirim = $p->tanggal_kirim ? Carbon::parse($p->tanggal_kirim)->setTime(10, 0) : $waktuKemas->copy()->addDay();
            if ($waktuKirim->lessThanOrEqualTo($waktuKemas)) {
                $waktuKirim = $this->batasi($waktuKemas->copy()->addHour());
            }
            if ($sampai >= 3) {
                $peristiwa[] = ['dikirim', $pengiriman, $waktuKirim];
            }
            if ($sampai >= 4) {
                $peristiwa[] = ['selesai', $pengiriman, $this->batasi($waktuKirim->copy()->addDays(2))];
            }
        }

        return array_map(fn (array $e) => [
            'pesanan_id' => $p->id,
            'status' => $e[0],
            'user_id' => $e[1],
            'waktu' => $e[2]->format('Y-m-d H:i:s'),
            'keterangan' => null,
        ], $peristiwa);
    }

    private function batasi(Carbon $waktu): Carbon
    {
        return $waktu->greaterThan(now()) ? now()->copy() : $waktu;
    }
}
