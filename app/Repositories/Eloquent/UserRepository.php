<?php

namespace App\Repositories\Eloquent;

use App\Models\MutasiStok;
use App\Models\Pembelian;
use App\Models\Pesanan;
use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    protected array $searchable = ['name', 'email', 'role'];

    protected string $orderBy = 'name';

    public function __construct()
    {
        parent::__construct(new User());
    }

    public function isDipakai(int|string $id): bool
    {
        return Pembelian::where('dibuat_oleh', $id)->orWhere('diterima_oleh', $id)->exists()
            || Pesanan::where('dibuat_oleh', $id)->exists()
            || MutasiStok::where('user_id', $id)->exists();
    }
}
