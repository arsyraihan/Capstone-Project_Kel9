<?php

namespace App\Http\Controllers;

use App\Http\Requests\PelangganRequest;
use App\Repositories\Interfaces\PelangganRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PelangganController extends Controller
{
    public function __construct(private PelangganRepositoryInterface $pelanggan)
    {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Pelanggan/Index', [
            'pelanggan' => $this->pelanggan->paginate($request->query('search')),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Pelanggan/Form', ['pelanggan' => null]);
    }

    public function store(PelangganRequest $request): RedirectResponse
    {
        $this->pelanggan->create($request->validated());

        return redirect()->route('pelanggan.index')->with('success', 'Pelanggan berhasil ditambahkan.');
    }

    public function edit(string $pelanggan): Response
    {
        return Inertia::render('Pelanggan/Form', ['pelanggan' => $this->pelanggan->find($pelanggan)]);
    }

    public function update(PelangganRequest $request, string $pelanggan): RedirectResponse
    {
        $this->pelanggan->update($pelanggan, $request->validated());

        return redirect()->route('pelanggan.index')->with('success', 'Pelanggan berhasil diperbarui.');
    }

    public function destroy(string $pelanggan): RedirectResponse
    {
        if ($this->pelanggan->isDipakai($pelanggan)) {
            return back()->with('error', 'Pelanggan tidak dapat dihapus karena sudah digunakan pada pesanan.');
        }

        $this->pelanggan->delete($pelanggan);

        return redirect()->route('pelanggan.index')->with('success', 'Pelanggan berhasil dihapus.');
    }
}
