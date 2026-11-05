<?php

namespace App\Http\Controllers;

use App\Http\Requests\BarangRequest;
use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\RakRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BarangController extends Controller
{
    public function __construct(
        private BarangRepositoryInterface $barang,
        private RakRepositoryInterface $rak,
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Barang/Index', [
            'barang' => $this->barang->paginate($request->query('search')),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Barang/Form', [
            'barang' => null,
            'rak' => $this->rak->all(),
            'kategori' => $this->barang->daftarKategori(),
        ]);
    }

    public function store(BarangRequest $request): RedirectResponse
    {
        // Stok awal selalu 0; stok berubah hanya lewat transaksi.
        $this->barang->create($request->validated() + ['stok' => 0]);

        return redirect()->route('barang.index')->with('success', 'Barang berhasil ditambahkan.');
    }

    public function edit(string $barang): Response
    {
        return Inertia::render('Barang/Form', [
            'barang' => $this->barang->find($barang),
            'rak' => $this->rak->all(),
            'kategori' => $this->barang->daftarKategori(),
        ]);
    }

    public function update(BarangRequest $request, string $barang): RedirectResponse
    {
        $this->barang->update($barang, $request->validated());

        return redirect()->route('barang.index')->with('success', 'Barang berhasil diperbarui.');
    }

    public function destroy(string $barang): RedirectResponse
    {
        if ($this->barang->isDipakai($barang)) {
            return back()->with('error', 'Barang tidak dapat dihapus karena sudah digunakan pada transaksi.');
        }

        $this->barang->delete($barang);

        return redirect()->route('barang.index')->with('success', 'Barang berhasil dihapus.');
    }
}
