<?php

namespace App\Repositories\Eloquent;

use App\Models\Barang;
use App\Models\DetailPembelian;
use App\Models\DetailPesanan;
use App\Models\MutasiStok;
use App\Repositories\Interfaces\BarangRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class BarangRepository extends BaseRepository implements BarangRepositoryInterface
{
    protected array $searchable = ['sku', 'nama', 'kategori', 'warna'];

    protected array $with = ['rak'];

    protected string $orderBy = 'sku';

    public function __construct()
    {
        parent::__construct(new Barang());
    }

    public function daftarKategori(): array
    {
        return Barang::query()->select('kategori')->distinct()->orderBy('kategori')->pluck('kategori')->all();
    }

    public function isDipakai(int|string $id): bool
    {
        return DetailPembelian::where('barang_id', $id)->exists()
            || DetailPesanan::where('barang_id', $id)->exists()
            || MutasiStok::where('barang_id', $id)->exists();
    }

    public function paginateStok(?string $search = null, ?string $kategori = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->applySearch($this->query(), $search);

        if ($kategori) {
            $query->where('kategori', $kategori);
        }

        return $query->orderBy($this->orderBy, $this->orderDir)->paginate($perPage)->withQueryString();
    }

    public function getStokMinimum(?int $limit = null): Collection
    {
        $query = $this->query()
            ->whereColumn('stok', '<=', 'stok_minimum')
            ->orderBy('stok')
            ->orderBy('sku');

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }
}
