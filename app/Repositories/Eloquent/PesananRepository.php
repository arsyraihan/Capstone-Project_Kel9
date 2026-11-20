<?php

namespace App\Repositories\Eloquent;

use App\Exceptions\AlurPesananException;
use App\Models\Pesanan;
use App\Models\RiwayatPesanan;
use App\Repositories\Interfaces\PesananRepositoryInterface;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PesananRepository extends BaseRepository implements PesananRepositoryInterface
{
    protected array $with = ['pelanggan', 'detail.barang.rak', 'pembuat'];

    protected string $orderBy = 'id';

    protected string $orderDir = 'desc';

    public function __construct()
    {
        parent::__construct(new Pesanan());
    }

    /** Halaman detail juga memuat jejak proses (riwayat) beserta pelakunya. */
    public function find(int|string $id): Model
    {
        return $this->query()->with('riwayat.user')->findOrFail($id);
    }

    /** Cari berdasarkan nomor pesanan atau nama pelanggan. */
    protected function applySearch(Builder $query, ?string $search): Builder
    {
        $search = trim((string) $search);

        if ($search === '') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($search) {
            $q->where('no_pesanan', 'ilike', "%{$search}%")
                ->orWhereHas('pelanggan', fn (Builder $p) => $p->where('nama', 'ilike', "%{$search}%"));
        });
    }

    public function paginateByStatus(string $status, ?string $search = null, int $perPage = 10, bool $terlamaDulu = false): LengthAwarePaginator
    {
        return $this->applySearch($this->query()->where('status', $status), $search)
            ->orderBy('id', $terlamaDulu ? 'asc' : 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function nomorBerikutnya(string $tanggal): string
    {
        $prefix = 'PSN-'.date('Ymd', strtotime($tanggal)).'-';

        $terakhir = Pesanan::where('no_pesanan', 'like', $prefix.'%')->max('no_pesanan');
        $urut = $terakhir ? ((int) substr($terakhir, -3)) + 1 : 1;

        return $prefix.str_pad((string) $urut, 3, '0', STR_PAD_LEFT);
    }

    public function createWithDetail(array $header, array $items, ?CarbonInterface $waktu = null): Pesanan
    {
        return DB::transaction(function () use ($header, $items, $waktu) {
            $header['no_pesanan'] = $this->nomorBerikutnya($header['tanggal']);

            $pesanan = Pesanan::create($header);
            $pesanan->detail()->createMany($items);

            $this->catatRiwayat($pesanan, 'baru', (int) $header['dibuat_oleh'], $waktu);

            return $pesanan;
        });
    }

    public function updateWithDetail(int|string $id, array $header, array $items): Pesanan
    {
        return DB::transaction(function () use ($id, $header, $items) {
            $pesanan = Pesanan::lockForUpdate()->findOrFail($id);

            if ($pesanan->status !== 'baru') {
                throw new AlurPesananException("Pesanan {$pesanan->no_pesanan} berstatus {$pesanan->status} sehingga tidak dapat diubah. Hanya pesanan berstatus baru yang boleh diubah.");
            }

            $pesanan->update($header);
            $pesanan->detail()->delete();
            $pesanan->detail()->createMany($items);

            return $pesanan;
        });
    }

    public function majukan(int|string $id, string $statusBaru, int $userId, array $data = [], ?CarbonInterface $waktu = null): Pesanan
    {
        return DB::transaction(function () use ($id, $statusBaru, $userId, $data, $waktu) {
            $pesanan = Pesanan::lockForUpdate()->findOrFail($id);

            $alur = Pesanan::ALUR_STATUS;
            $posisi = array_search($pesanan->status, $alur, true);

            // Hanya boleh pindah ke status tepat sesudahnya.
            if ($posisi === false || ($alur[$posisi + 1] ?? null) !== $statusBaru) {
                throw new AlurPesananException(
                    "Pesanan {$pesanan->no_pesanan} berstatus {$pesanan->status} sehingga tidak dapat diubah menjadi {$statusBaru}. Status hanya boleh maju satu langkah sesuai urutan."
                );
            }

            $pesanan->update(['status' => $statusBaru] + $data);
            $this->catatRiwayat($pesanan, $statusBaru, $userId, $waktu);

            return $pesanan;
        });
    }

    public function batalkan(int|string $id, int $userId, ?CarbonInterface $waktu = null): Pesanan
    {
        return DB::transaction(function () use ($id, $userId, $waktu) {
            $pesanan = Pesanan::lockForUpdate()->findOrFail($id);

            if ($pesanan->status !== 'baru') {
                throw new AlurPesananException("Pesanan {$pesanan->no_pesanan} berstatus {$pesanan->status} sehingga tidak dapat dibatalkan. Hanya pesanan berstatus baru yang boleh dibatalkan.");
            }

            $pesanan->update(['status' => 'batal']);
            $this->catatRiwayat($pesanan, 'batal', $userId, $waktu);

            return $pesanan;
        });
    }

    public function jumlahBelumDikirim(): int
    {
        return Pesanan::whereIn('status', ['baru', 'diambil', 'dikemas'])->count();
    }

    public function hitungPerStatus(): array
    {
        return Pesanan::query()
            ->select('status', DB::raw('count(*) as jumlah'))
            ->groupBy('status')
            ->pluck('jumlah', 'status')
            ->map(fn ($n) => (int) $n)
            ->all();
    }

    public function terbaru(int $limit = 5): Collection
    {
        return $this->query()->orderByDesc('id')->limit($limit)->get();
    }

    private function catatRiwayat(Pesanan $pesanan, string $status, int $userId, ?CarbonInterface $waktu): void
    {
        RiwayatPesanan::create([
            'pesanan_id' => $pesanan->id,
            'status' => $status,
            'user_id' => $userId,
            'waktu' => $waktu ?? now(),
        ]);
    }
}
