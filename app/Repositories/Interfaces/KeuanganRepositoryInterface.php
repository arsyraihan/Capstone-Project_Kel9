<?php

namespace App\Repositories\Interfaces;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/** Kueri baca untuk keuangan, konsinyasi, dan monitoring pemasok. */
interface KeuanganRepositoryInterface
{
    /** @param  string  $status  '' | belum | jatuh_tempo | lunas */
    public function paginateHutang(string $status = '', ?string $search = null, int $perPage = 10): LengthAwarePaginator;

    public function paginatePiutang(string $status = '', ?string $search = null, int $perPage = 10): LengthAwarePaginator;

    public function paginatePenyelesaian(?string $search = null, int $perPage = 10): LengthAwarePaginator;

    public function mutasiKas(string $dari, string $sampai): Collection;

    public function saldoSebelum(string $tanggal): float;

    public function rekapKasBulanan(int $bulan = 6): array;

    public function ringkasan(): array;

    public function umurPiutang(): array;

    public function pemenuhanPemasok(): array;

    public function poKurangKirim(int $limit = 10): array;

    public function poBelumDatang(): Collection;

    public function rekapKonsinyasi(): array;

    public function terjualKonsinyasi(int $pemasokId, string $dari, string $sampai): Collection;

    /** Sehari setelah penyelesaian terakhir, atau tanggal PO konsinyasi pertama. Null bila belum ada. */
    public function awalPeriodeBerikutnya(int $pemasokId): ?string;
}
