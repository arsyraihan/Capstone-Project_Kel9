<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailPenyelesaianKonsinyasi extends Model
{
    protected $table = 'detail_penyelesaian_konsinyasi';

    public $timestamps = false;

    protected $fillable = ['penyelesaian_konsinyasi_id', 'barang_id', 'jumlah_terjual', 'harga_satuan', 'subtotal'];

    protected function casts(): array
    {
        return [
            'jumlah_terjual' => 'integer',
            'harga_satuan' => 'float',
            'subtotal' => 'float',
        ];
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }
}
