<?php

namespace App\Http\Controllers;

use App\Exceptions\StokException;
use App\Repositories\Interfaces\PesananRepositoryInterface;
use App\Services\StokService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengambilanController extends Controller
{
    public function __construct(
        private PesananRepositoryInterface $pesanan,
        private StokService $stok,
    ) {
    }

    /** Pesanan berstatus `baru` beserta daftar item dan lokasi rak, terlama dulu. */
    public function index(Request $request): Response
    {
        return Inertia::render('Pengambilan/Index', [
            'pesanan' => $this->pesanan->paginateByStatus('baru', $request->query('search'), 10, true),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    /** "Sudah Diambil": stok dicek, dikurangi, mutasi dicatat, status menjadi `diambil`. */
    public function store(Request $request, string $pesanan): RedirectResponse
    {
        $data = $this->pesanan->find($pesanan);

        try {
            $this->stok->ambilPesanan($data, $request->user()->id);
        } catch (StokException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Pesanan {$data->no_pesanan} sudah diambil. Stok telah dikurangi.");
    }
}
