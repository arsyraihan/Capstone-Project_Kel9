import { Plus } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import RowActions from '@/components/RowActions';
import StatusBadge from '@/components/StatusBadge';
import useAuth from '@/hooks/useAuth';
import useHapus from '@/hooks/useHapus';
import { formatRupiah, formatTanggal, statusTagihan, tanggalHariIni } from '@/lib/format';
import { Paginated, Pembelian } from '@/types';

interface Props {
    pembelian: Paginated<Pembelian>;
    filters: { search: string };
}

export default function Index({ pembelian, filters }: Props) {
    const hapus = useHapus<Pembelian>('/pengadaan');
    // Hanya Staf Pengadaan & CO yang boleh membuat/mengubah PO; peran lain melihat saja.
    const bisaKelola = useAuth().is('pengadaan');

    return (
        <AdminLayout title="Pengadaan">
            <PageHeader title="Pengadaan (Purchase Order)" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pengadaan' }]}>
                {bisaKelola && (
                    <LinkButton href="/pengadaan/create">
                        <Plus className="size-4" />
                        Buat PO
                    </LinkButton>
                )}
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
                    { header: 'Nilai', cell: (r) => (r.status === 'diterima' ? formatRupiah(r.total) : '-'), className: 'text-right whitespace-nowrap' },
                    {
                        header: 'Bayar',
                        cell: (r) => (
                            <StatusBadge status={r.status === 'diterima' && r.cara_bayar !== 'konsinyasi' ? statusTagihan(r.total, r.dibayar, r.jatuh_tempo, tanggalHariIni()) : r.cara_bayar} />
                        ),
                    },
                ]}
                actions={(r) => (
                    <RowActions
                        showHref={`/pengadaan/${r.id}`}
                        editHref={bisaKelola && r.status === 'dipesan' ? `/pengadaan/${r.id}/edit` : undefined}
                        onDelete={bisaKelola && r.status === 'dipesan' ? () => hapus.setTarget(r) : undefined}
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
