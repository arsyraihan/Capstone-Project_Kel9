import { router } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import FormInput from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import { formatTanggal } from '@/lib/format';
import { Paginated, Pesanan } from '@/types';

interface Props {
    pesanan: Paginated<Pesanan>;
    filters: { search: string };
}

export default function Index({ pesanan, filters }: Props) {
    const [target, setTarget] = useState<Pesanan | null>(null);
    const [koli, setKoli] = useState('1');
    const [error, setError] = useState<string>();
    const [processing, setProcessing] = useState(false);

    const buka = (r: Pesanan) => {
        setTarget(r);
        setKoli('1');
        setError(undefined);
    };

    const konfirmasi = () => {
        if (!target) {
            return;
        }
        router.post(
            `/pengemasan/${target.id}`,
            { jumlah_koli: koli },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onError: (errors) => setError(errors.jumlah_koli),
                onSuccess: () => setTarget(null),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AdminLayout title="Pengemasan">
            <PageHeader title="Pengemasan Barang" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pengemasan' }]} />

            <p className="mb-3 text-sm text-gray-600">Pesanan yang sudah diambil dan menunggu dikemas. Isi jumlah koli setelah selesai mengemas.</p>

            <DataTable
                data={pesanan}
                url="/pengemasan"
                search={filters.search}
                searchPlaceholder="Cari nomor pesanan atau pelanggan..."
                emptyText="Tidak ada pesanan yang menunggu pengemasan."
                columns={[
                    { header: 'No. Pesanan', cell: (r) => <span className="font-medium">{r.no_pesanan}</span> },
                    { header: 'Tanggal', cell: (r) => formatTanggal(r.tanggal) },
                    { header: 'Pelanggan', cell: (r) => r.pelanggan?.nama ?? '-' },
                    { header: 'Jenis Barang', cell: (r) => r.detail?.length ?? 0, className: 'text-right' },
                    { header: 'Total Pcs', cell: (r) => (r.detail ?? []).reduce((total, d) => total + d.jumlah, 0), className: 'text-right' },
                ]}
                actions={(r) => (
                    <div className="flex justify-center">
                        <Button size="sm" onClick={() => buka(r)}>
                            <Package className="size-3.5" />
                            Sudah Dikemas
                        </Button>
                    </div>
                )}
            />

            <ConfirmModal
                open={target !== null}
                title="Konfirmasi Pengemasan"
                message={`Isi jumlah koli untuk pesanan ${target?.no_pesanan}.`}
                confirmLabel="Simpan, Sudah Dikemas"
                processing={processing}
                confirmDisabled={!koli || Number(koli) < 1}
                onConfirm={konfirmasi}
                onCancel={() => setTarget(null)}
            >
                <FormInput label="Jumlah Koli" name="jumlah_koli" type="number" min={1} value={koli} onChange={(e) => setKoli(e.target.value)} error={error} autoFocus />
            </ConfirmModal>
        </AdminLayout>
    );
}
