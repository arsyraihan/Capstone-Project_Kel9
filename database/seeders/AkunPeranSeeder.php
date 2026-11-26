<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/** Akun demo untuk setiap peran. Semua kata sandinya `password`. */
class AkunPeranSeeder extends Seeder
{
    public const AKUN = [
        ['admin@inventaris.test', 'Administrator', 'admin'],
        ['pengadaan@inventaris.test', 'Staf Pengadaan & CO', 'pengadaan'],
        ['gudang@inventaris.test', 'Staf Gudang', 'gudang'],
        ['picker@inventaris.test', 'Staf Packing', 'picker'],
        ['pengiriman@inventaris.test', 'Staf Pengemasan & Pengiriman', 'pengiriman'],
        ['manajemen@inventaris.test', 'Manajemen', 'manajemen'],
    ];

    public function run(): void
    {
        foreach (self::AKUN as [$email, $nama, $peran]) {
            User::updateOrCreate(
                ['email' => $email],
                ['name' => $nama, 'password' => 'password', 'role' => $peran]
            );
        }
    }
}
