<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailPembelian extends Model
{
    protected $table = 'detail_pembelian';

    public $timestamps = false;

    protected $fillable = ['pembelian_id', 'barang_id', 'jumlah', 'harga_satuan', 'jumlah_diterima'];

    protected function casts(): array
    {
        return ['jumlah' => 'integer', 'harga_satuan' => 'float', 'jumlah_diterima' => 'integer'];
    }

    public function pembelian(): BelongsTo
    {
        return $this->belongsTo(Pembelian::class);
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }
}
