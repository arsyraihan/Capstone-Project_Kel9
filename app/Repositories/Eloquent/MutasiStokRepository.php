<?php

namespace App\Repositories\Eloquent;

use App\Models\MutasiStok;
use App\Repositories\Interfaces\MutasiStokRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MutasiStokRepository extends BaseRepository implements MutasiStokRepositoryInterface
{
    private const NAMA_BULAN = [1 => 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

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

    public function rekapBulanan(int $jumlahBulan = 6): array
    {
        $mulai = now()->startOfMonth()->subMonthsNoOverflow($jumlahBulan - 1);

        // Ambil mutasi sejak awal periode, lalu kelompokkan per bulan di PHP.
        $perBulan = MutasiStok::query()
            ->where('tanggal', '>=', $mulai)
            ->get(['tanggal', 'jenis', 'jumlah'])
            ->groupBy(fn (MutasiStok $m) => $m->tanggal->format('Y-m'));

        $hasil = [];
        for ($i = 0; $i < $jumlahBulan; $i++) {
            $bulan = $mulai->copy()->addMonthsNoOverflow($i);
            $baris = $perBulan->get($bulan->format('Y-m'), collect());

            $hasil[] = [
                'bulan' => self::NAMA_BULAN[$bulan->month].' '.$bulan->year,
                'masuk' => (int) $baris->where('jenis', 'masuk')->sum('jumlah'),
                'keluar' => (int) $baris->where('jenis', 'keluar')->sum('jumlah'),
            ];
        }

        return $hasil;
    }

    public function laporan(string $jenis, ?string $dari = null, ?string $sampai = null): Collection
    {
        $query = $this->query()->where('jenis', $jenis);

        if ($dari) {
            $query->where('tanggal', '>=', Carbon::parse($dari)->startOfDay());
        }

        if ($sampai) {
            $query->where('tanggal', '<=', Carbon::parse($sampai)->endOfDay());
        }

        return $query->orderBy('tanggal')->orderBy('id')->get();
    }

    public function returTerbaru(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return \App\Models\MutasiStok::with(['barang', 'user'])
            ->where('referensi', 'like', 'RTR-%')
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }
}
