<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\DetailPembelian;
use App\Models\DetailPesanan;
use App\Models\Pembelian;
use App\Models\Pesanan;
use App\Models\User;
use App\Services\KeuanganService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Menyesuaikan DATA LAMA (Supabase bersama) dengan fitur keuangan.
 * (Database baru yang diisi lewat `php artisan db:seed` tidak membutuhkan seeder ini.)
 *
 *  1. Mengisi harga barang yang masih 0, lalu harga satuan pada detail PO/pesanan.
 *  2. PO lama yang sudah diterima: dianggap datang lengkap, dihitung totalnya.
 *  3. Pesanan lama: dihitung totalnya; yang sudah dikirim diberi jatuh tempo.
 *  4. Transaksi lama dicatat SUDAH LUNAS agar tidak muncul sebagai tunggakan.
 *
 * Data lama dikenali dari kolom baru yang masih kosong (jumlah_diterima / jatuh_tempo null),
 * jadi aman dijalankan berulang: transaksi yang dibuat dengan versi baru tidak tersentuh.
 *
 * Jalankan: php artisan db:seed --class=SinkronKeuanganSeeder
 */
class SinkronKeuanganSeeder extends Seeder
{
    private const KETERANGAN = 'Pelunasan data lama';

    public function run(KeuanganService $keuangan): void
    {
        $this->call(AkunPeranSeeder::class); // sekaligus mengganti nama akun "Manajemen User"
        $user = User::where('email', 'manajemen@inventaris.test')->firstOrFail()->id;

        DB::transaction(function () use ($keuangan, $user) {
            $this->isiHargaBarang();
            $barang = Barang::all()->keyBy('id');

            DetailPembelian::where('harga_satuan', 0)->get()
                ->each(fn (DetailPembelian $d) => $d->update(['harga_satuan' => $barang[$d->barang_id]->harga_beli]));
            DetailPesanan::where('harga_satuan', 0)->get()
                ->each(fn (DetailPesanan $d) => $d->update(['harga_satuan' => $barang[$d->barang_id]->harga_jual]));

            $po = $this->poLama($keuangan, $user);
            $pesanan = $this->pesananLama($keuangan, $user);

            $this->command?->info("Sinkron keuangan selesai: {$po} PO lama dan {$pesanan} pesanan lama dicatat lunas.");
        });
    }

    private function isiHargaBarang(): void
    {
        foreach (Barang::where('harga_beli', 0)->where('harga_jual', 0)->get() as $barang) {
            if ($harga = BarangSeeder::HARGA[$barang->kategori] ?? null) {
                $barang->update(['harga_beli' => $harga[0], 'harga_jual' => $harga[1]]);
            }
        }
    }

    private function poLama(KeuanganService $keuangan, int $user): int
    {
        $daftar = Pembelian::with('detail')->where('status', 'diterima')
            ->whereHas('detail', fn ($q) => $q->whereNull('jumlah_diterima'))->get();

        foreach ($daftar as $po) {
            $po->detail->each(fn (DetailPembelian $d) => $d->update(['jumlah_diterima' => $d->jumlah]));

            $total = $po->detail->sum(fn (DetailPembelian $d) => $d->jumlah * $d->harga_satuan);
            $tanggal = ($po->tanggal_terima ?? $po->tanggal)->toDateString();
            $po->update(['total' => $total, 'jatuh_tempo' => $tanggal]);

            if ($total > 0 && $po->cara_bayar !== 'konsinyasi') {
                $keuangan->bayar('hutang', $po->id, $total, $tanggal, 'transfer', self::KETERANGAN, $user);
            }
        }

        return $daftar->count();
    }

    private function pesananLama(KeuanganService $keuangan, int $user): int
    {
        $lunas = 0;

        foreach (Pesanan::with('detail')->where('total', 0)->orWhereNull('jatuh_tempo')->get() as $pesanan) {
            if ((float) $pesanan->total === 0.0) {
                $pesanan->update(['total' => $pesanan->detail->sum(fn (DetailPesanan $d) => $d->jumlah * $d->harga_satuan)]);
            }

            if ($pesanan->jatuh_tempo !== null || ! in_array($pesanan->status, ['dikirim', 'selesai'], true)) {
                continue;
            }

            $tanggal = ($pesanan->tanggal_kirim ?? $pesanan->tanggal)->toDateString();
            $pesanan->update(['jatuh_tempo' => $tanggal]);

            if ($pesanan->total > 0) {
                $keuangan->bayar('piutang', $pesanan->id, $pesanan->total, $tanggal, 'transfer', self::KETERANGAN, $user);
                $lunas++;
            }
        }

        return $lunas;
    }
}
