<?php

namespace App\Http\Controllers;

use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\MutasiStokRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StokController extends Controller
{
    public function __construct(
        private BarangRepositoryInterface $barang,
        private MutasiStokRepositoryInterface $mutasi,
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Stok/Index', [
            'barang' => $this->barang->paginateStok($request->query('search'), $request->query('kategori')),
            'kategori' => $this->barang->daftarKategori(),
            'filters' => [
                'search' => $request->query('search', ''),
                'kategori' => $request->query('kategori', ''),
            ],
        ]);
    }

    /** Kartu stok: riwayat mutasi satu barang. */
    public function kartu(string $barang): Response
    {
        return Inertia::render('Stok/Kartu', [
            'barang' => $this->barang->find($barang),
            'mutasi' => $this->mutasi->paginateByBarang($barang),
        ]);
    }
}
