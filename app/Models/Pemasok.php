<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pemasok extends Model
{
    protected $table = 'pemasok';

    protected $fillable = ['kode_pemasok', 'nama', 'telepon', 'alamat'];

    public function pembelian(): HasMany
    {
        return $this->hasMany(Pembelian::class);
    }
}
