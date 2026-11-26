<?php

namespace App\Http\Controllers;

use App\Repositories\Interfaces\BarangRepositoryInterface;
use App\Repositories\Interfaces\KeuanganRepositoryInterface;
use App\Repositories\Interfaces\MutasiStokRepositoryInterface;
use App\Repositories\Interfaces\PembelianRepositoryInterface;
use App\Repositories\Interfaces\PesananRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** Bagian dashboard yang ditampilkan untuk tiap peran (selain "Tugas Anda" yang selalu ada). */
    private const TAMPIL = [
        'admin' => ['ringkasan', 'keuangan', 'grafik', 'pemasok', 'stokMinimum', 'pesananTerbaru'],
        'pengadaan' => ['ringkasan', 'grafik', 'pemasok', 'stokMinimum', 'pesananTerbaru'],
        'gudang' => ['ringkasan', 'grafik', 'stokMinimum'],
        'picker' => [],
        'pengiriman' => ['pesananTerbaru'],
        'manajemen' => ['ringkasan', 'keuangan', 'grafikKas', 'umurPiutang', 'grafik', 'pemasok', 'stokMinimum', 'pesananTerbaru'],
        'petugas' => ['ringkasan', 'stokMinimum', 'pesananTerbaru'], // peran lama
    ];

    public function __construct(
        private BarangRepositoryInterface $barang,
        private PesananRepositoryInterface $pesanan,
        private PembelianRepositoryInterface $pembelian,
        private MutasiStokRepositoryInterface $mutasi,
        private UserRepositoryInterface $users,
        private KeuanganRepositoryInterface $keuangan,
    ) {
    }

    public function index(Request $request): Response
    {
        $peran = $request->user()->role;
        $tampil = self::TAMPIL[$peran] ?? [];
        $ada = fn (string $bagian) => in_array($bagian, $tampil, true);

        return Inertia::render('Dashboard', [
            'tampil' => $tampil,
            'antrean' => $this->antrean($peran),
            'ringkasan' => $ada('ringkasan')
                ? $this->barang->ringkasan() + ['pesanan_belum_dikirim' => $this->pesanan->jumlahBelumDikirim()]
                : null,
            'grafik' => $ada('grafik') ? $this->mutasi->rekapBulanan(6) : null,
            'keuangan' => $ada('keuangan') ? $this->keuangan->ringkasan() : null,
            'grafikKas' => $ada('grafikKas') ? $this->keuangan->rekapKasBulanan(6) : null,
            'umurPiutang' => $ada('umurPiutang') ? $this->keuangan->umurPiutang() : null,
            'pemasok' => $ada('pemasok') ? $this->keuangan->pemenuhanPemasok() : null,
            'stokMinimum' => $ada('stokMinimum') ? $this->barang->getStokMinimum(5) : null,
            'pesananTerbaru' => $ada('pesananTerbaru') ? $this->pesanan->terbaru(5) : null,
        ]);
    }

    /**
     * "Tugas Anda": antrean pekerjaan yang menunggu tiap peran, beserta tautan ke menu yang relevan.
     *
     * @return array<int, array{label: string, jumlah: int, href: string, peringatan: bool}>
     */
    private function antrean(string $peran): array
    {
        $item = fn (string $label, int $jumlah, string $href, bool $peringatan = false) => compact('label', 'jumlah', 'href', 'peringatan');

        switch ($peran) {
            case 'admin':
                $po = $this->pembelian->hitungPerStatus();
                $pesanan = $this->pesanan->hitungPerStatus();

                return [
                    $item('Pengguna terdaftar', array_sum($this->users->hitungPerPeran()), '/pengguna'),
                    $item('PO menunggu diterima', $po['dipesan'] ?? 0, '/pengadaan'),
                    $item('Pesanan belum dikirim', $this->belumDikirim($pesanan), '/pesanan'),
                    $item('Barang di bawah stok minimum', $this->barang->ringkasan()['di_bawah_minimum'], '/stok', true),
                ];

            case 'pengadaan':
                $po = $this->pembelian->hitungPerStatus();
                $pesanan = $this->pesanan->hitungPerStatus();

                return [
                    $item('PO menunggu diterima gudang', $po['dipesan'] ?? 0, '/pengadaan'),
                    $item('Pesanan baru (menunggu diambil)', $pesanan['baru'] ?? 0, '/pesanan?status=baru'),
                    $item('Barang di bawah stok minimum (perlu PO)', $this->barang->ringkasan()['di_bawah_minimum'], '/stok', true),
                ];

            case 'gudang':
                $po = $this->pembelian->hitungPerStatus();

                return [
                    $item('PO menunggu penerimaan', $po['dipesan'] ?? 0, '/penerimaan'),
                    $item('Barang belum ditempatkan di rak', $this->barang->jumlahTanpaRak(), '/penyimpanan', true),
                    $item('Barang di bawah stok minimum', $this->barang->ringkasan()['di_bawah_minimum'], '/stok', true),
                ];

            case 'picker':
                return [
                    $item('Pesanan siap diambil', $this->pesanan->hitungPerStatus()['baru'] ?? 0, '/pengambilan'),
                ];

            case 'pengiriman':
                $pesanan = $this->pesanan->hitungPerStatus();

                return [
                    $item('Menunggu dikemas', $pesanan['diambil'] ?? 0, '/pengemasan'),
                    $item('Siap dikirim', $pesanan['dikemas'] ?? 0, '/pengiriman?tab=dikemas'),
                    $item('Dalam pengiriman (belum selesai)', $pesanan['dikirim'] ?? 0, '/pengiriman?tab=dikirim'),
                ];

            case 'manajemen':
                $k = $this->keuangan->ringkasan();

                return [
                    $item('Hutang PO jatuh tempo (7 hari / lewat)', $k['jumlah_hutang_jatuh_tempo'], '/keuangan/hutang', true),
                    $item('Penyelesaian konsinyasi belum lunas', $k['jumlah_konsinyasi_belum_lunas'], '/konsinyasi', true),
                    $item('Piutang lewat jatuh tempo', $k['jumlah_piutang_lewat'], '/keuangan/piutang?status=jatuh_tempo', true),
                    $item('PO belum diterima', $k['jumlah_po_belum_diterima'], '/monitoring-pemasok'),
                ];

            default:
                return [];
        }
    }

    private function belumDikirim(array $perStatus): int
    {
        return ($perStatus['baru'] ?? 0) + ($perStatus['diambil'] ?? 0) + ($perStatus['dikemas'] ?? 0);
    }
}
