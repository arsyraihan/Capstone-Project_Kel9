<?php

namespace App\Repositories\Interfaces;

use App\Models\Pesanan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PesananRepositoryInterface extends RepositoryInterface
{
    /** Daftar pesanan dengan status tertentu. Pengambilan memakai urutan terlama dulu. */
    public function paginateByStatus(string $status, ?string $search = null, int $perPage = 10, bool $terlamaDulu = false): LengthAwarePaginator;

    /** Nomor pesanan berikutnya, format PSN-YYYYMMDD-001 (urutan reset tiap hari). */
    public function nomorBerikutnya(string $tanggal): string;

    /** Simpan pesanan beserta item-itemnya dalam satu transaksi. */
    public function createWithDetail(array $header, array $items): Pesanan;

    /**
     * Ubah pesanan dan ganti seluruh item-itemnya.
     *
     * @throws \App\Exceptions\AlurPesananException bila status bukan `baru`
     */
    public function updateWithDetail(int|string $id, array $header, array $items): Pesanan;

    /**
     * Majukan status SATU langkah sesuai urutan (baru > diambil > dikemas > dikirim > selesai).
     * Tidak boleh melompat dan tidak boleh mundur. `$data` adalah kolom tambahan (koli, resi, dst).
     *
     * @throws \App\Exceptions\AlurPesananException
     */
    public function majukan(int|string $id, string $statusBaru, array $data = []): Pesanan;

    /**
     * Batalkan pesanan. Hanya pesanan berstatus `baru` yang boleh dibatalkan.
     *
     * @throws \App\Exceptions\AlurPesananException
     */
    public function batalkan(int|string $id): Pesanan;

    /** Jumlah pesanan yang belum dikirim (status baru, diambil, atau dikemas). */
    public function jumlahBelumDikirim(): int;

    /** Pesanan terbaru (untuk Dashboard). */
    public function terbaru(int $limit = 5): Collection;
}
