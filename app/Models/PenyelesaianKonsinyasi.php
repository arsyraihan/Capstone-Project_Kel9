<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Tagihan konsinyasi satu pemasok untuk satu periode penjualan. */
class PenyelesaianKonsinyasi extends Model
{
    protected $table = 'penyelesaian_konsinyasi';

    protected $fillable = ['no_penyelesaian', 'pemasok_id', 'periode_awal', 'periode_akhir', 'total', 'jatuh_tempo', 'user_id'];

    protected function casts(): array
    {
        return [
            'periode_awal' => 'date:Y-m-d',
            'periode_akhir' => 'date:Y-m-d',
            'jatuh_tempo' => 'date:Y-m-d',
            'total' => 'float',
        ];
    }

    public function pemasok(): BelongsTo
    {
        return $this->belongsTo(Pemasok::class);
    }

    public function detail(): HasMany
    {
        return $this->hasMany(DetailPenyelesaianKonsinyasi::class);
    }

    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class)->orderBy('tanggal')->orderBy('id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
