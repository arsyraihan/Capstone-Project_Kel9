import { usePage } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import Button, { LinkButton } from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import RiwayatBayar from '@/components/RiwayatBayar';
import StatusBadge from '@/components/StatusBadge';
import useAuth from '@/hooks/useAuth';
import { formatRupiah, formatTanggal, statusTagihan } from '@/lib/format';
import { PenyelesaianKonsinyasi, SharedData } from '@/types';

const sel = 'border border-line px-3 py-2';

/** Lampiran tagihan konsinyasi (bisa dicetak). */
export default function Show({ penyelesaian: p, hariIni }: { penyelesaian: PenyelesaianKonsinyasi; hariIni: string }) {
    const { distributor } = usePage<SharedData>().props;
    const bisaBayar = useAuth().is('manajemen');
    const dibayar = (p.pembayaran ?? []).reduce((t, b) => t + b.jumlah, 0);
    const status = statusTagihan(p.total, dibayar, p.jatuh_tempo, hariIni);

    return (
        <AdminLayout title={p.no_penyelesaian}>
            <PageHeader title={`Penyelesaian Konsinyasi ${p.no_penyelesaian}`} breadcrumbs={[{ label: 'Keuangan' }, { label: 'Konsinyasi', href: '/konsinyasi' }, { label: 'Detail' }]}>
                {bisaBayar && status !== 'lunas' && <LinkButton href={`/keuangan/bayar/konsinyasi/${p.id}`}>Bayar</LinkButton>}
                <Button variant="secondary" onClick={() => window.print()}>
                    <Printer className="size-4" />
                    Cetak
                </Button>
            </PageHeader>

            <div className="mb-4 rounded border border-line bg-white p-5 text-sm">
                <div className="mb-3 border-b border-line pb-3">
                    <div className="font-semibold">{distributor.nama}</div>
                    <div className="text-gray-600">
                        {distributor.alamat} · {distributor.telepon}
                    </div>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <dt className="text-xs text-gray-500">Pemasok (pemilik titipan)</dt>
                        <dd>{p.pemasok?.nama}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Periode Penjualan</dt>
                        <dd>
                            {formatTanggal(p.periode_awal)} s.d. {formatTanggal(p.periode_akhir)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Jatuh Tempo</dt>
                        <dd>{formatTanggal(p.jatuh_tempo)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Status</dt>
                        <dd>
                            <StatusBadge status={status} />
                        </dd>
                    </div>
                </dl>
            </div>

            <div className="mb-4 overflow-x-auto rounded border border-line bg-white">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className={`${sel} w-14 text-center font-semibold`}>No</th>
                            <th className={`${sel} font-semibold`}>SKU</th>
                            <th className={`${sel} font-semibold`}>Nama Barang</th>
                            <th className={`${sel} text-right font-semibold`}>Terjual</th>
                            <th className={`${sel} text-right font-semibold`}>Harga Titip</th>
                            <th className={`${sel} text-right font-semibold`}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(p.detail ?? []).map((d, i) => (
                            <tr key={d.id} className="odd:bg-white even:bg-gray-50">
                                <td className={`${sel} text-center`}>{i + 1}</td>
                                <td className={`${sel} font-medium`}>{d.barang?.sku}</td>
                                <td className={sel}>
                                    {d.barang?.nama} ({d.barang?.ukuran}, {d.barang?.warna})
                                </td>
                                <td className={`${sel} text-right`}>{d.jumlah_terjual}</td>
                                <td className={`${sel} text-right`}>{formatRupiah(d.harga_satuan)}</td>
                                <td className={`${sel} text-right`}>{formatRupiah(d.subtotal)}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100 font-semibold">
                            <td colSpan={5} className={`${sel} text-right`}>
                                Total Tagihan
                            </td>
                            <td className={`${sel} text-right`}>{formatRupiah(p.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <RiwayatBayar data={p.pembayaran ?? []} />
        </AdminLayout>
    );
}
