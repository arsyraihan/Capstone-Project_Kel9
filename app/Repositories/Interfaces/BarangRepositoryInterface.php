<?php

namespace App\Repositories\Interfaces;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface BarangRepositoryInterface extends RepositoryInterface
{
    /** Daftar kategori yang sudah ada (untuk saran isian dan filter). */
    public function daftarKategori(): array;

    /** True bila barang sudah dipakai di transaksi (PO, pesanan, atau mutasi stok). */
    public function isDipakai(int|string $id): bool;

    /** Daftar stok dengan pencarian dan filter kategori. */
    public function paginateStok(?string $search = null, ?string $kategori = null, int $perPage = 10): LengthAwarePaginator;

    /** Barang dengan stok <= stok minimum, yang paling kritis di atas. */
    public function getStokMinimum(?int $limit = null): Collection;

    /** Angka ringkasan Dashboard: total SKU, total stok (pcs), dan jumlah barang di bawah/sama dengan stok minimum. */
    public function ringkasan(): array;

    /** Jumlah barang yang belum ditempatkan di rak mana pun. */
    public function jumlahTanpaRak(): int;
}
