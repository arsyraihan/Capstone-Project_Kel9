<?php

namespace App\Repositories\Interfaces;

use App\Models\Pesanan;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PesananRepositoryInterface extends RepositoryInterface
{
    /** Daftar pesanan dengan status tertentu. Pengambilan memakai urutan terlama dulu. */
    public function paginateByStatus(string $status, ?string $search = null, int $perPage = 10, bool $terlamaDulu = false): LengthAwarePaginator;

    /** Nomor pesanan berikutnya, format PSN-YYYYMMDD-001 (urutan reset tiap hari). */
    public function nomorBerikutnya(string $tanggal): string;

    /**
     * Simpan pesanan beserta item-itemnya dalam satu transaksi, dan catat riwayat `baru`
     * atas nama `$header['dibuat_oleh']`.
     */
    public function createWithDetail(array $header, array $items, ?CarbonInterface $waktu = null): Pesanan;

    /**
     * Ubah pesanan dan ganti seluruh item-itemnya.
     *
     * @throws \App\Exceptions\AlurPesananException bila status bukan `baru`
     */
    public function updateWithDetail(int|string $id, array $header, array $items): Pesanan;

    /**
     * Majukan status SATU langkah sesuai urutan (baru > diambil > dikemas > dikirim > selesai)
     * dan catat riwayatnya atas nama `$userId`. Tidak boleh melompat dan tidak boleh mundur.
     * `$data` adalah kolom tambahan (koli, resi, dst).
     *
     * @throws \App\Exceptions\AlurPesananException
     */
    public function majukan(int|string $id, string $statusBaru, int $userId, array $data = [], ?CarbonInterface $waktu = null): Pesanan;

    /**
     * Batalkan pesanan atas nama `$userId`. Hanya pesanan berstatus `baru` yang boleh dibatalkan.
     *
     * @throws \App\Exceptions\AlurPesananException
     */
    public function batalkan(int|string $id, int $userId, ?CarbonInterface $waktu = null): Pesanan;

    /** Jumlah pesanan yang belum dikirim (status baru, diambil, atau dikemas). */
    public function jumlahBelumDikirim(): int;

    /** Jumlah pesanan per status, mis. ['baru' => 2, 'selesai' => 14]. */
    public function hitungPerStatus(): array;

    /** Pesanan terbaru (untuk Dashboard). */
    public function terbaru(int $limit = 5): Collection;
}
