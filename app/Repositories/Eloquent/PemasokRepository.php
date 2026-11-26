<?php

namespace App\Repositories\Eloquent;

use App\Models\Barang;
use App\Models\Pembelian;
use App\Models\PenyelesaianKonsinyasi;
use App\Models\Pemasok;
use App\Repositories\Interfaces\PemasokRepositoryInterface;

class PemasokRepository extends BaseRepository implements PemasokRepositoryInterface
{
    protected array $searchable = ['kode_pemasok', 'nama', 'telepon', 'alamat'];

    protected string $orderBy = 'kode_pemasok';

    public function __construct()
    {
        parent::__construct(new Pemasok());
    }

    public function isDipakai(int|string $id): bool
    {
        return Pembelian::where('pemasok_id', $id)->exists()
            || Barang::where('pemasok_id', $id)->exists()
            || PenyelesaianKonsinyasi::where('pemasok_id', $id)->exists();
    }
}
