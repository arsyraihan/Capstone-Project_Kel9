<?php

namespace App\Repositories\Interfaces;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface MutasiStokRepositoryInterface extends RepositoryInterface
{
    /** Riwayat mutasi satu barang (kartu stok), terbaru di atas. */
    public function paginateByBarang(int|string $barangId, int $perPage = 10): LengthAwarePaginator;
}
