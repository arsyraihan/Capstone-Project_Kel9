import { router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button, { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatTanggal } from '@/lib/format';
import { Pembelian } from '@/types';

function Info({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{children}</dd>
        </div>
    );
}

export default function Show({ pembelian }: { pembelian: Pembelian }) {
    const [hapus, setHapus] = useState(false);
    const detail = pembelian.detail ?? [];
    const dapatDiubah = pembelian.status === 'dipesan';

    return (
        <AdminLayout title={`PO ${pembelian.no_po}`}>
            <PageHeader title={`Purchase Order ${pembelian.no_po}`} breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pengadaan', href: '/pengadaan' }, { label: 'Detail' }]}>
                {dapatDiubah && (
                    <>
                        <LinkButton href={`/pengadaan/${pembelian.id}/edit`} variant="secondary">
                            <Pencil className="size-4" />
                            Ubah
                        </LinkButton>
                        <Button variant="danger" onClick={() => setHapus(true)}>
                            <Trash2 className="size-4" />
                            Hapus
                        </Button>
                    </>
                )}
            </PageHeader>

            <div className="mb-4 rounded border border-line bg-white p-5">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Info label="Tanggal PO">{formatTanggal(pembelian.tanggal)}</Info>
                    <Info label="Pemasok">{pembelian.pemasok?.nama ?? '-'}</Info>
                    <Info label="Status">
                        <StatusBadge status={pembelian.status} />
                    </Info>
                    <Info label="Dibuat oleh">{pembelian.pembuat?.name ?? '-'}</Info>
                    <Info label="Tanggal diterima">{formatTanggal(pembelian.tanggal_terima)}</Info>
                    <Info label="Diterima oleh">{pembelian.penerima?.name ?? '-'}</Info>
                    <div className="sm:col-span-2">
                        <Info label="Keterangan">
                            <span className="whitespace-pre-line">{pembelian.keterangan || '-'}</span>
                        </Info>
                    </div>
                </dl>
            </div>

            <div className="rounded border border-line bg-white">
                <div className="border-b border-line px-4 py-3 text-sm font-semibold text-gray-900">Daftar Barang</div>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className="w-14 border border-line px-3 py-2 text-center font-semibold">No</th>
                            <th className="border border-line px-3 py-2 font-semibold">SKU</th>
                            <th className="border border-line px-3 py-2 font-semibold">Nama Barang</th>
                            <th className="border border-line px-3 py-2 text-right font-semibold">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detail.map((d, i) => (
                            <tr key={d.id} className="odd:bg-white even:bg-gray-50">
                                <td className="border border-line px-3 py-2 text-center">{i + 1}</td>
                                <td className="border border-line px-3 py-2 font-medium">{d.barang?.sku}</td>
                                <td className="border border-line px-3 py-2">
                                    {d.barang?.nama} ({d.barang?.ukuran}, {d.barang?.warna})
                                </td>
                                <td className="border border-line px-3 py-2 text-right">
                                    {d.jumlah} {d.barang?.satuan}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100 font-semibold">
                            <td colSpan={3} className="border border-line px-3 py-2 text-right">
                                Total
                            </td>
                            <td className="border border-line px-3 py-2 text-right">{detail.reduce((t, d) => t + d.jumlah, 0)} pcs</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                open={hapus}
                title="Hapus Purchase Order"
                message={`Yakin ingin menghapus PO ${pembelian.no_po}? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                onConfirm={() => router.delete(`/pengadaan/${pembelian.id}`)}
                onCancel={() => setHapus(false)}
            />
        </AdminLayout>
    );
}
