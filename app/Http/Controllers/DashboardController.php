<?php

namespace App\Http\Controllers;

use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\MutasiStokRepositoryInterface;
use App\Repositories\Interfaces\PesananRepositoryInterface;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private BarangRepositoryInterface $barang,
        private PesananRepositoryInterface $pesanan,
        private MutasiStokRepositoryInterface $mutasi,
    ) {
    }

    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'ringkasan' => $this->barang->ringkasan() + [
                'pesanan_belum_dikirim' => $this->pesanan->jumlahBelumDikirim(),
            ],
            'grafik' => $this->mutasi->rekapBulanan(6),
            'stokMinimum' => $this->barang->getStokMinimum(5),
            'pesananTerbaru' => $this->pesanan->terbaru(5),
        ]);
    }
}
