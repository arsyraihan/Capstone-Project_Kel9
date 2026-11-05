<?php

namespace App\Http\Controllers;

use App\Http\Requests\RakRequest;
use App\Repositories\Interfaces\RakRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RakController extends Controller
{
    public function __construct(private RakRepositoryInterface $rak)
    {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Rak/Index', [
            'rak' => $this->rak->paginate($request->query('search')),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Rak/Form', ['rak' => null]);
    }

    public function store(RakRequest $request): RedirectResponse
    {
        $this->rak->create($request->validated());

        return redirect()->route('rak.index')->with('success', 'Rak berhasil ditambahkan.');
    }

    public function edit(string $rak): Response
    {
        return Inertia::render('Rak/Form', ['rak' => $this->rak->find($rak)]);
    }

    public function update(RakRequest $request, string $rak): RedirectResponse
    {
        $this->rak->update($rak, $request->validated());

        return redirect()->route('rak.index')->with('success', 'Rak berhasil diperbarui.');
    }

    public function destroy(string $rak): RedirectResponse
    {
        if ($this->rak->isDipakai($rak)) {
            return back()->with('error', 'Rak tidak dapat dihapus karena masih digunakan oleh barang.');
        }

        $this->rak->delete($rak);

        return redirect()->route('rak.index')->with('success', 'Rak berhasil dihapus.');
    }
}
