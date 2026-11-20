import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import RowActions from '@/components/RowActions';
import SelectInput from '@/components/SelectInput';
import StatusBadge from '@/components/StatusBadge';
import useAuth from '@/hooks/useAuth';
import { formatTanggal } from '@/lib/format';
import { Paginated, Pesanan } from '@/types';

interface Props {
    pesanan: Paginated<Pesanan>;
    daftarStatus: string[];
    filters: { search: string; status: string };
}

export default function Index({ pesanan, daftarStatus, filters }: Props) {
    // Hanya Staf Pengadaan & CO yang boleh membuat/mengubah/membatalkan pesanan; peran lain melihat saja.
    const bisaKelola = useAuth().is('pengadaan');
    const [batal, setBatal] = useState<Pesanan | null>(null);
    const [processing, setProcessing] = useState(false);

    const filterStatus = (nilai: string) => {
        router.get('/pesanan', { search: filters.search || undefined, status: nilai || undefined }, { preserveState: true, replace: true });
    };

    const konfirmasiBatal = () => {
        if (!batal) {
            return;
        }
        router.post(
            `/pesanan/${batal.id}/batal`,
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setBatal(null);
                },
            },
        );
    };

    return (
        <AdminLayout title="Pesanan">
            <PageHeader title="Pesanan Pelanggan" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pesanan' }]}>
                {bisaKelola && (
                    <LinkButton href="/pesanan/create">
                        <Plus className="size-4" />
                        Buat Pesanan
                    </LinkButton>
                )}
            </PageHeader>

            <DataTable
                data={pesanan}
                url="/pesanan"
                search={filters.search}
                searchPlaceholder="Cari nomor pesanan atau pelanggan..."
                extraParams={{ status: filters.status || undefined }}
                toolbar={
                    <div className="w-full sm:w-52">
                        <SelectInput aria-label="Filter status" value={filters.status} onChange={(e) => filterStatus(e.target.value)}>
                            <option value="">Semua status</option>
                            {daftarStatus.map((s) => (
                                <option key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                            ))}
                        </SelectInput>
                    </div>
                }
                columns={[
                    { header: 'No. Pesanan', cell: (r) => <span className="font-medium">{r.no_pesanan}</span> },
                    { header: 'Tanggal', cell: (r) => formatTanggal(r.tanggal) },
                    { header: 'Pelanggan', cell: (r) => r.pelanggan?.nama ?? '-' },
                    { header: 'Jenis Barang', cell: (r) => r.detail?.length ?? 0, className: 'text-right' },
                    { header: 'Total Pcs', cell: (r) => (r.detail ?? []).reduce((total, d) => total + d.jumlah, 0), className: 'text-right' },
                    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                ]}
                actions={(r) => (
                    <RowActions
                        showHref={`/pesanan/${r.id}`}
                        editHref={bisaKelola && r.status === 'baru' ? `/pesanan/${r.id}/edit` : undefined}
                        onBatal={bisaKelola && r.status === 'baru' ? () => setBatal(r) : undefined}
                    />
                )}
            />

            <ConfirmModal
                open={batal !== null}
                title="Batalkan Pesanan"
                message={`Yakin ingin membatalkan pesanan ${batal?.no_pesanan}? Pesanan yang dibatalkan tidak dapat diproses lagi.`}
                confirmLabel="Ya, Batalkan"
                variant="danger"
                processing={processing}
                onConfirm={konfirmasiBatal}
                onCancel={() => setBatal(null)}
            />
        </AdminLayout>
    );
}
