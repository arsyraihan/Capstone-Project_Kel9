<?php

namespace App\Repositories\Eloquent;

use App\Models\Pembelian;
use App\Repositories\Interfaces\PembelianRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class PembelianRepository extends BaseRepository implements PembelianRepositoryInterface
{
    protected array $with = ['pemasok', 'detail.barang', 'pembuat', 'penerima'];

    protected string $orderBy = 'id';

    protected string $orderDir = 'desc';

    public function __construct()
    {
        parent::__construct(new Pembelian());
    }

    /** Cari berdasarkan nomor PO atau nama pemasok. */
    protected function applySearch(Builder $query, ?string $search): Builder
    {
        $search = trim((string) $search);

        if ($search === '') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($search) {
            $q->where('no_po', 'ilike', "%{$search}%")
                ->orWhereHas('pemasok', fn (Builder $p) => $p->where('nama', 'ilike', "%{$search}%"));
        });
    }

    public function paginateByStatus(string $status, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return $this->applySearch($this->query()->where('status', $status), $search)
            ->orderBy($this->orderBy, $this->orderDir)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function nomorBerikutnya(string $tanggal): string
    {
        $prefix = 'PO-'.date('Ymd', strtotime($tanggal)).'-';

        $terakhir = Pembelian::where('no_po', 'like', $prefix.'%')->max('no_po');
        $urut = $terakhir ? ((int) substr($terakhir, -3)) + 1 : 1;

        return $prefix.str_pad((string) $urut, 3, '0', STR_PAD_LEFT);
    }

    public function createWithDetail(array $header, array $items): Pembelian
    {
        return DB::transaction(function () use ($header, $items) {
            $header['no_po'] = $this->nomorBerikutnya($header['tanggal']);

            $po = Pembelian::create($header);
            $po->detail()->createMany($items);

            return $po;
        });
    }

    public function updateWithDetail(int|string $id, array $header, array $items): Pembelian
    {
        return DB::transaction(function () use ($id, $header, $items) {
            $po = Pembelian::findOrFail($id);
            $po->update($header);
            $po->detail()->delete();
            $po->detail()->createMany($items);

            return $po;
        });
    }

    public function hitungPerStatus(): array
    {
        return Pembelian::query()
            ->select('status', DB::raw('count(*) as jumlah'))
            ->groupBy('status')
            ->pluck('jumlah', 'status')
            ->map(fn ($n) => (int) $n)
            ->all();
    }
}
