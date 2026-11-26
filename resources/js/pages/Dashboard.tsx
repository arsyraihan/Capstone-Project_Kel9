import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';
import AdminLayout from '@/components/AdminLayout';
import KasBarChart, { RekapKas } from '@/components/Charts/KasBarChart';
import MutasiBarChart, { RekapBulanan } from '@/components/Charts/MutasiBarChart';
import KotakUang from '@/components/Kotak';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import TabelPemasok from '@/components/TabelPemasok';
import useAuth from '@/hooks/useAuth';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { namaPeran } from '@/lib/peran';
import { Barang, PemenuhanPemasok, Pesanan, UmurPiutang } from '@/types';

interface Antrean {
    label: string;
    jumlah: number;
    href: string;
    peringatan: boolean;
}

interface Props {
    tampil: string[];
    antrean: Antrean[];
    ringkasan: {
        total_sku: number;
        total_stok: number;
        di_bawah_minimum: number;
        pesanan_belum_dikirim: number;
    } | null;
    grafik: RekapBulanan[] | null;
    stokMinimum: Barang[] | null;
    pesananTerbaru: Pesanan[] | null;
    keuangan: {
        nilai_persediaan: number;
        nilai_titipan: number;
        hutang_total: number;
        hutang_lewat: number;
        hutang_segera: number;
        piutang_total: number;
        piutang_lewat: number;
        kas_masuk_bulan_ini: number;
        kas_keluar_bulan_ini: number;
        saldo_kas: number;
    } | null;
    grafikKas: RekapKas[] | null;
    umurPiutang: UmurPiutang[] | null;
    pemasok: PemenuhanPemasok[] | null;
}

const angka = (n: number) => n.toLocaleString('id-ID');

function Kotak({ label, nilai, satuan, merah = false }: { label: string; nilai: number; satuan?: string; merah?: boolean }) {
    return (
        <div className="rounded border border-line bg-white p-4">
            <div className="text-sm text-gray-500">{label}</div>
            <div className={`mt-1 text-2xl font-semibold ${merah ? 'text-danger' : 'text-gray-900'}`}>
                {angka(nilai)}
                {satuan && <span className="ml-1 text-sm font-normal text-gray-500">{satuan}</span>}
            </div>
        </div>
    );
}

function Panel({ judul, aksi, children }: { judul: string; aksi?: ReactNode; children: ReactNode }) {
    return (
        <div className="rounded border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">{judul}</h2>
                {aksi}
            </div>
            {children}
        </div>
    );
}

