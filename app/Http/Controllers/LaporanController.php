<?php

namespace App\Http\Controllers;

use App\Http\Requests\LaporanRequest;
use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\MutasiStokRepositoryInterface;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    public function __construct(
        private BarangRepositoryInterface $barang,
        private MutasiStokRepositoryInterface $mutasi,
    ) {
    }

    /** Tiga laporan dalam satu halaman (tab): Stok, Barang Masuk, Barang Keluar. */
    public function index(LaporanRequest $request): Response
    {
        $tab = $request->validated('tab') ?? 'stok';
        $dari = $request->validated('dari');
        $sampai = $request->validated('sampai');

        return Inertia::render('Laporan/Index', [
            'tab' => $tab,
            'dari' => $dari ?? '',
            'sampai' => $sampai ?? '',
            // Laporan stok = posisi stok saat ini (tidak terpengaruh filter tanggal).
            'barang' => $tab === 'stok' ? $this->barang->all() : null,
            'mutasi' => $tab === 'stok' ? null : $this->mutasi->laporan($tab === 'masuk' ? 'masuk' : 'keluar', $dari, $sampai),
            'dicetakPada' => now()->format('d/m/Y H:i'),
        ]);
    }
}
