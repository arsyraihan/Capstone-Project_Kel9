<?php

namespace App\Repositories\Interfaces;

interface RakRepositoryInterface extends RepositoryInterface
{
    /** True bila rak masih dipakai oleh barang. */
    public function isDipakai(int|string $id): bool;
}
