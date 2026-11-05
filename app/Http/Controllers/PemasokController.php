<?php

namespace App\Http\Controllers;

use App\Http\Requests\PemasokRequest;
use App\Repositories\Interfaces\PemasokRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PemasokController extends Controller
{
    public function __construct(private PemasokRepositoryInterface $pemasok)
    {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Pemasok/Index', [
            'pemasok' => $this->pemasok->paginate($request->query('search')),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Pemasok/Form', ['pemasok' => null]);
    }

    public function store(PemasokRequest $request): RedirectResponse
    {
        $this->pemasok->create($request->validated());

        return redirect()->route('pemasok.index')->with('success', 'Pemasok berhasil ditambahkan.');
    }

    public function edit(string $pemasok): Response
    {
        return Inertia::render('Pemasok/Form', ['pemasok' => $this->pemasok->find($pemasok)]);
    }

    public function update(PemasokRequest $request, string $pemasok): RedirectResponse
    {
        $this->pemasok->update($pemasok, $request->validated());

        return redirect()->route('pemasok.index')->with('success', 'Pemasok berhasil diperbarui.');
    }

    public function destroy(string $pemasok): RedirectResponse
    {
        if ($this->pemasok->isDipakai($pemasok)) {
            return back()->with('error', 'Pemasok tidak dapat dihapus karena sudah digunakan pada Purchase Order.');
        }

        $this->pemasok->delete($pemasok);

        return redirect()->route('pemasok.index')->with('success', 'Pemasok berhasil dihapus.');
    }
}
