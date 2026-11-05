<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\Pelanggan;
use App\Models\Pembelian;
use App\Models\Pemasok;
use App\Models\Pesanan;
use App\Models\User;
use App\Repositories\Interfaces\PembelianRepositoryInterface;
use App\Repositories\Interfaces\PesananRepositoryInterface;
use App\Services\StokService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Data contoh transaksi selama 6 bulan terakhir.
 *
 * Semua perubahan stok dibuat lewat StokService (terimaPembelian dan ambilPesanan), sehingga
 * barang.stok dan mutasi_stok selalu konsisten. Peristiwa diproses berurutan menurut waktu,
 * jadi stok selalu cukup saat pengambilan dan kartu stok terbaca runtut.
 *
 * Seeder ini hanya berjalan bila belum ada PO/pesanan (aman dijalankan berulang).
 */
class TransaksiSeeder extends Seeder
{
    private User $admin;

    private User $petugas;

    private array $pemasokIds = [];

    private array $pelangganIds = [];

    private int $urutPemasok = 0;

    private int $urutPelanggan = 0;

    public function __construct(
        private PembelianRepositoryInterface $pembelian,
        private PesananRepositoryInterface $pesanan,
        private StokService $stok,
    ) {
    }

    public function run(): void
    {
        if (Pembelian::exists() || Pesanan::exists()) {
            $this->command?->warn('Transaksi sudah ada, TransaksiSeeder dilewati.');

            return;
        }

        mt_srand(20260101); // hasil acak selalu sama

        $this->admin = User::where('email', 'admin@inventaris.test')->firstOrFail();
        $this->petugas = User::where('email', 'petugas@inventaris.test')->firstOrFail();
        $this->pemasokIds = Pemasok::orderBy('id')->pluck('id')->all();
        $this->pelangganIds = Pelanggan::orderBy('id')->pluck('id')->all();

        $peristiwa = $this->susunPeristiwa();

        // Urutkan menurut waktu (sort stabil di PHP 8, urutan penyusunan dipertahankan bila waktunya sama).
        usort($peristiwa, fn (array $a, array $b) => $a[0]->timestamp <=> $b[0]->timestamp);

        foreach ($peristiwa as [$waktu, $aksi]) {
            $aksi($waktu);
        }

        $this->pesananPenutup();

        $this->command?->info('Transaksi contoh selesai dibuat.');
    }

    /** @return array<int, array{0: Carbon, 1: callable}> */
    private function susunPeristiwa(): array
    {
        $awal = now()->startOfMonth()->subMonthsNoOverflow(5);

        // Waktu pada bulan ke-N sejak awal periode (0 = 5 bulan lalu, 5 = bulan ini); tidak melewati saat ini.
        $waktu = function (int $bulanKe, int $hari, int $jam, int $menit = 0) use ($awal): Carbon {
            $t = $awal->copy()->addMonthsNoOverflow($bulanKe)->day($hari)->setTime($jam, $menit);

            return $t->greaterThan(now()) ? now()->copy() : $t;
        };

        $p = [];

        // Bulan ke-0: dua PO awal untuk mengisi stok gudang.
        $p[] = [$waktu(0, 3, 9), fn (Carbon $w) => $this->poDiterima($w, $this->stokAwal(0, 10))];
        $p[] = [$waktu(0, 6, 9, 30), fn (Carbon $w) => $this->poDiterima($w, $this->stokAwal(10, 10))];

        // Pesanan selesai, 3 per bulan untuk bulan ke-0 sampai ke-4.
        $hariPesanan = [8, 15, 23];
        for ($bulan = 0; $bulan <= 4; $bulan++) {
            foreach ($hariPesanan as $i => $hari) {
                $akhir = ($bulan === 2 || $bulan === 4) && $i === 2 ? 'batal' : 'selesai';
                $p[] = [$waktu($bulan, $hari, 13, 10 * $i), fn (Carbon $w) => $this->buatPesanan($w, $akhir)];
            }
        }

        // Restock PO bulanan (bulan ke-1 sampai ke-5): barang yang stoknya menipis diisi ulang.
        for ($bulan = 1; $bulan <= 5; $bulan++) {
            $p[] = [$waktu($bulan, 2, 9, 30), fn (Carbon $w) => $this->poDiterima($w, $this->kebutuhanRestock())];
        }

        // PO lama yang belum juga datang (bulan ke-4, akhir bulan).
        $p[] = [$waktu(4, 26, 10), fn (Carbon $w) => $this->poDipesan($w, $this->itemAcak(3, 30))];

        // Bulan ini: satu pesanan di tiap status.
        $p[] = [$waktu(5, 1, 13), fn (Carbon $w) => $this->buatPesanan($w, 'selesai')];
        $p[] = [$waktu(5, 2, 11), fn (Carbon $w) => $this->buatPesanan($w, 'dikirim')];
        $p[] = [$waktu(5, 3, 10), fn (Carbon $w) => $this->buatPesanan($w, 'batal')];
        $p[] = [$waktu(5, 3, 14), fn (Carbon $w) => $this->buatPesanan($w, 'dikemas')];
        $p[] = [$waktu(5, 4, 10, 30), fn (Carbon $w) => $this->buatPesanan($w, 'diambil')];
        $p[] = [$waktu(5, 4, 15), fn (Carbon $w) => $this->buatPesanan($w, 'baru')];
        $p[] = [$waktu(5, 5, 9), fn (Carbon $w) => $this->buatPesanan($w, 'baru')];

        // PO bulan ini yang masih dipesan: barang-barang yang stoknya menipis.
        $p[] = [$waktu(5, 3, 16), fn (Carbon $w) => $this->poDipesan($w, $this->itemStokRendah())];

        return $p;
    }

