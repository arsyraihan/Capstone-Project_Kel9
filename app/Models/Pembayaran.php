<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Satu baris arus kas (masuk atau keluar). */
class Pembayaran extends Model
{
    protected $table = 'pembayaran';

    protected $fillable = [
        'no_bukti', 'tanggal', 'arah', 'jenis', 'pesanan_id', 'pembelian_id',
        'penyelesaian_konsinyasi_id', 'jumlah', 'metode', 'keterangan', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
            'jumlah' => 'float',
        ];
    }

    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class);
    }

    public function pembelian(): BelongsTo
    {
        return $this->belongsTo(Pembelian::class);
    }

    public function penyelesaian(): BelongsTo
    {
        return $this->belongsTo(PenyelesaianKonsinyasi::class, 'penyelesaian_konsinyasi_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
