import { router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button, { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import useAuth from '@/hooks/useAuth';
import { formatRupiah, formatTanggal, statusTagihan } from '@/lib/format';
import { Paginated, PenyelesaianKonsinyasi } from '@/types';

interface Pemilik {
    id: number;
    kode_pemasok: string;
    nama: string;
    termin_hari: number;
    periode_awal: string | null;
    tagihan_berjalan: number;
    barang: { id: number; sku: string; nama: string; warna: string; ukuran: string; stok: number; harga_titip: number; terjual: number }[];
}

interface Props {
    pemasok: Pemilik[];
    penyelesaian: Paginated<PenyelesaianKonsinyasi>;
    filters: { search: string };
    hariIni: string;
}

const sel = 'border border-line px-3 py-2';

function KartuPemasok({ p, hariIni }: { p: Pemilik; hariIni: string }) {
    const bisaBuat = useAuth().is('manajemen');
    const [akhir, setAkhir] = useState(hariIni);
    const [konfirmasi, setKonfirmasi] = useState(false);
    const [processing, setProcessing] = useState(false);

    const buat = () =>
        router.post(
            '/konsinyasi',
            { pemasok_id: p.id, periode_akhir: akhir },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setKonfirmasi(false);
                },
            },
        );

    return (
        <div className="mb-4 rounded border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">
                    {p.kode_pemasok} - {p.nama}
                </h2>
                <span className="text-sm text-gray-600">
                    Tagihan berjalan: <strong>{formatRupiah(p.tagihan_berjalan)}</strong>
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className={`${sel} font-semibold`}>SKU</th>
                            <th className={`${sel} font-semibold`}>Barang Titipan</th>
                            <th className={`${sel} text-right font-semibold`}>Harga Titip</th>
                            <th className={`${sel} text-right font-semibold`}>Sisa Stok</th>
                            <th className={`${sel} text-right font-semibold`}>Terjual Belum Diselesaikan</th>
                            <th className={`${sel} text-right font-semibold`}>Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {p.barang.map((b) => (
                            <tr key={b.id} className="odd:bg-white even:bg-gray-50">
                                <td className={`${sel} font-medium`}>{b.sku}</td>
                                <td className={sel}>
                                    {b.nama} ({b.ukuran}, {b.warna})
                                </td>
                                <td className={`${sel} text-right`}>{formatRupiah(b.harga_titip)}</td>
                                <td className={`${sel} text-right`}>{b.stok}</td>
                                <td className={`${sel} text-right`}>{b.terjual}</td>
                                <td className={`${sel} text-right`}>{formatRupiah(b.terjual * b.harga_titip)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-line bg-gray-50 px-4 py-3 text-sm">
                {p.periode_awal === null ? (
                    <span className="text-gray-500">Belum ada PO konsinyasi untuk pemasok ini.</span>
                ) : p.periode_awal > hariIni ? (
                    <span className="text-gray-500">Sudah diselesaikan sampai hari ini. Periode berikutnya mulai {formatTanggal(p.periode_awal)}.</span>
                ) : bisaBuat ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <span>Periode mulai {formatTanggal(p.periode_awal)} sampai</span>
                        <input
                            type="date"
                            value={akhir}
                            min={p.periode_awal}
                            max={hariIni}
                            onChange={(e) => setAkhir(e.target.value)}
                            aria-label={`Periode akhir ${p.nama}`}
                            className="rounded border border-line bg-white px-2 py-1.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                        <Button size="sm" onClick={() => setKonfirmasi(true)} disabled={!akhir}>
                            Buat Penyelesaian
                        </Button>
                    </div>
                ) : (
                    <span className="text-gray-500">Periode berjalan mulai {formatTanggal(p.periode_awal)}.</span>
                )}
            </div>

            <ConfirmModal
                open={konfirmasi}
                title="Buat Penyelesaian Konsinyasi"
                message={`Tagih penjualan titipan ${p.nama} sampai ${formatTanggal(akhir)}?${
                    akhir === hariIni ? ' Perhatian: barang yang baru dikirim hari ini SETELAH penyelesaian dibuat tidak akan ikut ditagih. Pilih tanggal kemarin bila pengiriman hari ini belum selesai.' : ''
                }`}
                confirmLabel="Ya, Buat"
                processing={processing}
                onConfirm={buat}
                onCancel={() => setKonfirmasi(false)}
            />
        </div>
    );
}

export default function Index({ pemasok, penyelesaian, filters, hariIni }: Props) {
    return (
        <AdminLayout title="Konsinyasi">
            <PageHeader title="Konsinyasi (Titip Jual)" breadcrumbs={[{ label: 'Keuangan' }, { label: 'Konsinyasi' }]} />
            <p className="mb-3 text-sm text-gray-600">Barang titipan dibayar setelah terjual (pesanan sudah dikirim), sebesar jumlah terjual × harga titip.</p>

            {pemasok.length === 0 && <div className="mb-4 rounded border border-line bg-white px-4 py-6 text-center text-sm text-gray-500">Belum ada barang konsinyasi.</div>}
            {pemasok.map((p) => (
                <KartuPemasok key={p.id} p={p} hariIni={hariIni} />
            ))}

            <h2 className="mb-2 text-sm font-semibold text-gray-900">Riwayat Penyelesaian</h2>
            <DataTable
                data={penyelesaian}
                url="/konsinyasi"
                search={filters.search}
                searchPlaceholder="Cari nomor atau pemasok..."
                emptyText="Belum ada penyelesaian."
                columns={[
                    { header: 'Nomor', cell: (r) => <span className="font-medium">{r.no_penyelesaian}</span> },
                    { header: 'Pemasok', cell: (r) => r.pemasok?.nama ?? '-' },
                    { header: 'Periode', cell: (r) => `${formatTanggal(r.periode_awal)} - ${formatTanggal(r.periode_akhir)}` },
                    { header: 'Jatuh Tempo', cell: (r) => formatTanggal(r.jatuh_tempo) },
                    { header: 'Total', cell: (r) => formatRupiah(r.total), className: 'text-right whitespace-nowrap' },
                    { header: 'Status', cell: (r) => <StatusBadge status={statusTagihan(r.total, r.dibayar, r.jatuh_tempo, hariIni)} /> },
                ]}
                actions={(r) => (
                    <div className="flex justify-center">
                        <LinkButton href={`/konsinyasi/${r.id}`} variant="secondary" size="sm">
                            Detail
                        </LinkButton>
                    </div>
                )}
            />
        </AdminLayout>
    );
}
