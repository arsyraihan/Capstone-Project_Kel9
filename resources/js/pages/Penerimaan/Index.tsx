import { PackageCheck } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatTanggal } from '@/lib/format';
import { Paginated, Pembelian } from '@/types';

interface Props {
    pembelian: Paginated<Pembelian>;
    filters: { search: string };
}

export default function Index({ pembelian, filters }: Props) {
    return (
        <AdminLayout title="Penerimaan">
            <PageHeader title="Penerimaan Barang" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Penerimaan' }]} />

            <p className="mb-3 text-sm text-gray-600">Daftar Purchase Order yang masih menunggu kedatangan barang.</p>

            <DataTable
                data={pembelian}
                url="/penerimaan"
                search={filters.search}
                searchPlaceholder="Cari nomor PO atau pemasok..."
                emptyText="Tidak ada PO yang menunggu penerimaan."
                columns={[
                    { header: 'No. PO', cell: (r) => <span className="font-medium">{r.no_po}</span> },
                    { header: 'Tanggal', cell: (r) => formatTanggal(r.tanggal) },
                    { header: 'Pemasok', cell: (r) => r.pemasok?.nama ?? '-' },
                    { header: 'Jenis Barang', cell: (r) => r.detail?.length ?? 0, className: 'text-right' },
                    { header: 'Total Pcs', cell: (r) => (r.detail ?? []).reduce((total, d) => total + d.jumlah, 0), className: 'text-right' },
                    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                ]}
                actions={(r) => (
                    <div className="flex justify-center">
                        <LinkButton href={`/penerimaan/${r.id}`} size="sm">
                            <PackageCheck className="size-3.5" />
                            Proses Penerimaan
                        </LinkButton>
                    </div>
                )}
            />
        </AdminLayout>
    );
}
