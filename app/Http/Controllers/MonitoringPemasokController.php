<?php

namespace App\Http\Controllers;

use App\Repositories\Interfaces\KeuanganRepositoryInterface;
use Inertia\Inertia;
use Inertia\Response;

class MonitoringPemasokController extends Controller
{
    public function __construct(private KeuanganRepositoryInterface $keuangan)
    {
    }

    /** Pengawasan pasokan: yang dipesan dibandingkan yang benar-benar datang. */
    public function index(): Response
    {
        return Inertia::render('MonitoringPemasok/Index', [
            'pemasok' => $this->keuangan->pemenuhanPemasok(),
            'kurangKirim' => $this->keuangan->poKurangKirim(10),
            'belumDatang' => $this->keuangan->poBelumDatang(),
        ]);
    }
}
