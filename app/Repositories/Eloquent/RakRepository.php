<?php

namespace App\Repositories\Eloquent;

use App\Models\Barang;
use App\Models\Rak;
use App\Repositories\Interfaces\RakRepositoryInterface;

class RakRepository extends BaseRepository implements RakRepositoryInterface
{
    protected array $searchable = ['kode_rak', 'keterangan'];

    protected string $orderBy = 'kode_rak';

    public function __construct()
    {
        parent::__construct(new Rak());
    }

    public function isDipakai(int|string $id): bool
    {
        return Barang::where('rak_id', $id)->exists();
    }
}
