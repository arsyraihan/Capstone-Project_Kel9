<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pembelian extends Model
{
    protected $table = 'pembelian';

    protected $fillable = [
        'no_po', 'tanggal', 'pemasok_id', 'status', 'tanggal_terima',
        'diterima_oleh', 'keterangan', 'dibuat_oleh', 'cara_bayar', 'total', 'jatuh_tempo',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
            'tanggal_terima' => 'date:Y-m-d',
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
        return $this->hasMany(DetailPembelian::class);
    }

    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class)->orderBy('tanggal')->orderBy('id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function penerima(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diterima_oleh');
    }
}
