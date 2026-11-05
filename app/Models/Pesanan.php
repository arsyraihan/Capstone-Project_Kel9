<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pesanan extends Model
{
    protected $table = 'pesanan';

    /** Urutan status; pesanan hanya boleh maju satu langkah. */
    public const ALUR_STATUS = ['baru', 'diambil', 'dikemas', 'dikirim', 'selesai'];

    protected $fillable = [
        'no_pesanan', 'tanggal', 'pelanggan_id', 'status', 'jumlah_koli',
        'ekspedisi', 'no_resi', 'tanggal_kirim', 'keterangan', 'dibuat_oleh',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
            'tanggal_kirim' => 'date:Y-m-d',
            'jumlah_koli' => 'integer',
        ];
    }

    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class);
    }

    public function detail(): HasMany
    {
        return $this->hasMany(DetailPesanan::class);
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
