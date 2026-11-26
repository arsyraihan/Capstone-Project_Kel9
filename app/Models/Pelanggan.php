<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pelanggan extends Model
{
    protected $table = 'pelanggan';

    protected $fillable = ['kode_pelanggan', 'nama', 'telepon', 'alamat', 'termin_hari'];

    protected function casts(): array
    {
        return ['termin_hari' => 'integer'];
    }

    public function pesanan(): HasMany
    {
        return $this->hasMany(Pesanan::class);
    }
}
