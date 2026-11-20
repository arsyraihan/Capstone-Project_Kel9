<?php

namespace App\Http\Controllers;

use App\Exceptions\AlurPesananException;
use App\Http\Requests\PengemasanRequest;
use App\Repositories\Interfaces\PesananRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengemasanController extends Controller
{
    public function __construct(private PesananRepositoryInterface $pesanan)
    {
    }

    /** Pesanan berstatus `diambil` yang menunggu dikemas. */
    public function index(Request $request): Response
    {
        return Inertia::render('Pengemasan/Index', [
            'pesanan' => $this->pesanan->paginateByStatus('diambil', $request->query('search'), 10, true),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    /** "Sudah Dikemas": isi jumlah koli, status menjadi `dikemas`. */
    public function store(PengemasanRequest $request, string $pesanan): RedirectResponse
    {
        try {
            $data = $this->pesanan->majukan($pesanan, 'dikemas', $request->user()->id, ['jumlah_koli' => $request->validated('jumlah_koli')]);
        } catch (AlurPesananException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Pesanan {$data->no_pesanan} sudah dikemas ({$data->jumlah_koli} koli).");
    }
}
