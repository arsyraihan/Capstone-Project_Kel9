<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MutasiStok extends Model
{
    protected $table = 'mutasi_stok';

    protected $fillable = [
        'barang_id', 'tanggal', 'jenis', 'jumlah', 'stok_akhir',
        'referensi', 'keterangan', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'datetime',
            'jumlah' => 'integer',
            'stok_akhir' => 'integer',
        ];
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
