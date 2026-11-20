<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Jejak proses pesanan: siapa mengubah status menjadi apa, dan kapan. */
class RiwayatPesanan extends Model
{
    protected $table = 'riwayat_pesanan';

    public $timestamps = false;

    protected $fillable = ['pesanan_id', 'status', 'user_id', 'waktu', 'keterangan'];

    protected function casts(): array
    {
        return ['waktu' => 'datetime'];
    }

    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
