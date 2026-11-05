<?php

namespace App\Repositories\Eloquent;

use App\Models\MutasiStok;
use App\Repositories\Interfaces\MutasiStokRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MutasiStokRepository extends BaseRepository implements MutasiStokRepositoryInterface
{
    protected array $searchable = ['referensi', 'keterangan'];

    protected array $with = ['barang', 'user'];

    protected string $orderBy = 'tanggal';

    protected string $orderDir = 'desc';

    public function __construct()
    {
        parent::__construct(new MutasiStok());
    }

    public function paginateByBarang(int|string $barangId, int $perPage = 10): LengthAwarePaginator
    {
        return $this->query()
            ->where('barang_id', $barangId)
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }
}
