<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rak extends Model
{
    protected $table = 'rak';

    protected $fillable = ['kode_rak', 'keterangan'];

    public function barang(): HasMany
    {
        return $this->hasMany(Barang::class);
    }
}
