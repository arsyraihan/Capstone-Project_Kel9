<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pemasok extends Model
{
    protected $table = 'pemasok';

    protected $fillable = ['kode_pemasok', 'nama', 'telepon', 'alamat', 'termin_hari'];

    protected function casts(): array
    {
        return ['termin_hari' => 'integer'];
    }

    public function pembelian(): HasMany
    {
        return $this->hasMany(Pembelian::class);
    }
}
