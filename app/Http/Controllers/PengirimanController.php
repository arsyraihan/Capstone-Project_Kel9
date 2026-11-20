<?php

namespace App\Http\Controllers;

use App\Exceptions\AlurPesananException;
use App\Http\Requests\PengirimanRequest;
use App\Repositories\Interfaces\PesananRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengirimanController extends Controller
{
    public function __construct(private PesananRepositoryInterface $pesanan)
    {
    }

    /** Dua tab: `dikemas` (siap dikirim) dan `dikirim` (menunggu ditandai selesai). */
    public function index(Request $request): Response
    {
        $tab = $request->query('tab') === 'dikirim' ? 'dikirim' : 'dikemas';

        return Inertia::render('Pengiriman/Index', [
            'tab' => $tab,
            'pesanan' => $this->pesanan->paginateByStatus($tab, $request->query('search'), 10, true),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    /** "Kirim": isi ekspedisi dan nomor resi, status menjadi `dikirim`. */
    public function kirim(PengirimanRequest $request, string $pesanan): RedirectResponse
    {
        try {
            $data = $this->pesanan->majukan($pesanan, 'dikirim', $request->user()->id, $request->validated() + ['tanggal_kirim' => now()->toDateString()]);
        } catch (AlurPesananException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Pesanan {$data->no_pesanan} dikirim lewat {$data->ekspedisi} (resi {$data->no_resi}).");
    }

    /** "Tandai Selesai": status menjadi `selesai`. */
    public function selesai(Request $request, string $pesanan): RedirectResponse
    {
        try {
            $data = $this->pesanan->majukan($pesanan, 'selesai', $request->user()->id);
        } catch (AlurPesananException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Pesanan {$data->no_pesanan} ditandai selesai.");
    }

    /** Halaman cetak Surat Jalan (hanya untuk pesanan yang sudah dikemas atau sesudahnya). */
    public function suratJalan(string $pesanan): Response|RedirectResponse
    {
        $data = $this->pesanan->find($pesanan);

        if (! in_array($data->status, ['dikemas', 'dikirim', 'selesai'], true)) {
            return redirect()->route('pengiriman.index')->with('error', 'Surat Jalan hanya tersedia untuk pesanan yang sudah dikemas.');
        }

        return Inertia::render('Pengiriman/SuratJalan', ['pesanan' => $data]);
    }
}
