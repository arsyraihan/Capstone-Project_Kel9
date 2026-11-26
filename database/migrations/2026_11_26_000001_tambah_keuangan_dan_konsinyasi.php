<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Keuangan (hutang, piutang, kas), konsinyasi, dan monitoring pemasok.
 *
 * Migration ini hanya MENAMBAH kolom/tabel dengan nilai default, sehingga data lama aman.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->decimal('harga_beli', 14, 2)->default(0); // konsinyasi: harga titip
            $table->decimal('harga_jual', 14, 2)->default(0);
            $table->string('jenis_stok', 20)->default('beli'); // beli | konsinyasi
            $table->foreignId('pemasok_id')->nullable()->constrained('pemasok'); // pemilik titipan
        });

        Schema::table('pemasok', function (Blueprint $table) {
            $table->smallInteger('termin_hari')->default(30); // 0 = tunai
        });

        Schema::table('pelanggan', function (Blueprint $table) {
            $table->smallInteger('termin_hari')->default(0); // 0 = tunai
        });

        Schema::table('pembelian', function (Blueprint $table) {
            $table->string('cara_bayar', 20)->default('tunai'); // tunai | tempo | konsinyasi
            $table->decimal('total', 14, 2)->default(0); // nilai barang DITERIMA
            $table->date('jatuh_tempo')->nullable();
        });

        Schema::table('detail_pembelian', function (Blueprint $table) {
            $table->decimal('harga_satuan', 14, 2)->default(0);
            $table->integer('jumlah_diterima')->nullable(); // null = belum diterima
        });

        Schema::table('pesanan', function (Blueprint $table) {
            $table->string('cara_bayar', 20)->default('tunai'); // tunai | tempo
            $table->decimal('total', 14, 2)->default(0);
            $table->date('jatuh_tempo')->nullable();
        });

        Schema::table('detail_pesanan', function (Blueprint $table) {
            $table->decimal('harga_satuan', 14, 2)->default(0);
        });

        Schema::create('penyelesaian_konsinyasi', function (Blueprint $table) {
            $table->id();
            $table->string('no_penyelesaian')->unique();
            $table->foreignId('pemasok_id')->constrained('pemasok');
            $table->date('periode_awal');
            $table->date('periode_akhir');
            $table->decimal('total', 14, 2)->default(0);
            $table->date('jatuh_tempo');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
        });

        Schema::create('detail_penyelesaian_konsinyasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penyelesaian_konsinyasi_id')->constrained('penyelesaian_konsinyasi')->cascadeOnDelete();
            $table->foreignId('barang_id')->constrained('barang');
            $table->integer('jumlah_terjual');
            $table->decimal('harga_satuan', 14, 2);
            $table->decimal('subtotal', 14, 2);
        });

        // Satu tabel untuk semua arus kas.
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->string('no_bukti')->unique();
            $table->date('tanggal')->index();
            $table->string('arah', 10); // masuk | keluar
            $table->string('jenis', 20); // piutang | hutang | konsinyasi | saldo_awal
            $table->foreignId('pesanan_id')->nullable()->constrained('pesanan');
            $table->foreignId('pembelian_id')->nullable()->constrained('pembelian');
            $table->foreignId('penyelesaian_konsinyasi_id')->nullable()->constrained('penyelesaian_konsinyasi');
            $table->decimal('jumlah', 14, 2);
            $table->string('metode', 20); // tunai | transfer
            $table->string('keterangan')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
        Schema::dropIfExists('detail_penyelesaian_konsinyasi');
        Schema::dropIfExists('penyelesaian_konsinyasi');

        Schema::table('detail_pesanan', fn (Blueprint $t) => $t->dropColumn('harga_satuan'));
        Schema::table('pesanan', fn (Blueprint $t) => $t->dropColumn(['cara_bayar', 'total', 'jatuh_tempo']));
        Schema::table('detail_pembelian', fn (Blueprint $t) => $t->dropColumn(['harga_satuan', 'jumlah_diterima']));
        Schema::table('pembelian', fn (Blueprint $t) => $t->dropColumn(['cara_bayar', 'total', 'jatuh_tempo']));
        Schema::table('pelanggan', fn (Blueprint $t) => $t->dropColumn('termin_hari'));
        Schema::table('pemasok', fn (Blueprint $t) => $t->dropColumn('termin_hari'));
        Schema::table('barang', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pemasok_id');
            $table->dropColumn(['harga_beli', 'harga_jual', 'jenis_stok']);
        });
    }
};
