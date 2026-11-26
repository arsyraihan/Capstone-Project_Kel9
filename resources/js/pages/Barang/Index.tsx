import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import RowActions from '@/components/RowActions';
import StatusBadge from '@/components/StatusBadge';
import useHapus from '@/hooks/useHapus';
import { formatRupiah } from '@/lib/format';
import { Barang, Paginated } from '@/types';
import { Plus } from 'lucide-react';

interface Props {
    barang: Paginated<Barang>;
    filters: { search: string };
}

export default function Index({ barang, filters }: Props) {
    const hapus = useHapus<Barang>('/barang');

    return (
        <AdminLayout title="Barang">
            <PageHeader title="Data Barang" breadcrumbs={[{ label: 'Master Data' }, { label: 'Barang' }]}>
                <LinkButton href="/barang/create">
                    <Plus className="size-4" />
                    Tambah Barang
                </LinkButton>
            </PageHeader>

            <DataTable
                data={barang}
                url="/barang"
                search={filters.search}
                searchPlaceholder="Cari SKU, nama, kategori, warna..."
                columns={[
                    { header: 'SKU', cell: (r) => <span className="font-medium">{r.sku}</span> },
                    { header: 'Nama Barang', cell: (r) => r.nama },
                    { header: 'Kategori', cell: (r) => r.kategori },
                    { header: 'Ukuran', cell: (r) => r.ukuran },
                    { header: 'Warna', cell: (r) => r.warna },
                    { header: 'Stok', cell: (r) => `${r.stok} ${r.satuan}`, className: 'text-right' },
                    { header: 'Rak', cell: (r) => r.rak?.kode_rak ?? '-' },
                    { header: 'Harga Beli', cell: (r) => formatRupiah(r.harga_beli), className: 'text-right whitespace-nowrap' },
                    { header: 'Harga Jual', cell: (r) => formatRupiah(r.harga_jual), className: 'text-right whitespace-nowrap' },
                    { header: 'Jenis Stok', cell: (r) => <StatusBadge status={r.jenis_stok} /> },
                ]}
                actions={(r) => <RowActions editHref={`/barang/${r.id}/edit`} onDelete={() => hapus.setTarget(r)} />}
            />

            <ConfirmModal
                open={hapus.target !== null}
                title="Hapus Barang"
                message={`Yakin ingin menghapus barang ${hapus.target?.sku}? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={hapus.processing}
                onConfirm={hapus.konfirmasi}
                onCancel={() => hapus.setTarget(null)}
            />
        </AdminLayout>
    );
}
