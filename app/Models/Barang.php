<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barang extends Model
{
    protected $table = 'barang';

    protected $fillable = [
        'sku', 'nama', 'kategori', 'ukuran', 'warna',
        'satuan', 'stok', 'stok_minimum', 'rak_id',
        'harga_beli', 'harga_jual', 'jenis_stok', 'pemasok_id',
    ];

    protected function casts(): array
    {
        return [
            'stok' => 'integer',
            'stok_minimum' => 'integer',
            'harga_beli' => 'float',
            'harga_jual' => 'float',
        ];
    }

    public function rak(): BelongsTo
    {
        return $this->belongsTo(Rak::class);
    }

    /** Pemilik barang titipan (hanya untuk barang konsinyasi). */
    public function pemasok(): BelongsTo
    {
        return $this->belongsTo(Pemasok::class);
    }

    public function isKonsinyasi(): bool
    {
        return $this->jenis_stok === 'konsinyasi';
    }

    public function mutasiStok(): HasMany
    {
        return $this->hasMany(MutasiStok::class);
    }

    public function isDiBawahMinimum(): bool
    {
        return $this->stok <= $this->stok_minimum;
    }
}
