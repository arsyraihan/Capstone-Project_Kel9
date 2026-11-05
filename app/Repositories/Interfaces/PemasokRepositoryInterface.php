<?php

namespace App\Repositories\Interfaces;

interface PemasokRepositoryInterface extends RepositoryInterface
{
    /** True bila pemasok sudah dipakai di Purchase Order. */
    public function isDipakai(int|string $id): bool;
}
