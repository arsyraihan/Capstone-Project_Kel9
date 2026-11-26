import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/PageHeader';
import TabelPemasok from '@/components/TabelPemasok';
import useAuth from '@/hooks/useAuth';
import { formatTanggal, selisihHari, tanggalHariIni } from '@/lib/format';
import { Pembelian, PemenuhanPemasok } from '@/types';

interface Props {
    pemasok: PemenuhanPemasok[];
    kurangKirim: { id: number; no_po: string; pemasok: string; tanggal_terima: string | null; dipesan: number; kurang: number }[];
    belumDatang: Pembelian[];
}

const sel = 'border border-line px-3 py-2';

function Panel({ judul, children }: { judul: string; children: ReactNode }) {
    return (
        <div className="mb-4 rounded border border-line bg-white">
            <div className="border-b border-line px-4 py-3 text-sm font-semibold text-gray-900">{judul}</div>
            <div className="overflow-x-auto">{children}</div>
        </div>
    );
}

export default function Index({ pemasok, kurangKirim, belumDatang }: Props) {
    const bisaBukaPo = useAuth().is('manajemen', 'admin', 'pengadaan');
    const nomor = (id: number, no: string) =>
        bisaBukaPo ? (
            <Link href={`/pengadaan/${id}`} className="font-medium text-navy hover:underline">
                {no}
            </Link>
        ) : (
            no
        );
    const hariIni = tanggalHariIni();

    return (
        <AdminLayout title="Monitoring Pemasok">
            <PageHeader title="Monitoring Pemasok" breadcrumbs={[{ label: 'Keuangan & Monitoring' }, { label: 'Monitoring Pemasok' }]} />

            <Panel judul="Pemenuhan per Pemasok: Barang Dipesan vs Diterima">
                <TabelPemasok data={pemasok} />
            </Panel>

            <div className="grid gap-4 xl:grid-cols-2">
                <Panel judul="PO Kurang Kirim (10 Terbaru)">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-700">
                                <th className={`${sel} font-semibold`}>No. PO</th>
                                <th className={`${sel} font-semibold`}>Pemasok</th>
                                <th className={`${sel} font-semibold`}>Diterima</th>
                                <th className={`${sel} text-right font-semibold`}>Dipesan</th>
                                <th className={`${sel} text-right font-semibold`}>Kurang</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kurangKirim.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={`${sel} py-6 text-center text-gray-500`}>
                                        Tidak ada PO yang kurang kirim.
                                    </td>
                                </tr>
                            )}
                            {kurangKirim.map((p) => (
                                <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                                    <td className={sel}>{nomor(p.id, p.no_po)}</td>
                                    <td className={sel}>{p.pemasok}</td>
                                    <td className={sel}>{formatTanggal(p.tanggal_terima)}</td>
                                    <td className={`${sel} text-right`}>{p.dipesan}</td>
                                    <td className={`${sel} text-right font-semibold text-danger`}>{p.kurang}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Panel>

                <Panel judul="PO Belum Datang">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-700">
                                <th className={`${sel} font-semibold`}>No. PO</th>
                                <th className={`${sel} font-semibold`}>Pemasok</th>
                                <th className={`${sel} font-semibold`}>Tanggal PO</th>
                                <th className={`${sel} text-right font-semibold`}>Pcs</th>
                                <th className={`${sel} text-right font-semibold`}>Menunggu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {belumDatang.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={`${sel} py-6 text-center text-gray-500`}>
                                        Semua PO sudah datang.
                                    </td>
                                </tr>
                            )}
                            {belumDatang.map((p) => (
                                <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                                    <td className={sel}>{nomor(p.id, p.no_po)}</td>
                                    <td className={sel}>{p.pemasok?.nama}</td>
                                    <td className={sel}>{formatTanggal(p.tanggal)}</td>
                                    <td className={`${sel} text-right`}>{(p.detail ?? []).reduce((t, d) => t + d.jumlah, 0)}</td>
                                    <td className={`${sel} text-right`}>{selisihHari(p.tanggal, hariIni)} hari</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Panel>
            </div>
        </AdminLayout>
    );
}
