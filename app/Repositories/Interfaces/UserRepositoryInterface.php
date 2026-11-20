<?php

namespace App\Repositories\Interfaces;

interface UserRepositoryInterface extends RepositoryInterface
{
    /** True bila pengguna tercatat di transaksi (PO, pesanan, atau mutasi stok). */
    public function isDipakai(int|string $id): bool;

    /** Jumlah pengguna per peran, mis. ['admin' => 1, 'gudang' => 1]. */
    public function hitungPerPeran(): array;
}
