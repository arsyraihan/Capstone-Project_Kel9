<?php

namespace App\Repositories\Eloquent;

use App\Models\Barang;
use App\Models\DetailPesanan;
use App\Models\Pembayaran;
use App\Models\Pembelian;
use App\Models\Pemasok;
use App\Models\PenyelesaianKonsinyasi;
use App\Models\Pesanan;
use App\Repositories\Interfaces\KeuanganRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class KeuanganRepository implements KeuanganRepositoryInterface
{
    public function paginateHutang(string $status = '', ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->queryHutang()->with('pemasok');
        $this->saringStatus($query, 'pembelian', 'pembelian_id', $status);

        if ($search = trim((string) $search)) {
            $query->where(fn (Builder $q) => $q->where('no_po', 'ilike', "%{$search}%")
                ->orWhereHas('pemasok', fn (Builder $p) => $p->where('nama', 'ilike', "%{$search}%")));
        }

        return $query->orderBy('jatuh_tempo')->orderBy('id')->paginate($perPage)->withQueryString();
    }

    public function paginatePiutang(string $status = '', ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->queryPiutang()->with('pelanggan');
        $this->saringStatus($query, 'pesanan', 'pesanan_id', $status);

        if ($search = trim((string) $search)) {
            $query->where(fn (Builder $q) => $q->where('no_pesanan', 'ilike', "%{$search}%")
                ->orWhereHas('pelanggan', fn (Builder $p) => $p->where('nama', 'ilike', "%{$search}%")));
        }

        return $query->orderBy('jatuh_tempo')->orderBy('id')->paginate($perPage)->withQueryString();
    }

    public function paginatePenyelesaian(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = PenyelesaianKonsinyasi::query()->with('pemasok')->withSum('pembayaran as dibayar', 'jumlah');

        if ($search = trim((string) $search)) {
            $query->where(fn (Builder $q) => $q->where('no_penyelesaian', 'ilike', "%{$search}%")
                ->orWhereHas('pemasok', fn (Builder $p) => $p->where('nama', 'ilike', "%{$search}%")));
        }

        return $query->orderByDesc('periode_akhir')->orderByDesc('id')->paginate($perPage)->withQueryString();
    }

    public function mutasiKas(string $dari, string $sampai): Collection
    {
        return Pembayaran::query()
            ->with(['pesanan.pelanggan', 'pembelian.pemasok', 'penyelesaian.pemasok', 'user'])
            ->whereBetween('tanggal', [$dari, $sampai])
            ->orderBy('tanggal')
            ->orderBy('id')
            ->get();
    }

    public function saldoSebelum(string $tanggal): float
    {
        return $this->saldo(Pembayaran::query()->where('tanggal', '<', $tanggal));
    }

    public function rekapKasBulanan(int $bulan = 6): array
    {
        $awal = now()->startOfMonth()->subMonthsNoOverflow($bulan - 1);

        $data = Pembayaran::query()
            ->selectRaw("to_char(tanggal, 'YYYY-MM') as periode, arah, sum(jumlah) as total")
            ->where('jenis', '!=', 'saldo_awal')
            ->where('tanggal', '>=', $awal->toDateString())
            ->groupBy('periode', 'arah')
            ->toBase()
            ->get();

        return collect(range(0, $bulan - 1))->map(function (int $i) use ($awal, $data) {
            $b = $awal->copy()->addMonthsNoOverflow($i);
            $baris = $data->where('periode', $b->format('Y-m'));

            return [
                'bulan' => $b->locale('id')->translatedFormat('M Y'),
                'masuk' => (float) $baris->where('arah', 'masuk')->sum('total'),
                'keluar' => (float) $baris->where('arah', 'keluar')->sum('total'),
            ];
        })->all();
    }

    public function ringkasan(): array
    {
        $hariIni = now()->toDateString();
        $batas = now()->addDays(7)->toDateString();

        $hutangPo = $this->belumLunas($this->queryHutang()->get());
        $konsinyasi = $this->belumLunas(PenyelesaianKonsinyasi::query()->withSum('pembayaran as dibayar', 'jumlah')->get());
        $piutang = $this->belumLunas($this->queryPiutang()->get());
        $hutang = collect($hutangPo->all())->concat($konsinyasi->all()); // hutang usaha termasuk tagihan konsinyasi

        $jt = fn ($d) => $d->jatuh_tempo?->toDateString();
        $lewat = fn (Collection $c) => $c->filter(fn ($d) => $jt($d) !== null && $jt($d) < $hariIni);
        $segera = fn (Collection $c) => $c->filter(fn ($d) => $jt($d) !== null && $jt($d) >= $hariIni && $jt($d) <= $batas);
        $sisa = fn (Collection $c) => round($c->sum(fn ($d) => $d->total - (float) $d->dibayar), 2);

        $nilai = fn (string $jenis) => (float) Barang::query()->where('jenis_stok', $jenis)->sum(DB::raw('stok * harga_beli'));
        $bulanIni = fn (string $arah) => (float) Pembayaran::query()
            ->where('arah', $arah)
            ->where('jenis', '!=', 'saldo_awal')
            ->whereBetween('tanggal', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
            ->sum('jumlah');

        return [
            'nilai_persediaan' => $nilai('beli'),
            'nilai_titipan' => $nilai('konsinyasi'),
            'hutang_total' => $sisa($hutang),
            'hutang_lewat' => $sisa($lewat($hutang)),
            'hutang_segera' => $sisa($segera($hutang)),
            'piutang_total' => $sisa($piutang),
            'piutang_lewat' => $sisa($lewat($piutang)),
            'kas_masuk_bulan_ini' => $bulanIni('masuk'),
            'kas_keluar_bulan_ini' => $bulanIni('keluar'),
            'saldo_kas' => $this->saldo(Pembayaran::query()),
            // Jumlah dokumen untuk antrean tugas
            'jumlah_hutang_jatuh_tempo' => $lewat($hutangPo)->count() + $segera($hutangPo)->count(),
            'jumlah_konsinyasi_belum_lunas' => $konsinyasi->count(),
            'jumlah_piutang_lewat' => $lewat($piutang)->count(),
            'jumlah_po_belum_diterima' => Pembelian::where('status', 'dipesan')->count(),
        ];
    }

    public function umurPiutang(): array
    {
        $hariIni = Carbon::today();
        $kelompok = [
            ['label' => 'Belum jatuh tempo', 'min' => PHP_INT_MIN, 'max' => 0],
            ['label' => '1-30 hari', 'min' => 1, 'max' => 30],
            ['label' => '31-60 hari', 'min' => 31, 'max' => 60],
            ['label' => '> 60 hari', 'min' => 61, 'max' => PHP_INT_MAX],
        ];

        $piutang = $this->belumLunas($this->queryPiutang()->get())->map(fn (Pesanan $p) => [
            'terlambat' => $p->jatuh_tempo ? (int) $p->jatuh_tempo->diffInDays($hariIni, false) : 0,
            'sisa' => $p->total - (float) $p->dibayar,
        ]);

        return array_map(function (array $k) use ($piutang) {
            $isi = $piutang->filter(fn (array $p) => $p['terlambat'] >= $k['min'] && $p['terlambat'] <= $k['max']);

            return ['label' => $k['label'], 'jumlah' => $isi->count(), 'nilai' => round($isi->sum('sisa'), 2)];
        }, $kelompok);
    }

    public function pemenuhanPemasok(): array
    {
        $semuaPo = Pembelian::query()->with('detail')->get()->groupBy('pemasok_id');

        return Pemasok::query()->orderBy('kode_pemasok')->get()->map(function (Pemasok $pemasok) use ($semuaPo) {
            $po = collect($semuaPo->get($pemasok->id, []));
            $diterima = $po->where('status', 'diterima');
            $dipesanPo = $po->where('status', 'dipesan');

            $dipesan = (int) $diterima->sum(fn (Pembelian $p) => $p->detail->sum('jumlah'));
            // PO lama (sebelum pencatatan jumlah datang) dianggap diterima lengkap.
            $datang = (int) $diterima->sum(fn (Pembelian $p) => $p->detail->sum(fn ($d) => $d->jumlah_diterima ?? $d->jumlah));
            $lama = $diterima->filter(fn (Pembelian $p) => $p->tanggal_terima !== null)
                ->map(fn (Pembelian $p) => (int) $p->tanggal->diffInDays($p->tanggal_terima));

            return [
                'id' => $pemasok->id,
                'kode_pemasok' => $pemasok->kode_pemasok,
                'nama' => $pemasok->nama,
                'jumlah_po' => $po->count(),
                'po_belum_datang' => $dipesanPo->count(),
                'dipesan' => $dipesan,
                'diterima' => $datang,
                'persen' => $dipesan > 0 ? round($datang / $dipesan * 100, 1) : null,
                'po_kurang_kirim' => $diterima->filter(fn (Pembelian $p) => $this->kurang($p) > 0)->count(),
                'pcs_belum_datang' => (int) $dipesanPo->sum(fn (Pembelian $p) => $p->detail->sum('jumlah')),
                'rata_lama_kirim' => $lama->isEmpty() ? null : round($lama->avg(), 1),
            ];
        })->all();
    }

    public function poKurangKirim(int $limit = 10): array
    {
        return Pembelian::query()
            ->with(['pemasok', 'detail'])
            ->where('status', 'diterima')
            ->whereHas('detail', fn (Builder $q) => $q->whereColumn('jumlah_diterima', '<', 'jumlah'))
            ->orderByDesc('tanggal_terima')
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(fn (Pembelian $p) => [
                'id' => $p->id,
                'no_po' => $p->no_po,
                'pemasok' => $p->pemasok->nama,
                'tanggal_terima' => $p->tanggal_terima?->toDateString(),
                'dipesan' => (int) $p->detail->sum('jumlah'),
                'kurang' => $this->kurang($p),
            ])->all();
    }

    public function poBelumDatang(): Collection
    {
        return Pembelian::query()->with(['pemasok', 'detail'])->where('status', 'dipesan')->orderBy('tanggal')->orderBy('id')->get()->toBase();
    }

    public function rekapKonsinyasi(): array
    {
        $barang = Barang::query()->where('jenis_stok', 'konsinyasi')->whereNotNull('pemasok_id')->orderBy('sku')->get();
        $hariIni = now()->toDateString();

        return Pemasok::query()->whereIn('id', $barang->pluck('pemasok_id')->unique()->all())->orderBy('kode_pemasok')->get()
            ->map(function (Pemasok $pemasok) use ($barang, $hariIni) {
                $awal = $this->awalPeriodeBerikutnya($pemasok->id);
                $terjual = $awal ? $this->terjualKonsinyasi($pemasok->id, $awal, $hariIni) : collect();
                $perBarang = $terjual->keyBy('barang_id');

                return [
                    'id' => $pemasok->id,
                    'kode_pemasok' => $pemasok->kode_pemasok,
                    'nama' => $pemasok->nama,
                    'termin_hari' => $pemasok->termin_hari,
                    'periode_awal' => $awal,
                    'tagihan_berjalan' => (float) $terjual->sum('subtotal'),
                    'barang' => $barang->where('pemasok_id', $pemasok->id)->values()->map(fn (Barang $b) => [
                        'id' => $b->id,
                        'sku' => $b->sku,
                        'nama' => $b->nama,
                        'warna' => $b->warna,
                        'ukuran' => $b->ukuran,
                        'stok' => $b->stok,
                        'harga_titip' => $b->harga_beli,
                        'terjual' => $perBarang->get($b->id)['jumlah_terjual'] ?? 0,
                    ])->all(),
                ];
            })->all();
    }

    public function terjualKonsinyasi(int $pemasokId, string $dari, string $sampai): Collection
    {
        $jumlah = DetailPesanan::query()
            ->join('pesanan', 'pesanan.id', '=', 'detail_pesanan.pesanan_id')
            ->join('barang', 'barang.id', '=', 'detail_pesanan.barang_id')
            ->where('barang.jenis_stok', 'konsinyasi')
            ->where('barang.pemasok_id', $pemasokId)
            ->whereIn('pesanan.status', ['dikirim', 'selesai'])
            ->whereBetween('pesanan.tanggal_kirim', [$dari, $sampai])
            ->groupBy('detail_pesanan.barang_id')
            ->selectRaw('detail_pesanan.barang_id, sum(detail_pesanan.jumlah) as jumlah')
            ->toBase()
            ->pluck('jumlah', 'barang_id');

        return Barang::query()->whereIn('id', $jumlah->keys()->all())->orderBy('sku')->get()->toBase()->map(fn (Barang $b) => [
            'barang_id' => $b->id,
            'jumlah_terjual' => (int) $jumlah[$b->id],
            'harga_satuan' => $b->harga_beli,
            'subtotal' => round((int) $jumlah[$b->id] * $b->harga_beli, 2),
        ]);
    }

    public function awalPeriodeBerikutnya(int $pemasokId): ?string
    {
        $terakhir = PenyelesaianKonsinyasi::where('pemasok_id', $pemasokId)->max('periode_akhir');
        if ($terakhir) {
            return Carbon::parse($terakhir)->addDay()->toDateString();
        }

        $pertama = Pembelian::where('pemasok_id', $pemasokId)->where('cara_bayar', 'konsinyasi')->min('tanggal');

        return $pertama ? Carbon::parse($pertama)->toDateString() : null;
    }

    // ------------------------------------------------------------------ bantu

    /** PO beli putus yang sudah diterima (menimbulkan hutang). */
    private function queryHutang(): Builder
    {
        return Pembelian::query()
            ->where('status', 'diterima')
            ->where('cara_bayar', '!=', 'konsinyasi')
            ->where('total', '>', 0)
            ->withSum('pembayaran as dibayar', 'jumlah');
    }

    /** Pesanan yang sudah dikirim (menimbulkan piutang). */
    private function queryPiutang(): Builder
    {
        return Pesanan::query()
            ->whereIn('status', ['dikirim', 'selesai'])
            ->where('total', '>', 0)
            ->withSum('pembayaran as dibayar', 'jumlah');
    }

    private function saringStatus(Builder $query, string $tabel, string $kolom, string $status): void
    {
        if (! in_array($status, ['belum', 'jatuh_tempo', 'lunas'], true)) {
            return;
        }

        $dibayar = "(select coalesce(sum(jumlah), 0) from pembayaran where pembayaran.{$kolom} = {$tabel}.id)";

        if ($status === 'lunas') {
            $query->whereRaw("{$dibayar} >= {$tabel}.total");

            return;
        }

        $query->whereRaw("{$dibayar} < {$tabel}.total");
        $hariIni = now()->toDateString();

        if ($status === 'jatuh_tempo') {
            $query->where('jatuh_tempo', '<', $hariIni);
        } else {
            $query->where(fn (Builder $q) => $q->whereNull('jatuh_tempo')->orWhere('jatuh_tempo', '>=', $hariIni));
        }
    }

    private function belumLunas(Collection $dokumen): Collection
    {
        return $dokumen->filter(fn ($d) => round($d->total - (float) $d->dibayar, 2) > 0)->values();
    }

    private function saldo(Builder $query): float
    {
        return (float) $query->selectRaw("coalesce(sum(case when arah = 'masuk' then jumlah else -jumlah end), 0) as saldo")
            ->toBase()
            ->value('saldo');
    }

    /** Selisih (pcs) antara yang dipesan dan yang datang pada PO yang sudah diterima. */
    private function kurang(Pembelian $po): int
    {
        return (int) $po->detail->sum(fn ($d) => $d->jumlah - ($d->jumlah_diterima ?? $d->jumlah));
    }
}