    // ---------------------------------------------------------------- Pengadaan

    /** @param  array<int, int>  $items  barang_id => jumlah */
    private function poDiterima(Carbon $waktuTerima, array $items): void
    {
        if ($items === []) {
            return;
        }

        $po = $this->buatPo($waktuTerima->copy()->subDays(2), $items, 'Pengiriman reguler dari pemasok');
        $this->stok->terimaPembelian($po, $this->petugas->id, null, $waktuTerima);
    }

    /** @param  array<int, int>  $items  barang_id => jumlah */
    private function poDipesan(Carbon $waktu, array $items): void
    {
        if ($items === []) {
            return;
        }

        $this->buatPo($waktu, $items, 'Menunggu kiriman dari pemasok');
    }

    private function buatPo(Carbon $tanggal, array $items, string $keterangan): Pembelian
    {
        $pemasokId = $this->pemasokIds[$this->urutPemasok++ % count($this->pemasokIds)];

        return $this->pembelian->createWithDetail([
            'tanggal' => $tanggal->toDateString(),
            'pemasok_id' => $pemasokId,
            'status' => 'dipesan',
            'keterangan' => $keterangan,
            'dibuat_oleh' => $this->admin->id,
        ], $this->keDetail($items));
    }

    /** Stok awal: 5x stok minimum untuk potongan daftar barang. */
    private function stokAwal(int $mulai, int $jumlah): array
    {
        return Barang::orderBy('id')->skip($mulai)->take($jumlah)->get()
            ->mapWithKeys(fn (Barang $b) => [$b->id => $b->stok_minimum * 5])
            ->all();
    }

    /** Barang yang stoknya kurang dari 4x minimum diisi sampai 6x minimum. */
    private function kebutuhanRestock(): array
    {
        return Barang::orderBy('id')->get()
            ->filter(fn (Barang $b) => $b->stok < $b->stok_minimum * 4)
            ->mapWithKeys(fn (Barang $b) => [$b->id => $b->stok_minimum * 6 - $b->stok])
            ->all();
    }

    private function itemStokRendah(): array
    {
        return Barang::whereIn('sku', array_keys(self::TARGET_STOK_RENDAH))->get()
            ->mapWithKeys(fn (Barang $b) => [$b->id => $b->stok_minimum * 4])
            ->all();
    }

    private function itemAcak(int $banyak, int $jumlah): array
    {
        return Barang::orderBy('id')->get()->shuffle()->take($banyak)
            ->mapWithKeys(fn (Barang $b) => [$b->id => $jumlah])
            ->all();
    }

    // ------------------------------------------------------------------ Pesanan

