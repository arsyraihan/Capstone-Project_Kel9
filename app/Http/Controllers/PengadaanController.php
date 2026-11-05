<?php

namespace App\Http\Controllers;

use App\Http\Requests\PembelianRequest;
use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\PembelianRepositoryInterface;
use App\Repositories\Interfaces\PemasokRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengadaanController extends Controller
{
    public function __construct(
        private PembelianRepositoryInterface $pembelian,
        private PemasokRepositoryInterface $pemasok,
        private BarangRepositoryInterface $barang,
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Pengadaan/Index', [
            'pembelian' => $this->pembelian->paginate($request->query('search')),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Pengadaan/Form', [
            'pembelian' => null,
            'pemasok' => $this->pemasok->all(),
            'barang' => $this->barang->all(),
            'hariIni' => now()->toDateString(),
        ]);
    }

    public function store(PembelianRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $po = $this->pembelian->createWithDetail(
            $data + ['status' => 'dipesan', 'dibuat_oleh' => $request->user()->id],
            $items
        );

        return redirect()->route('pengadaan.index')->with('success', "Purchase Order {$po->no_po} berhasil dibuat.");
    }

    public function show(string $pengadaan): Response
    {
        return Inertia::render('Pengadaan/Show', ['pembelian' => $this->pembelian->find($pengadaan)]);
    }

    public function edit(string $pengadaan): Response|RedirectResponse
    {
        $po = $this->pembelian->find($pengadaan);

        if ($po->status !== 'dipesan') {
            return redirect()->route('pengadaan.index')->with('error', 'PO yang sudah diterima tidak dapat diubah.');
        }

        return Inertia::render('Pengadaan/Form', [
            'pembelian' => $po,
            'pemasok' => $this->pemasok->all(),
            'barang' => $this->barang->all(),
            'hariIni' => now()->toDateString(),
        ]);
    }

    public function update(PembelianRequest $request, string $pengadaan): RedirectResponse
    {
        if ($this->pembelian->find($pengadaan)->status !== 'dipesan') {
            return redirect()->route('pengadaan.index')->with('error', 'PO yang sudah diterima tidak dapat diubah.');
        }

        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $this->pembelian->updateWithDetail($pengadaan, $data, $items);

        return redirect()->route('pengadaan.index')->with('success', 'Purchase Order berhasil diperbarui.');
    }

    public function destroy(string $pengadaan): RedirectResponse
    {
        $po = $this->pembelian->find($pengadaan);

        if ($po->status !== 'dipesan') {
            return redirect()->route('pengadaan.index')->with('error', 'PO yang sudah diterima tidak dapat dihapus.');
        }

        $this->pembelian->delete($pengadaan);

        return redirect()->route('pengadaan.index')->with('success', "Purchase Order {$po->no_po} berhasil dihapus.");
    }
}
