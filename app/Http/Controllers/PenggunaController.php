<?php

namespace App\Http\Controllers;

use App\Http\Requests\PenggunaRequest;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PenggunaController extends Controller
{
    public function __construct(private UserRepositoryInterface $users)
    {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Pengguna/Index', [
            'pengguna' => $this->users->paginate($request->query('search')),
            'filters' => ['search' => $request->query('search', '')],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Pengguna/Form', ['pengguna' => null]);
    }

    public function store(PenggunaRequest $request): RedirectResponse
    {
        $this->users->create($request->validated());

        return redirect()->route('pengguna.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function edit(string $pengguna): Response
    {
        return Inertia::render('Pengguna/Form', ['pengguna' => $this->users->find($pengguna)]);
    }

    public function update(PenggunaRequest $request, string $pengguna): RedirectResponse
    {
        $data = $request->validated();

        // Password kosong = tidak diganti.
        if (empty($data['password'])) {
            unset($data['password']);
        }

        // Admin tidak boleh menurunkan role dirinya sendiri (agar tidak terkunci).
        if ((int) $pengguna === $request->user()->id) {
            $data['role'] = $request->user()->role;
        }

        $this->users->update($pengguna, $data);

        return redirect()->route('pengguna.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(Request $request, string $pengguna): RedirectResponse
    {
        if ((int) $pengguna === $request->user()->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan.');
        }

        if ($this->users->isDipakai($pengguna)) {
            return back()->with('error', 'Pengguna tidak dapat dihapus karena sudah tercatat pada transaksi.');
        }

        $this->users->delete($pengguna);

        return redirect()->route('pengguna.index')->with('success', 'Pengguna berhasil dihapus.');
    }
}
