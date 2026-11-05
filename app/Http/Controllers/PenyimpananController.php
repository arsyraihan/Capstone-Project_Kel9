<?php

namespace App\Http\Controllers;

use App\Http\Requests\PenyimpananRequest;
use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\RakRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PenyimpananController extends Controller
{
    public function __construct(
        private BarangRepositoryInterface $barang,
        private RakRepositoryInterface $rak,
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Penyimpanan/Index', [
            'barang' => $this->barang->paginate($request->query('search')),
            'rak' => $this->rak->all(),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    /** Pindahkan barang ke rak lain. */
    public function update(PenyimpananRequest $request, string $barang): RedirectResponse
    {
        $item = $this->barang->update($barang, ['rak_id' => $request->validated('rak_id')]);
        $item->load('rak');

        $lokasi = $item->rak?->kode_rak ?? 'belum ditempatkan';

        return back()->with('success', "Lokasi {$item->sku} diperbarui ke rak {$lokasi}.");
    }
}
