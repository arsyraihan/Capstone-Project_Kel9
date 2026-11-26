<?php

namespace App\Http\Controllers;

use App\Exceptions\KeuanganException;
use App\Http\Requests\PembayaranRequest;
use App\Repositories\Interfaces\KeuanganRepositoryInterface;
use App\Services\KeuanganService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KeuanganController extends Controller
{
    private const STATUS = ['belum', 'jatuh_tempo', 'lunas'];

    public function __construct(
        private KeuanganRepositoryInterface $keuangan,
        private KeuanganService $service,
    ) {
    }

    public function hutang(Request $request): Response
    {
        $status = $this->status($request);

        return Inertia::render('Keuangan/Hutang', [
            'pembelian' => $this->keuangan->paginateHutang($status, $request->query('search')),
            'filters' => ['search' => $request->query('search', ''), 'status' => $status],
            'hariIni' => now()->toDateString(),
        ]);
    }

    public function piutang(Request $request): Response
    {
        $status = $this->status($request);

        return Inertia::render('Keuangan/Piutang', [
            'pesanan' => $this->keuangan->paginatePiutang($status, $request->query('search')),
            'umur' => $this->keuangan->umurPiutang(),
            'filters' => ['search' => $request->query('search', ''), 'status' => $status],
            'hariIni' => now()->toDateString(),
        ]);
    }

    public function kas(Request $request): Response
    {
        $input = $request->validate([
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date', 'after_or_equal:dari'],
        ], [], ['dari' => 'Tanggal awal', 'sampai' => 'Tanggal akhir']);

        $dari = $input['dari'] ?? now()->startOfMonth()->toDateString();
        $sampai = $input['sampai'] ?? now()->toDateString();

        return Inertia::render('Keuangan/Kas', [
            'mutasi' => $this->keuangan->mutasiKas($dari, $sampai),
            'saldoAwal' => $this->keuangan->saldoSebelum($dari),
            'filters' => ['dari' => $dari, 'sampai' => $sampai],
        ]);
    }

    public function bayar(string $jenis, string $id): Response|RedirectResponse
    {
        try {
            $tagihan = $this->service->tagihan($jenis, $id);
        } catch (KeuanganException $e) {
            return redirect()->route('dashboard')->with('error', $e->getMessage());
        }

        $dokumen = $tagihan['dokumen'];
        $dokumen->load(['pembayaran.user', $jenis === 'piutang' ? 'pelanggan' : 'pemasok']);

        return Inertia::render('Keuangan/Bayar', [
            'jenis' => $jenis,
            'tagihan' => [
                'id' => $dokumen->id,
                'nomor' => $tagihan['nomor'],
                'pihak' => $jenis === 'piutang' ? $dokumen->pelanggan->nama : $dokumen->pemasok->nama,
                'jatuh_tempo' => $dokumen->jatuh_tempo?->toDateString(),
                'total' => $tagihan['total'],
                'dibayar' => $tagihan['dibayar'],
                'sisa' => $tagihan['sisa'],
            ],
            'riwayat' => $dokumen->pembayaran,
            'hariIni' => now()->toDateString(),
        ]);
    }

    public function simpanBayar(PembayaranRequest $request, string $jenis, string $id): RedirectResponse
    {
        $data = $request->validated();

        try {
            $bukti = $this->service->bayar($jenis, $id, (float) $data['jumlah'], $data['tanggal'], $data['metode'], $data['keterangan'] ?? null, $request->user()->id);
        } catch (KeuanganException $e) {
            return back()->withErrors(['jumlah' => $e->getMessage()])->with('error', $e->getMessage());
        }

        return redirect()->route('keuangan.bayar', [$jenis, $id])->with('success', "Pembayaran dicatat dengan bukti {$bukti->no_bukti}.");
    }

    private function status(Request $request): string
    {
        return in_array($request->query('status'), self::STATUS, true) ? $request->query('status') : '';
    }
}
