import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import RowActions from '@/components/RowActions';
import useHapus from '@/hooks/useHapus';
import { Paginated, Pelanggan } from '@/types';
import { Plus } from 'lucide-react';

interface Props {
    pelanggan: Paginated<Pelanggan>;
    filters: { search: string };
}

export default function Index({ pelanggan, filters }: Props) {
    const hapus = useHapus<Pelanggan>('/pelanggan');

    return (
        <AdminLayout title="Pelanggan">
            <PageHeader title="Data Pelanggan" breadcrumbs={[{ label: 'Master Data' }, { label: 'Pelanggan' }]}>
                <LinkButton href="/pelanggan/create">
                    <Plus className="size-4" />
                    Tambah Pelanggan
                </LinkButton>
            </PageHeader>

            <DataTable
                data={pelanggan}
                url="/pelanggan"
                search={filters.search}
                searchPlaceholder="Cari kode, nama, atau alamat..."
                columns={[
                    { header: 'Kode', cell: (r) => <span className="font-medium">{r.kode_pelanggan}</span> },
                    { header: 'Nama Pelanggan', cell: (r) => r.nama },
                    { header: 'Telepon', cell: (r) => r.telepon ?? '-' },
                    { header: 'Alamat', cell: (r) => r.alamat ?? '-' },
                ]}
                actions={(r) => <RowActions editHref={`/pelanggan/${r.id}/edit`} onDelete={() => hapus.setTarget(r)} />}
            />

            <ConfirmModal
                open={hapus.target !== null}
                title="Hapus Pelanggan"
                message={`Yakin ingin menghapus pelanggan ${hapus.target?.nama}? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={hapus.processing}
                onConfirm={hapus.konfirmasi}
                onCancel={() => hapus.setTarget(null)}
            />
        </AdminLayout>
    );
}
