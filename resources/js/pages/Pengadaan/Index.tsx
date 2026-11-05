import { Plus } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import RowActions from '@/components/RowActions';
import StatusBadge from '@/components/StatusBadge';
import useHapus from '@/hooks/useHapus';
import { formatTanggal } from '@/lib/format';
import { Paginated, Pembelian } from '@/types';

interface Props {
    pembelian: Paginated<Pembelian>;
    filters: { search: string };
}

export default function Index({ pembelian, filters }: Props) {
    const hapus = useHapus<Pembelian>('/pengadaan');

    return (
        <AdminLayout title="Pengadaan">
            <PageHeader title="Pengadaan (Purchase Order)" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pengadaan' }]}>
                <LinkButton href="/pengadaan/create">
                    <Plus className="size-4" />
                    Buat PO
                </LinkButton>
            </PageHeader>

            <DataTable
                data={pembelian}
                url="/pengadaan"
                search={filters.search}
                searchPlaceholder="Cari nomor PO atau pemasok..."
                columns={[
                    { header: 'No. PO', cell: (r) => <span className="font-medium">{r.no_po}</span> },
                    { header: 'Tanggal', cell: (r) => formatTanggal(r.tanggal) },
                    { header: 'Pemasok', cell: (r) => r.pemasok?.nama ?? '-' },
                    { header: 'Jenis Barang', cell: (r) => r.detail?.length ?? 0, className: 'text-right' },
                    { header: 'Total Pcs', cell: (r) => (r.detail ?? []).reduce((total, d) => total + d.jumlah, 0), className: 'text-right' },
                    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                ]}
                actions={(r) => (
                    <RowActions
                        showHref={`/pengadaan/${r.id}`}
                        editHref={r.status === 'dipesan' ? `/pengadaan/${r.id}/edit` : undefined}
                        onDelete={r.status === 'dipesan' ? () => hapus.setTarget(r) : undefined}
                    />
                )}
            />

            <ConfirmModal
                open={hapus.target !== null}
                title="Hapus Purchase Order"
                message={`Yakin ingin menghapus PO ${hapus.target?.no_po}? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={hapus.processing}
                onConfirm={hapus.konfirmasi}
                onCancel={() => hapus.setTarget(null)}
            />
        </AdminLayout>
    );
}
