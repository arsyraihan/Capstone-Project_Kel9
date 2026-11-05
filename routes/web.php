<?php

use App\Http\Controllers\BarangController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\PemasokController;
use App\Http\Controllers\PenerimaanController;
use App\Http\Controllers\PengadaanController;
use App\Http\Controllers\PengambilanController;
use App\Http\Controllers\PengemasanController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\PengirimanController;
use App\Http\Controllers\PenyimpananController;
use App\Http\Controllers\PesananController;
use App\Http\Controllers\RakController;
use App\Http\Controllers\StokController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware('auth')->group(function () {
    // Semua user yang login
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('stok', [StokController::class, 'index'])->name('stok.index');
    Route::get('stok/{barang}/kartu', [StokController::class, 'kartu'])->name('stok.kartu');

    // Khusus admin
    Route::middleware('role:admin')->group(function () {
        Route::resource('barang', BarangController::class)->except('show');
        Route::resource('pemasok', PemasokController::class)->except('show');
        Route::resource('pelanggan', PelangganController::class)->except('show');
        Route::resource('rak', RakController::class)->except('show');
        Route::resource('pengguna', PenggunaController::class)->except('show');
        Route::get('laporan', [LaporanController::class, 'index'])->name('laporan.index');
        Route::resource('pengadaan', PengadaanController::class);

        // Pesanan tidak dihapus; yang ada hanya "batal" (selama status masih baru).
        Route::resource('pesanan', PesananController::class)->except('destroy');
        Route::post('pesanan/{id}/batal', [PesananController::class, 'batal'])->name('pesanan.batal');
    });

    // Admin dan petugas gudang
    Route::middleware('role:admin,petugas')->group(function () {
        Route::get('penerimaan', [PenerimaanController::class, 'index'])->name('penerimaan.index');
        Route::get('penerimaan/{id}', [PenerimaanController::class, 'show'])->name('penerimaan.show');
        Route::post('penerimaan/{id}', [PenerimaanController::class, 'store'])->name('penerimaan.store');

        Route::get('penyimpanan', [PenyimpananController::class, 'index'])->name('penyimpanan.index');
        Route::patch('penyimpanan/{barang}', [PenyimpananController::class, 'update'])->name('penyimpanan.update');

        Route::get('pengambilan', [PengambilanController::class, 'index'])->name('pengambilan.index');
        Route::post('pengambilan/{pesanan}', [PengambilanController::class, 'store'])->name('pengambilan.store');

        Route::get('pengemasan', [PengemasanController::class, 'index'])->name('pengemasan.index');
        Route::post('pengemasan/{pesanan}', [PengemasanController::class, 'store'])->name('pengemasan.store');

        Route::get('pengiriman', [PengirimanController::class, 'index'])->name('pengiriman.index');
        Route::post('pengiriman/{pesanan}/kirim', [PengirimanController::class, 'kirim'])->name('pengiriman.kirim');
        Route::post('pengiriman/{pesanan}/selesai', [PengirimanController::class, 'selesai'])->name('pengiriman.selesai');
        Route::get('pengiriman/{pesanan}/surat-jalan', [PengirimanController::class, 'suratJalan'])->name('pengiriman.surat-jalan');
    });
});

require __DIR__.'/auth.php';
