<?php

namespace App\Http\Controllers;

use App\Exceptions\StokException;
use App\Http\Requests\PenerimaanRequest;
use App\Repositories\Interfaces\PembelianRepositoryInterface;
use App\Services\StokService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PenerimaanController extends Controller
{
    public function __construct(
        private PembelianRepositoryInterface $pembelian,
        private StokService $stok,
    ) {
    }

    /** Daftar PO berstatus `dipesan` yang menunggu barang. */
    public function index(Request $request): Response
    {
        return Inertia::render('Penerimaan/Index', [
            'pembelian' => $this->pembelian->paginateByStatus('dipesan', $request->query('search')),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    public function show(string $id): Response|RedirectResponse
    {
        $po = $this->pembelian->find($id);

        if ($po->status !== 'dipesan') {
            return redirect()->route('penerimaan.index')->with('error', "PO {$po->no_po} sudah diterima.");
        }

        return Inertia::render('Penerimaan/Form', ['pembelian' => $po]);
    }

    public function store(PenerimaanRequest $request, string $id): RedirectResponse
    {
        $po = $this->pembelian->find($id);

        try {
            $this->stok->terimaPembelian($po, $request->user()->id, $request->validated('keterangan'));
        } catch (StokException $e) {
            return redirect()->route('penerimaan.index')->with('error', $e->getMessage());
        }

        return redirect()->route('penerimaan.index')
            ->with('success', "Barang dari PO {$po->no_po} berhasil diterima. Stok telah diperbarui.");
    }
}
