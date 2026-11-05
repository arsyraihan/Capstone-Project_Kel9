import { Link, router } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import KopSurat from '@/components/KopSurat';
import PageHeader from '@/components/PageHeader';
import { formatTanggal, formatWaktu } from '@/lib/format';
import { Barang, MutasiStok } from '@/types';

type Tab = 'stok' | 'masuk' | 'keluar';

interface MutasiLaporan extends MutasiStok {
    barang?: Barang;
}

interface Props {
    tab: Tab;
    dari: string;
    sampai: string;
    barang: Barang[] | null;
    mutasi: MutasiLaporan[] | null;
    dicetakPada: string;
}

const tabs: { key: Tab; label: string; judul: string }[] = [
    { key: 'stok', label: 'Stok', judul: 'Laporan Stok Barang' },
    { key: 'masuk', label: 'Barang Masuk', judul: 'Laporan Barang Masuk' },
    { key: 'keluar', label: 'Barang Keluar', judul: 'Laporan Barang Keluar' },
];

const sel = 'border border-gray-400 px-2 py-1.5';

export default function Index({ tab, dari, sampai, barang, mutasi, dicetakPada }: Props) {
    const [tglDari, setTglDari] = useState(dari);
    const [tglSampai, setTglSampai] = useState(sampai);
    const judul = tabs.find((t) => t.key === tab)!.judul;

    const kueri = (t: Tab) => {
        const q = new URLSearchParams({ tab: t });
        if (t !== 'stok' && dari) q.set('dari', dari);
        if (t !== 'stok' && sampai) q.set('sampai', sampai);
        return `/laporan?${q.toString()}`;
    };

    const tampilkan: FormEventHandler = (e) => {
        e.preventDefault();
        router.get('/laporan', { tab, dari: tglDari || undefined, sampai: tglSampai || undefined }, { preserveScroll: true });
    };

    const reset = () => {
        setTglDari('');
        setTglSampai('');
        router.get('/laporan', { tab });
    };

    const periode = tab === 'stok' ? `Posisi stok per ${dicetakPada.slice(0, 10)}` : dari || sampai ? `Periode: ${dari ? formatTanggal(dari) : 'awal'} s/d ${sampai ? formatTanggal(sampai) : 'sekarang'}` : 'Periode: semua tanggal';

    const total = (mutasi ?? []).reduce((t, m) => t + m.jumlah, 0);
    const totalStok = (barang ?? []).reduce((t, b) => t + b.stok, 0);

    return (
        <AdminLayout title="Laporan">
            <div className="print:hidden">
                <PageHeader title="Laporan" breadcrumbs={[{ label: 'Lainnya' }, { label: 'Laporan' }]}>
                    <Button onClick={() => window.print()}>
                        <Printer className="size-4" />
                        Cetak
                    </Button>
                </PageHeader>

                <div className="mb-3 flex gap-1 border-b border-line">
                    {tabs.map((t) => (
                        <Link
                            key={t.key}
                            href={kueri(t.key)}
                            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === t.key ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            {t.label}
                        </Link>
                    ))}
                </div>

                {tab === 'stok' ? (
                    <p className="mb-3 text-sm text-gray-600">Laporan stok menampilkan posisi stok saat ini, sehingga tidak memakai filter tanggal.</p>
                ) : (
                    <form onSubmit={tampilkan} className="mb-3 flex flex-wrap items-end gap-3 rounded border border-line bg-white p-3">
                        <div className="w-44">
                            <FormInput label="Dari Tanggal" name="dari" type="date" value={tglDari} onChange={(e) => setTglDari(e.target.value)} />
                        </div>
                        <div className="w-44">
                            <FormInput label="Sampai Tanggal" name="sampai" type="date" value={tglSampai} onChange={(e) => setTglSampai(e.target.value)} />
                        </div>
                        <Button type="submit">Tampilkan</Button>
                        <Button variant="secondary" onClick={reset}>
                            Reset
                        </Button>
                    </form>
                )}
            </div>

            {/* Area laporan: inilah yang tercetak */}
            <div className="rounded border border-line bg-white p-6 text-sm text-gray-900 print:rounded-none print:border-0 print:p-0">
                <KopSurat judul={judul} />
                <p className="mb-3 text-center text-sm text-gray-700">{periode}</p>

                <table className="w-full border-collapse text-sm">
                    {tab === 'stok' && barang && (
                        <>
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className={`${sel} w-12 text-center font-semibold`}>No</th>
                                    <th className={`${sel} font-semibold`}>SKU</th>
                                    <th className={`${sel} font-semibold`}>Nama Barang</th>
                                    <th className={`${sel} font-semibold`}>Kategori</th>
                                    <th className={`${sel} font-semibold`}>Ukuran</th>
                                    <th className={`${sel} font-semibold`}>Warna</th>
                                    <th className={`${sel} text-right font-semibold`}>Stok</th>
                                    <th className={`${sel} text-right font-semibold`}>Min.</th>
                                    <th className={`${sel} font-semibold`}>Rak</th>
                                    <th className={`${sel} font-semibold`}>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {barang.map((b, i) => (
                                    <tr key={b.id} className={b.stok <= b.stok_minimum ? 'font-semibold' : ''}>
                                        <td className={`${sel} text-center`}>{i + 1}</td>
                                        <td className={sel}>{b.sku}</td>
                                        <td className={sel}>{b.nama}</td>
                                        <td className={sel}>{b.kategori}</td>
                                        <td className={sel}>{b.ukuran}</td>
                                        <td className={sel}>{b.warna}</td>
                                        <td className={`${sel} text-right`}>
                                            {b.stok} {b.satuan}
                                        </td>
                                        <td className={`${sel} text-right`}>{b.stok_minimum}</td>
                                        <td className={sel}>{b.rak?.kode_rak ?? '-'}</td>
                                        <td className={`${sel} ${b.stok <= b.stok_minimum ? 'text-danger print:text-black' : ''}`}>{b.stok <= b.stok_minimum ? 'Di bawah minimum' : 'Aman'}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-semibold">
                                    <td colSpan={6} className={`${sel} text-right`}>
                                        Total stok
                                    </td>
                                    <td className={`${sel} text-right`}>{totalStok} pcs</td>
                                    <td colSpan={3} className={sel} />
                                </tr>
                            </tbody>
                        </>
                    )}

                    {tab !== 'stok' && mutasi && (
                        <>
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className={`${sel} w-12 text-center font-semibold`}>No</th>
                                    <th className={`${sel} font-semibold`}>Tanggal</th>
                                    <th className={`${sel} font-semibold`}>{tab === 'masuk' ? 'No. PO' : 'No. Pesanan'}</th>
                                    <th className={`${sel} font-semibold`}>SKU</th>
                                    <th className={`${sel} font-semibold`}>Nama Barang</th>
                                    <th className={`${sel} text-right font-semibold`}>Jumlah</th>
                                    <th className={`${sel} font-semibold`}>Petugas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mutasi.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className={`${sel} py-6 text-center text-gray-500`}>
                                            Tidak ada data pada periode ini.
                                        </td>
                                    </tr>
                                )}
                                {mutasi.map((m, i) => (
                                    <tr key={m.id}>
                                        <td className={`${sel} text-center`}>{i + 1}</td>
                                        <td className={sel}>{formatWaktu(m.tanggal)}</td>
                                        <td className={sel}>{m.referensi}</td>
                                        <td className={sel}>{m.barang?.sku}</td>
                                        <td className={sel}>{m.barang?.nama}</td>
                                        <td className={`${sel} text-right`}>
                                            {m.jumlah} {m.barang?.satuan}
                                        </td>
                                        <td className={sel}>{m.user?.name ?? '-'}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-semibold">
                                    <td colSpan={5} className={`${sel} text-right`}>
                                        Total
                                    </td>
                                    <td className={`${sel} text-right`}>{total} pcs</td>
                                    <td className={sel} />
                                </tr>
                            </tbody>
                        </>
                    )}
                </table>

                {/* Tanda tangan */}
                <div className="mt-10 flex justify-between text-center text-sm">
                    <div className="w-56">
                        <div>Dibuat oleh,</div>
                        <div className="mt-16 border-t border-gray-800 pt-1">Admin Gudang</div>
                    </div>
                    <div className="w-56">
                        <div>Mengetahui,</div>
                        <div className="mt-16 border-t border-gray-800 pt-1">Pimpinan</div>
                    </div>
                </div>
                <p className="mt-6 text-xs text-gray-500">Dicetak pada {dicetakPada}</p>
            </div>
        </AdminLayout>
    );
}
