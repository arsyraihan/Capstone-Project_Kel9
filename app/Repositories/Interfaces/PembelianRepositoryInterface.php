<?php

namespace App\Repositories\Interfaces;

use App\Models\Pembelian;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PembelianRepositoryInterface extends RepositoryInterface
{
    /** Daftar PO dengan status tertentu (mis. `dipesan` untuk halaman Penerimaan). */
    public function paginateByStatus(string $status, ?string $search = null, int $perPage = 10): LengthAwarePaginator;

    /** Nomor PO berikutnya untuk tanggal tertentu, format PO-YYYYMMDD-001 (urutan reset tiap hari). */
    public function nomorBerikutnya(string $tanggal): string;

    /** Simpan PO beserta item-itemnya dalam satu transaksi. */
    public function createWithDetail(array $header, array $items): Pembelian;

    /** Ubah PO dan ganti seluruh item-itemnya dalam satu transaksi. */
    public function updateWithDetail(int|string $id, array $header, array $items): Pembelian;
}
