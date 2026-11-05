import { router } from '@inertiajs/react';
import { PackageOpen } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import { formatTanggal } from '@/lib/format';
import { Paginated, Pesanan } from '@/types';

interface Props {
    pesanan: Paginated<Pesanan>;
    filters: { search: string };
}

export default function Index({ pesanan, filters }: Props) {
    const [target, setTarget] = useState<Pesanan | null>(null);
    const [processing, setProcessing] = useState(false);

    const konfirmasi = () => {
        if (!target) {
            return;
        }
        router.post(
            `/pengambilan/${target.id}`,
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setTarget(null);
                },
            },
        );
    };

    return (
        <AdminLayout title="Pengambilan">
            <PageHeader title="Pengambilan Barang" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pengambilan' }]} />

            <p className="mb-3 text-sm text-gray-600">Ambil barang di rak sesuai daftar, lalu tekan "Sudah Diambil". Stok berkurang saat tombol ditekan. Pesanan terlama ada di atas.</p>

            <DataTable
                data={pesanan}
                url="/pengambilan"
                search={filters.search}
                searchPlaceholder="Cari nomor pesanan atau pelanggan..."
                emptyText="Tidak ada pesanan baru yang menunggu pengambilan."
                columns={[
                    { header: 'No. Pesanan', cell: (r) => <span className="font-medium">{r.no_pesanan}</span> },
                    { header: 'Tanggal', cell: (r) => formatTanggal(r.tanggal) },
                    { header: 'Pelanggan', cell: (r) => r.pelanggan?.nama ?? '-' },
                    {
                        header: 'Barang yang Diambil (lokasi rak)',
                        cell: (r) => (
                            <ul className="space-y-1">
                                {(r.detail ?? []).map((d) => {
                                    const kurang = (d.barang?.stok ?? 0) < d.jumlah;
                                    return (
                                        <li key={d.id} className="flex flex-wrap items-center gap-x-2">
                                            <span className="rounded border border-line bg-white px-1.5 py-0.5 text-xs font-semibold">{d.barang?.rak?.kode_rak ?? 'Tanpa rak'}</span>
                                            <span>
                                                {d.barang?.sku} &times; <strong>{d.jumlah}</strong>
                                            </span>
                                            {kurang && <span className="text-xs font-medium text-danger">(stok hanya {d.barang?.stok})</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        ),
                    },
                ]}
                actions={(r) => (
                    <div className="flex justify-center">
                        <Button size="sm" onClick={() => setTarget(r)}>
                            <PackageOpen className="size-3.5" />
                            Sudah Diambil
                        </Button>
                    </div>
                )}
            />

            <ConfirmModal
                open={target !== null}
                title="Konfirmasi Pengambilan"
                message={`Pesanan ${target?.no_pesanan} sudah diambil seluruhnya? Stok barang akan dikurangi dan status berubah menjadi "diambil".`}
                confirmLabel="Ya, Sudah Diambil"
                processing={processing}
                onConfirm={konfirmasi}
                onCancel={() => setTarget(null)}
            />
        </AdminLayout>
    );
}
