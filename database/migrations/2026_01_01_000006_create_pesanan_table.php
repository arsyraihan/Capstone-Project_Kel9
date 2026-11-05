<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pesanan', function (Blueprint $table) {
            $table->id();
            $table->string('no_pesanan')->unique();
            $table->date('tanggal');
            $table->foreignId('pelanggan_id')->constrained('pelanggan');
            $table->enum('status', ['baru', 'diambil', 'dikemas', 'dikirim', 'selesai', 'batal'])->default('baru');
            $table->integer('jumlah_koli')->nullable();
            $table->string('ekspedisi')->nullable();
            $table->string('no_resi')->nullable();
            $table->date('tanggal_kirim')->nullable();
            $table->text('keterangan')->nullable();
            $table->foreignId('dibuat_oleh')->constrained('users');
            $table->timestamps();
        });

        Schema::create('detail_pesanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pesanan_id')->constrained('pesanan')->cascadeOnDelete();
            $table->foreignId('barang_id')->constrained('barang');
            $table->integer('jumlah');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_pesanan');
        Schema::dropIfExists('pesanan');
    }
};
