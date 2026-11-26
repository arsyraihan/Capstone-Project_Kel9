<?php

namespace App\Services;

use App\Exceptions\KeuanganException;
use App\Models\Pembayaran;
use App\Models\Pembelian;
use App\Models\Pemasok;
use App\Models\PenyelesaianKonsinyasi;
use App\Models\Pesanan;
use App\Repositories\Interfaces\KeuanganRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Pembayaran (kas masuk/keluar) dan penyelesaian konsinyasi.
 * Semua penulisan berjalan di dalam transaksi dengan baris dokumen dikunci.
 */
class KeuanganService
{
    /** jenis tagihan => [model, arah kas, kolom penghubung di tabel pembayaran, kolom nomor dokumen] */
    private const JENIS = [
        'hutang' => [Pembelian::class, 'keluar', 'pembelian_id', 'no_po'],
        'piutang' => [Pesanan::class, 'masuk', 'pesanan_id', 'no_pesanan'],
        'konsinyasi' => [PenyelesaianKonsinyasi::class, 'keluar', 'penyelesaian_konsinyasi_id', 'no_penyelesaian'],
    ];

    public function __construct(private KeuanganRepositoryInterface $keuangan)
    {
    }

    /**
     * Ringkasan satu tagihan.
     *
     * @return array{dokumen: Model, nomor: string, total: float, dibayar: float, sisa: float}
     *
     * @throws KeuanganException bila dokumen belum/tidak menimbulkan tagihan.
     */
    public function tagihan(string $jenis, int|string $id, bool $kunci = false): array
    {
        [$model, , , $kolomNomor] = self::JENIS[$jenis] ?? throw new KeuanganException('Jenis tagihan tidak dikenal.');

        $query = $model::query();
        if ($kunci) {
            $query->lockForUpdate();
        }
        $dokumen = $query->findOrFail($id);

        if ($jenis === 'hutang') {
            if ($dokumen->cara_bayar === 'konsinyasi') {
                throw new KeuanganException("PO {$dokumen->no_po} konsinyasi: dibayar lewat penyelesaian konsinyasi setelah barang terjual.");
            }
            if ($dokumen->status !== 'diterima') {
                throw new KeuanganException("PO {$dokumen->no_po} belum diterima, jadi belum ada hutang.");
            }
        }

        if ($jenis === 'piutang' && ! in_array($dokumen->status, ['dikirim', 'selesai'], true)) {
            throw new KeuanganException("Pesanan {$dokumen->no_pesanan} belum dikirim, jadi belum ada piutang.");
        }

        $total = (float) $dokumen->total;
        $dibayar = (float) $dokumen->pembayaran()->sum('jumlah');

        return [
            'dokumen' => $dokumen,
            'nomor' => $dokumen->{$kolomNomor},
            'total' => $total,
            'dibayar' => $dibayar,
            'sisa' => max(0, round($total - $dibayar, 2)),
        ];
    }

    /** @throws KeuanganException */
    public function bayar(string $jenis, int|string $id, float $jumlah, string $tanggal, string $metode, ?string $keterangan, int $userId): Pembayaran
    {
        return DB::transaction(function () use ($jenis, $id, $jumlah, $tanggal, $metode, $keterangan, $userId) {
            $tagihan = $this->tagihan($jenis, $id, kunci: true);
            [, $arah, $kolom] = self::JENIS[$jenis];

            if ($tagihan['sisa'] <= 0) {
                throw new KeuanganException("Tagihan {$tagihan['nomor']} sudah lunas.");
            }
            if ($jumlah <= 0) {
                throw new KeuanganException('Jumlah pembayaran harus lebih dari 0.');
            }
            if (round($jumlah, 2) > $tagihan['sisa']) {
                throw new KeuanganException('Jumlah pembayaran melebihi sisa tagihan (Rp '.number_format($tagihan['sisa'], 0, ',', '.').').');
            }

            return $this->catatKas([
                'tanggal' => $tanggal,
                'arah' => $arah,
                'jenis' => $jenis,
                $kolom => $tagihan['dokumen']->id,
                'jumlah' => $jumlah,
                'metode' => $metode,
                'keterangan' => $keterangan,
                'user_id' => $userId,
            ]);
        });
    }

    /** Simpan satu baris kas beserta nomor buktinya (KM = masuk, KK = keluar). */
    public function catatKas(array $data): Pembayaran
    {
        return DB::transaction(function () use ($data) {
            $prefix = ($data['arah'] === 'masuk' ? 'KM-' : 'KK-').Carbon::parse($data['tanggal'])->format('Ymd').'-';

            return Pembayaran::create(['no_bukti' => $this->nomorBerikutnya(Pembayaran::class, 'no_bukti', $prefix)] + $data);
        });
    }

    /**
     * Tagihan konsinyasi: Σ jumlah terjual × harga titip, sejak sehari setelah penyelesaian terakhir.
     *
     * @throws KeuanganException
     */
    public function buatPenyelesaian(int $pemasokId, string $periodeAkhir, int $userId): PenyelesaianKonsinyasi
    {
        return DB::transaction(function () use ($pemasokId, $periodeAkhir, $userId) {
            // Baris pemasok dikunci agar dua penyelesaian tidak menagih penjualan yang sama.
            $pemasok = Pemasok::query()->lockForUpdate()->findOrFail($pemasokId);

            $awal = $this->keuangan->awalPeriodeBerikutnya($pemasok->id);
            if ($awal === null) {
                throw new KeuanganException("Belum ada PO konsinyasi untuk {$pemasok->nama}.");
            }

            $akhir = Carbon::parse($periodeAkhir)->toDateString();
            if ($akhir < $awal) {
                throw new KeuanganException('Periode akhir tidak boleh lebih awal dari awal periode ('.Carbon::parse($awal)->format('d/m/Y').').');
            }
            if ($akhir > now()->toDateString()) {
                throw new KeuanganException('Periode akhir tidak boleh melewati hari ini.');
            }

            $terjual = $this->keuangan->terjualKonsinyasi($pemasok->id, $awal, $akhir);
            if ($terjual->isEmpty()) {
                throw new KeuanganException("Tidak ada barang titipan {$pemasok->nama} yang terjual pada periode tersebut.");
            }

            $penyelesaian = PenyelesaianKonsinyasi::create([
                'no_penyelesaian' => $this->nomorBerikutnya(PenyelesaianKonsinyasi::class, 'no_penyelesaian', 'KSY-'.Carbon::parse($akhir)->format('Ymd').'-'),
                'pemasok_id' => $pemasok->id,
                'periode_awal' => $awal,
                'periode_akhir' => $akhir,
                'total' => $terjual->sum('subtotal'),
                'jatuh_tempo' => Carbon::parse($akhir)->addDays($pemasok->termin_hari)->toDateString(),
                'user_id' => $userId,
            ]);

            $penyelesaian->detail()->createMany($terjual->all());

            return $penyelesaian;
        });
    }

    /** Nomor urut harian; advisory lock mencegah dua transaksi mengambil nomor yang sama. */
    private function nomorBerikutnya(string $model, string $kolom, string $prefix): string
    {
        DB::select('SELECT pg_advisory_xact_lock(hashtext(?))', [$prefix]);

        $terakhir = $model::query()->where($kolom, 'like', $prefix.'%')->max($kolom);
        $urut = $terakhir ? ((int) substr($terakhir, strlen($prefix))) + 1 : 1;

        return $prefix.str_pad((string) $urut, 3, '0', STR_PAD_LEFT);
    }
}