export default function Dashboard({ tampil, antrean, ringkasan, grafik, stokMinimum, pesananTerbaru, keuangan, grafikKas, umurPiutang, pemasok }: Props) {
    const { user, is } = useAuth();
    // Hanya peran ini yang boleh membuka halaman detail pesanan.
    const bisaLihatPesanan = is('admin', 'pengadaan', 'manajemen');
    const duaTabel = tampil.includes('stokMinimum') && tampil.includes('pesananTerbaru');

    return (
        <AdminLayout title="Dashboard">
            <PageHeader title="Dashboard" />

            {user && (
                <p className="mb-4 -mt-2 text-sm text-gray-600">
                    Selamat datang, <strong>{user.name}</strong> ({namaPeran[user.role]}).
                </p>
            )}

            {/* Tugas Anda: antrean pekerjaan sesuai peran */}
            {antrean.length > 0 && (
                <div className="mb-4">
                    <h2 className="mb-2 text-sm font-semibold text-gray-900">Tugas Anda</h2>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {antrean.map((a) => (
                            <Link key={a.label} href={a.href} className="rounded border border-line bg-white p-4 transition-colors hover:border-navy">
                                <div className="text-sm text-gray-500">{a.label}</div>
                                <div className={`mt-1 text-2xl font-semibold ${a.peringatan && a.jumlah > 0 ? 'text-danger' : 'text-gray-900'}`}>{angka(a.jumlah)}</div>
                                <div className="mt-1 text-xs text-navy">{a.jumlah > 0 ? 'Buka daftar' : 'Tidak ada yang menunggu'}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {ringkasan && (
                <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Kotak label="Total SKU" nilai={ringkasan.total_sku} />
                    <Kotak label="Total Stok" nilai={ringkasan.total_stok} satuan="pcs" />
                    <Kotak label="Barang di Bawah Stok Minimum" nilai={ringkasan.di_bawah_minimum} merah={ringkasan.di_bawah_minimum > 0} />
                    <Kotak label="Pesanan Belum Dikirim" nilai={ringkasan.pesanan_belum_dikirim} />
                </div>
            )}

            {keuangan && (
                <div className="mb-4">
                    <h2 className="mb-2 text-sm font-semibold text-gray-900">Statistik Keuangan</h2>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <KotakUang label="Nilai Persediaan" nilai={formatRupiah(keuangan.nilai_persediaan)} keterangan={`Barang titipan: ${formatRupiah(keuangan.nilai_titipan)}`} />
                        <KotakUang
                            label="Hutang ke Pemasok"
                            nilai={formatRupiah(keuangan.hutang_total)}
                            keterangan={`Lewat tempo ${formatRupiah(keuangan.hutang_lewat)} · 7 hari lagi ${formatRupiah(keuangan.hutang_segera)}`}
                            merah={keuangan.hutang_lewat > 0}
                        />
                        <KotakUang
                            label="Piutang Pelanggan"
                            nilai={formatRupiah(keuangan.piutang_total)}
                            keterangan={`Lewat tempo ${formatRupiah(keuangan.piutang_lewat)}`}
                            merah={keuangan.piutang_lewat > 0}
                        />
                        <KotakUang
                            label="Saldo Kas"
                            nilai={formatRupiah(keuangan.saldo_kas)}
                            keterangan={`Bulan ini: masuk ${formatRupiah(keuangan.kas_masuk_bulan_ini)} · keluar ${formatRupiah(keuangan.kas_keluar_bulan_ini)}`}
                            merah={keuangan.saldo_kas < 0}
                        />
                    </div>
                </div>
            )}

            {grafikKas && umurPiutang && (
                <div className="mb-4 grid gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <Panel judul="Uang Masuk vs Keluar (6 Bulan Terakhir)">
                            <div className="p-3">
                                <KasBarChart data={grafikKas} />
                            </div>
                        </Panel>
                    </div>
                    <Panel judul="Umur Piutang">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left text-gray-700">
                                    <th className="border border-line px-3 py-2 font-semibold">Kelompok</th>
                                    <th className="border border-line px-3 py-2 text-right font-semibold">Pesanan</th>
                                    <th className="border border-line px-3 py-2 text-right font-semibold">Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {umurPiutang.map((u) => (
                                    <tr key={u.label} className="odd:bg-white even:bg-gray-50">
                                        <td className="border border-line px-3 py-2">{u.label}</td>
                                        <td className="border border-line px-3 py-2 text-right">{u.jumlah}</td>
                                        <td className="border border-line px-3 py-2 text-right">{formatRupiah(u.nilai)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                </div>
            )}

            {pemasok && (
                <div className="mb-4">
                    <Panel
                        judul="Monitoring Pemasok: Barang Dipesan vs Diterima"
                        aksi={
                            <Link href="/monitoring-pemasok" className="text-sm text-navy hover:underline">
                                Lihat rincian
                            </Link>
                        }
                    >
                        <TabelPemasok data={pemasok} />
                    </Panel>
                </div>
            )}

            {grafik && (
                <div className="mb-4">
                    <Panel judul="Barang Masuk vs Keluar (6 Bulan Terakhir)">
                        <div className="p-3">
                            <MutasiBarChart data={grafik} />
                        </div>
                    </Panel>
                </div>
            )}

            <div className={`grid gap-4 ${duaTabel ? 'xl:grid-cols-2' : ''}`}>
                {stokMinimum && (
                    <Panel
                        judul="Barang Stok Minimum"
                        aksi={
                            <Link href="/stok" className="text-sm text-navy hover:underline">
                                Lihat semua stok
                            </Link>
                        }
                    >
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left text-gray-700">
                                    <th className="w-12 border border-line px-3 py-2 text-center font-semibold">No</th>
                                    <th className="border border-line px-3 py-2 font-semibold">SKU</th>
                                    <th className="border border-line px-3 py-2 font-semibold">Nama Barang</th>
                                    <th className="border border-line px-3 py-2 text-right font-semibold">Stok</th>
                                    <th className="border border-line px-3 py-2 text-right font-semibold">Min.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stokMinimum.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="border border-line px-3 py-6 text-center text-gray-500">
                                            Semua stok masih di atas minimum.
                                        </td>
                                    </tr>
                                )}
                                {stokMinimum.map((b, i) => (
                                    <tr key={b.id} className="odd:bg-white even:bg-gray-50">
                                        <td className="border border-line px-3 py-2 text-center">{i + 1}</td>
                                        <td className="border border-line px-3 py-2 font-medium">{b.sku}</td>
                                        <td className="border border-line px-3 py-2">{b.nama}</td>
                                        <td className="border border-line px-3 py-2 text-right font-semibold text-danger">{b.stok}</td>
                                        <td className="border border-line px-3 py-2 text-right">{b.stok_minimum}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                )}

                {pesananTerbaru && (
                    <Panel
                        judul="Pesanan Terbaru"
                        aksi={
                            bisaLihatPesanan && (
                                <Link href="/pesanan" className="text-sm text-navy hover:underline">
                                    Lihat semua pesanan
                                </Link>
                            )
                        }
                    >
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left text-gray-700">
                                    <th className="w-12 border border-line px-3 py-2 text-center font-semibold">No</th>
                                    <th className="border border-line px-3 py-2 font-semibold">No. Pesanan</th>
                                    <th className="border border-line px-3 py-2 font-semibold">Pelanggan</th>
                                    <th className="border border-line px-3 py-2 font-semibold">Tanggal</th>
                                    <th className="border border-line px-3 py-2 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pesananTerbaru.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="border border-line px-3 py-6 text-center text-gray-500">
                                            Belum ada pesanan.
                                        </td>
                                    </tr>
                                )}
                                {pesananTerbaru.map((p, i) => (
                                    <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                                        <td className="border border-line px-3 py-2 text-center">{i + 1}</td>
                                        <td className="border border-line px-3 py-2 font-medium">
                                            {bisaLihatPesanan ? (
                                                <Link href={`/pesanan/${p.id}`} className="text-navy hover:underline">
                                                    {p.no_pesanan}
                                                </Link>
                                            ) : (
                                                p.no_pesanan
                                            )}
                                        </td>
                                        <td className="border border-line px-3 py-2">{p.pelanggan?.nama ?? '-'}</td>
                                        <td className="border border-line px-3 py-2">{formatTanggal(p.tanggal)}</td>
                                        <td className="border border-line px-3 py-2">
                                            <StatusBadge status={p.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                )}
            </div>
        </AdminLayout>
    );
}
