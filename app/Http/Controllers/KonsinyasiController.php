<?php

namespace App\Http\Controllers;

use App\Exceptions\KeuanganException;
use App\Exceptions\StokException;
use App\Http\Requests\PenyelesaianKonsinyasiRequest;
use App\Http\Requests\ReturKonsinyasiRequest;
use App\Models\PenyelesaianKonsinyasi;
use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\KeuanganRepositoryInterface;
use App\Repositories\Interfaces\MutasiStokRepositoryInterface;
use App\Services\KeuanganService;
use App\Services\StokService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KonsinyasiController extends Controller
{
    public function __construct(
        private KeuanganRepositoryInterface $keuangan,
        private KeuanganService $service,
        private BarangRepositoryInterface $barang,
        private MutasiStokRepositoryInterface $mutasi,
        private StokService $stok,
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Konsinyasi/Index', [
            'pemasok' => $this->keuangan->rekapKonsinyasi(),
            'penyelesaian' => $this->keuangan->paginatePenyelesaian($request->query('search')),
            'filters' => ['search' => $request->query('search', '')],
            'hariIni' => now()->toDateString(),
        ]);
    }

    public function store(PenyelesaianKonsinyasiRequest $request): RedirectResponse
    {
        try {
            $hasil = $this->service->buatPenyelesaian((int) $request->validated('pemasok_id'), $request->validated('periode_akhir'), $request->user()->id);
        } catch (KeuanganException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('konsinyasi.show', $hasil->id)->with('success', "Penyelesaian {$hasil->no_penyelesaian} berhasil dibuat.");
    }

    public function show(string $id): Response
    {
        $data = PenyelesaianKonsinyasi::with(['pemasok', 'detail.barang', 'pembayaran.user', 'pembuat'])->findOrFail($id);

        return Inertia::render('Konsinyasi/Show', ['penyelesaian' => $data, 'hariIni' => now()->toDateString()]);
    }

    public function retur(): Response
    {
        return Inertia::render('Konsinyasi/Retur', [
            'barang' => $this->barang->konsinyasiBerstok(),
            'riwayat' => $this->mutasi->returTerbaru(10),
        ]);
    }

    public function simpanRetur(ReturKonsinyasiRequest $request): RedirectResponse
    {
        $data = $request->validated();

        try {
            $nomor = $this->stok->returKonsinyasi((int) $data['barang_id'], (int) $data['jumlah'], $request->user()->id, $data['keterangan'] ?? null);
        } catch (StokException $e) {
            return back()->withErrors(['jumlah' => $e->getMessage()])->with('error', $e->getMessage());
        }

        return redirect()->route('konsinyasi.retur')->with('success', "Retur {$nomor} dicatat. Stok telah dikurangi.");
    }
}
