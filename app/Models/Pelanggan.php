<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pelanggan extends Model
{
    protected $table = 'pelanggan';

    protected $fillable = ['kode_pelanggan', 'nama', 'telepon', 'alamat'];

    public function pesanan(): HasMany
    {
        return $this->hasMany(Pesanan::class);
    }
}
