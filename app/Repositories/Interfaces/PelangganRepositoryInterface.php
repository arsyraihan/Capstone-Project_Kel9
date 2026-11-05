<?php

namespace App\Repositories\Interfaces;

interface PelangganRepositoryInterface extends RepositoryInterface
{
    /** True bila pelanggan sudah dipakai di pesanan. */
    public function isDipakai(int|string $id): bool;
}
