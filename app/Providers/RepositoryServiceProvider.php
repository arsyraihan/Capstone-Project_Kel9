<?php

namespace App\Providers;

use App\Repositories\Eloquent\BarangRepository;
use App\Repositories\Eloquent\KeuanganRepository;
use App\Repositories\Eloquent\MutasiStokRepository;
use App\Repositories\Eloquent\PelangganRepository;
use App\Repositories\Eloquent\PembelianRepository;
use App\Repositories\Eloquent\PemasokRepository;
use App\Repositories\Eloquent\PesananRepository;
use App\Repositories\Eloquent\RakRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\KeuanganRepositoryInterface;
use App\Repositories\Interfaces\MutasiStokRepositoryInterface;
use App\Repositories\Interfaces\PelangganRepositoryInterface;
use App\Repositories\Interfaces\PembelianRepositoryInterface;
use App\Repositories\Interfaces\PemasokRepositoryInterface;
use App\Repositories\Interfaces\PesananRepositoryInterface;
use App\Repositories\Interfaces\RakRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /** Interface => implementasi. */
    public array $bindings = [
        UserRepositoryInterface::class => UserRepository::class,
        BarangRepositoryInterface::class => BarangRepository::class,
        PemasokRepositoryInterface::class => PemasokRepository::class,
        PelangganRepositoryInterface::class => PelangganRepository::class,
        RakRepositoryInterface::class => RakRepository::class,
        PembelianRepositoryInterface::class => PembelianRepository::class,
        PesananRepositoryInterface::class => PesananRepository::class,
        MutasiStokRepositoryInterface::class => MutasiStokRepository::class,
        KeuanganRepositoryInterface::class => KeuanganRepository::class,
    ];
}
