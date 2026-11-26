<?php

use App\Http\Controllers\BarangController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KeuanganController;
use App\Http\Controllers\KonsinyasiController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\MonitoringPemasokController;
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

/*
 * Peran:
 *   admin       - akun pengguna & master data
 *   pengadaan   - Staf Pengadaan & CO (PO ke pemasok, pesanan pelanggan)
 *   gudang      - Staf Gudang (penerimaan, penyimpanan)
 *   picker      - Packing (pengambilan barang)
 *   pengiriman  - Pengemasan & Pengiriman
 *   manajemen   - Manajemen (hutang, piutang, kas, konsinyasi, monitoring pemasok)
 */

Route::redirect('/', '/dashboard')->name('home');

Route::middleware('auth')->group(function () {
    // Semua user yang login
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('stok', [StokController::class, 'index'])->name('stok.index');
    Route::get('stok/{barang}/kartu', [StokController::class, 'kartu'])->name('stok.kartu');

    // Admin: master data dan akun pengguna
    Route::middleware('role:admin')->group(function () {
        Route::resource('barang', BarangController::class)->except('show');
        Route::resource('pemasok', PemasokController::class)->except('show');
        Route::resource('pelanggan', PelangganController::class)->except('show');
        Route::resource('rak', RakController::class)->except('show');
        Route::resource('pengguna', PenggunaController::class)->except('show');
    });

    // Laporan stok / barang masuk / barang keluar
    Route::get('laporan', [LaporanController::class, 'index'])
        ->middleware('role:admin,pengadaan,gudang,manajemen')
        ->name('laporan.index');

    // Pengawasan pasokan: dipesan vs diterima
    Route::get('monitoring-pemasok', [MonitoringPemasokController::class, 'index'])
        ->middleware('role:manajemen,admin,pengadaan')
        ->name('monitoring.index');

    // Keuangan: manajemen dan admin boleh melihat
    Route::middleware('role:manajemen,admin')->group(function () {
        Route::get('keuangan/hutang', [KeuanganController::class, 'hutang'])->name('keuangan.hutang');
        Route::get('keuangan/piutang', [KeuanganController::class, 'piutang'])->name('keuangan.piutang');
        Route::get('keuangan/kas', [KeuanganController::class, 'kas'])->name('keuangan.kas');
        Route::get('konsinyasi', [KonsinyasiController::class, 'index'])->name('konsinyasi.index');
        Route::get('konsinyasi/{id}', [KonsinyasiController::class, 'show'])->whereNumber('id')->name('konsinyasi.show');
    });

    // Hanya manajemen yang mencatat pembayaran dan membuat penyelesaian konsinyasi
    Route::middleware('role:manajemen')->group(function () {
        Route::get('keuangan/bayar/{jenis}/{id}', [KeuanganController::class, 'bayar'])
            ->whereIn('jenis', ['hutang', 'piutang', 'konsinyasi'])->whereNumber('id')->name('keuangan.bayar');
        Route::post('keuangan/bayar/{jenis}/{id}', [KeuanganController::class, 'simpanBayar'])
            ->whereIn('jenis', ['hutang', 'piutang', 'konsinyasi'])->whereNumber('id')->name('keuangan.bayar.simpan');
        Route::post('konsinyasi', [KonsinyasiController::class, 'store'])->name('konsinyasi.store');
    });

    // Staf Pengadaan & CO: membuat dan mengubah PO serta pesanan.
    // (Didaftarkan lebih dulu agar /create tidak tertangkap oleh route {id} di bawah.)
    Route::middleware('role:pengadaan')->group(function () {
        Route::resource('pengadaan', PengadaanController::class)->except(['index', 'show']);
        Route::resource('pesanan', PesananController::class)->except(['index', 'show', 'destroy']);
        // Pesanan tidak dihapus; yang ada hanya "batal" (selama status masih baru).
        Route::post('pesanan/{id}/batal', [PesananController::class, 'batal'])->name('pesanan.batal');
    });

    // Melihat daftar dan detail PO/pesanan (baca saja untuk admin dan manajemen)
    Route::middleware('role:pengadaan,admin,manajemen')->group(function () {
        Route::get('pengadaan', [PengadaanController::class, 'index'])->name('pengadaan.index');
        Route::get('pengadaan/{pengadaan}', [PengadaanController::class, 'show'])->whereNumber('pengadaan')->name('pengadaan.show');
        Route::get('pesanan', [PesananController::class, 'index'])->name('pesanan.index');
        Route::get('pesanan/{pesanan}', [PesananController::class, 'show'])->whereNumber('pesanan')->name('pesanan.show');
    });

    // Staf Gudang: penerimaan barang dan penyimpanan di rak
    Route::middleware('role:gudang')->group(function () {
        Route::get('penerimaan', [PenerimaanController::class, 'index'])->name('penerimaan.index');
        Route::get('penerimaan/{id}', [PenerimaanController::class, 'show'])->name('penerimaan.show');
        Route::post('penerimaan/{id}', [PenerimaanController::class, 'store'])->name('penerimaan.store');

        Route::get('retur-konsinyasi', [KonsinyasiController::class, 'retur'])->name('konsinyasi.retur');
        Route::post('retur-konsinyasi', [KonsinyasiController::class, 'simpanRetur'])->name('konsinyasi.retur.simpan');

        Route::get('penyimpanan', [PenyimpananController::class, 'index'])->name('penyimpanan.index');
        Route::patch('penyimpanan/{barang}', [PenyimpananController::class, 'update'])->name('penyimpanan.update');
    });

    // Packing (Picker): pengambilan barang untuk pesanan
    Route::middleware('role:picker')->group(function () {
        Route::get('pengambilan', [PengambilanController::class, 'index'])->name('pengambilan.index');
        Route::post('pengambilan/{pesanan}', [PengambilanController::class, 'store'])->name('pengambilan.store');
    });

    // Pengemasan & Pengiriman
    Route::middleware('role:pengiriman')->group(function () {
        Route::get('pengemasan', [PengemasanController::class, 'index'])->name('pengemasan.index');
        Route::post('pengemasan/{pesanan}', [PengemasanController::class, 'store'])->name('pengemasan.store');

        Route::get('pengiriman', [PengirimanController::class, 'index'])->name('pengiriman.index');
        Route::post('pengiriman/{pesanan}/kirim', [PengirimanController::class, 'kirim'])->name('pengiriman.kirim');
        Route::post('pengiriman/{pesanan}/selesai', [PengirimanController::class, 'selesai'])->name('pengiriman.selesai');
        Route::get('pengiriman/{pesanan}/surat-jalan', [PengirimanController::class, 'suratJalan'])->name('pengiriman.surat-jalan');
    });
});

require __DIR__.'/auth.php';
