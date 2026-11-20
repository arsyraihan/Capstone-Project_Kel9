<?php

namespace App\Http\Controllers;

use App\Exceptions\AlurPesananException;
use App\Http\Requests\PesananRequest;
use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\PelangganRepositoryInterface;
use App\Repositories\Interfaces\PesananRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    private const STATUS = ['baru', 'diambil', 'dikemas', 'dikirim', 'selesai', 'batal'];

    public function __construct(
        private PesananRepositoryInterface $pesanan,
        private PelangganRepositoryInterface $pelanggan,
        private BarangRepositoryInterface $barang,
    ) {
    }

    public function index(Request $request): Response
    {
        $status = in_array($request->query('status'), self::STATUS, true) ? $request->query('status') : null;

        return Inertia::render('Pesanan/Index', [
            'pesanan' => $status
                ? $this->pesanan->paginateByStatus($status, $request->query('search'))
                : $this->pesanan->paginate($request->query('search')),
            'daftarStatus' => self::STATUS,
            'filters' => ['search' => $request->query('search', ''), 'status' => $status ?? ''],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Pesanan/Form', [
            'pesanan' => null,
            'pelanggan' => $this->pelanggan->all(),
            'barang' => $this->barang->all(),
            'hariIni' => now()->toDateString(),
        ]);
    }

    public function store(PesananRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $pesanan = $this->pesanan->createWithDetail(
            $data + ['status' => 'baru', 'dibuat_oleh' => $request->user()->id],
            $items
        );

        return redirect()->route('pesanan.index')->with('success', "Pesanan {$pesanan->no_pesanan} berhasil dibuat.");
    }

    public function show(string $pesanan): Response
    {
        return Inertia::render('Pesanan/Show', ['pesanan' => $this->pesanan->find($pesanan)]);
    }

    public function edit(string $pesanan): Response|RedirectResponse
    {
        $data = $this->pesanan->find($pesanan);

        if ($data->status !== 'baru') {
            return redirect()->route('pesanan.index')->with('error', 'Hanya pesanan berstatus baru yang dapat diubah.');
        }

        return Inertia::render('Pesanan/Form', [
            'pesanan' => $data,
            'pelanggan' => $this->pelanggan->all(),
            'barang' => $this->barang->all(),
            'hariIni' => now()->toDateString(),
        ]);
    }

    public function update(PesananRequest $request, string $pesanan): RedirectResponse
    {
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        try {
            $this->pesanan->updateWithDetail($pesanan, $data, $items);
        } catch (AlurPesananException $e) {
            return redirect()->route('pesanan.index')->with('error', $e->getMessage());
        }

        return redirect()->route('pesanan.index')->with('success', 'Pesanan berhasil diperbarui.');
    }

    public function batal(Request $request, string $id): RedirectResponse
    {
        try {
            $pesanan = $this->pesanan->batalkan($id, $request->user()->id);
        } catch (AlurPesananException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('pesanan.index')->with('success', "Pesanan {$pesanan->no_pesanan} berhasil dibatalkan.");
    }
}
