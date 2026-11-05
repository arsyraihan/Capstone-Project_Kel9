<?php

namespace App\Repositories\Eloquent;

use App\Models\Pelanggan;
use App\Models\Pesanan;
use App\Repositories\Interfaces\PelangganRepositoryInterface;

class PelangganRepository extends BaseRepository implements PelangganRepositoryInterface
{
    protected array $searchable = ['kode_pelanggan', 'nama', 'telepon', 'alamat'];

    protected string $orderBy = 'kode_pelanggan';

    public function __construct()
    {
        parent::__construct(new Pelanggan());
    }

    public function isDipakai(int|string $id): bool
    {
        return Pesanan::where('pelanggan_id', $id)->exists();
    }
}
