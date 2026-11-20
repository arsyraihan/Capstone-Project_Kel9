<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fase 7: enam peran + riwayat (jejak pelaksana) pesanan.
 *
 * Migration ini hanya MENAMBAH, tidak menghapus atau mengubah data. Peran lama `petugas` tetap
 * diizinkan sementara, sehingga salinan kode anggota lain yang belum di-pull tetap bisa berjalan
 * di database Supabase bersama. Akun petugas lama dialihkan oleh admin lewat menu Pengguna.
 */
return new class extends Migration
{
    private const PERAN_BARU = ['admin', 'petugas', 'pengadaan', 'gudang', 'picker', 'pengiriman', 'manajemen'];

    public function up(): void
    {
        // enum Laravel di PostgreSQL = varchar + check constraint; constraint-nya diperluas.
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('".implode("','", self::PERAN_BARU)."'))");

        Schema::create('riwayat_pesanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pesanan_id')->constrained('pesanan')->cascadeOnDelete();
            $table->string('status'); // baru | diambil | dikemas | dikirim | selesai | batal
            $table->foreignId('user_id')->constrained('users');
            $table->dateTime('waktu');
            $table->string('keterangan')->nullable();
            $table->index(['pesanan_id', 'waktu']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('riwayat_pesanan');

        // Peran baru dikembalikan menjadi `petugas` agar constraint lama bisa dipasang lagi.
        DB::statement("UPDATE users SET role = 'petugas' WHERE role NOT IN ('admin', 'petugas')");
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin','petugas'))");
    }
};