    /**
     * Buat pesanan lalu jalankan alurnya sampai status akhir yang diminta.
     *
     * @param  string  $akhir  baru | diambil | dikemas | dikirim | selesai | batal
     * @param  array<int, int>|null  $items  barang_id => jumlah; null = dipilih acak dari barang yang stoknya ada
     */
    private function buatPesanan(Carbon $waktu, string $akhir, ?array $items = null): void
    {
        $items ??= $this->itemPesananAcak();

        if ($items === []) {
            return;
        }

        $pelangganId = $this->pelangganIds[$this->urutPelanggan++ % count($this->pelangganIds)];

        $pesanan = $this->pesanan->createWithDetail([
            'tanggal' => $waktu->copy()->subDays(mt_rand(0, 1))->toDateString(),
            'pelanggan_id' => $pelangganId,
            'status' => 'baru',
            'keterangan' => null,
            'dibuat_oleh' => $this->admin->id,
        ], $this->keDetail($items));

        if ($akhir === 'baru') {
            return;
        }

        if ($akhir === 'batal') {
            $this->pesanan->batalkan($pesanan->id);

            return;
        }

        $this->stok->ambilPesanan($pesanan, $this->petugas->id, $waktu);
        if ($akhir === 'diambil') {
            return;
        }

        $this->pesanan->majukan($pesanan->id, 'dikemas', ['jumlah_koli' => mt_rand(1, 4)]);
        if ($akhir === 'dikemas') {
            return;
        }

        $ekspedisi = ['JNE', 'J&T Express', 'SiCepat', 'Indah Cargo', 'Dakota Cargo'][mt_rand(0, 4)];
        $tanggalKirim = $waktu->copy()->addDay();
        $this->pesanan->majukan($pesanan->id, 'dikirim', [
            'ekspedisi' => $ekspedisi,
            'no_resi' => 'RESI'.mt_rand(10000000, 99999999),
            'tanggal_kirim' => ($tanggalKirim->greaterThan(now()) ? now() : $tanggalKirim)->toDateString(),
        ]);
        if ($akhir === 'dikirim') {
            return;
        }

        $this->pesanan->majukan($pesanan->id, 'selesai');
    }

    /** 2-4 barang acak, jumlah dibatasi setengah dari stok yang ada agar selalu cukup. */
    private function itemPesananAcak(): array
    {
        return Barang::where('stok', '>', 0)->orderBy('id')->get()
            ->shuffle()->take(mt_rand(2, 4))
            ->mapWithKeys(fn (Barang $b) => [$b->id => max(1, min(mt_rand(3, 15), intdiv($b->stok, 2)))])
            ->all();
    }

    /** Stok akhir yang dituju agar beberapa barang berada di bawah (atau tepat di) stok minimum. */
    private const TARGET_STOK_RENDAH = [
        'KAO-001-S-HTM' => 15,   // minimum 20  -> di bawah minimum
        'JKT-001-M-ABU' => 5,    // minimum 8   -> di bawah minimum
        'HJB-001-ALL-KRM' => 15, // minimum 25  -> di bawah minimum
        'GMS-001-M-MRN' => 4,    // minimum 8   -> di bawah minimum
        'CHN-001-M-KRM' => 10,   // minimum 10  -> tepat sama dengan minimum
    ];

    /** Pesanan terakhir (status dikemas) yang menurunkan stok beberapa barang ke bawah minimum. */
    private function pesananPenutup(): void
    {
        $items = [];

        foreach (Barang::whereIn('sku', array_keys(self::TARGET_STOK_RENDAH))->get() as $barang) {
            $kurangi = $barang->stok - self::TARGET_STOK_RENDAH[$barang->sku];
            if ($kurangi > 0) {
                $items[$barang->id] = $kurangi;
            }
        }

        $this->buatPesanan(now()->copy(), 'dikemas', $items);
    }

    /** @param  array<int, int>  $items  barang_id => jumlah */
    private function keDetail(array $items): array
    {
        $detail = [];
        foreach ($items as $barangId => $jumlah) {
            $detail[] = ['barang_id' => $barangId, 'jumlah' => $jumlah];
        }

        return $detail;
    }
}
