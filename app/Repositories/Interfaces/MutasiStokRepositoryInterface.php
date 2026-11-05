<?php

namespace App\Repositories\Interfaces;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface MutasiStokRepositoryInterface extends RepositoryInterface
{
    /** Riwayat mutasi satu barang (kartu stok), terbaru di atas. */
    public function paginateByBarang(int|string $barangId, int $perPage = 10): LengthAwarePaginator;

    /**
     * Rekap barang masuk vs keluar per bulan untuk N bulan terakhir (termasuk bulan ini).
     * Dikelompokkan di PHP (Collection + Carbon), bukan dengan fungsi tanggal database.
     *
     * @return array<int, array{bulan: string, masuk: int, keluar: int}>
     */
    public function rekapBulanan(int $jumlahBulan = 6): array;

    /** Daftar mutasi untuk laporan: satu jenis (masuk/keluar), difilter rentang tanggal, urut tanggal naik. */
    public function laporan(string $jenis, ?string $dari = null, ?string $sampai = null): Collection;
}
