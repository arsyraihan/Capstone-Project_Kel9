<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barang', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('nama');
            $table->string('kategori');
            $table->string('ukuran');
            $table->string('warna');
            $table->string('satuan')->default('pcs');
            $table->integer('stok')->default(0);
            $table->integer('stok_minimum')->default(10);
            $table->foreignId('rak_id')->nullable()->constrained('rak');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barang');
    }
};
