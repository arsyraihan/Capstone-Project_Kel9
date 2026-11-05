import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import RowActions from '@/components/RowActions';
import useHapus from '@/hooks/useHapus';
import { Paginated, Pemasok } from '@/types';
import { Plus } from 'lucide-react';

interface Props {
    pemasok: Paginated<Pemasok>;
    filters: { search: string };
}

export default function Index({ pemasok, filters }: Props) {
    const hapus = useHapus<Pemasok>('/pemasok');

    return (
        <AdminLayout title="Pemasok">
            <PageHeader title="Data Pemasok" breadcrumbs={[{ label: 'Master Data' }, { label: 'Pemasok' }]}>
                <LinkButton href="/pemasok/create">
                    <Plus className="size-4" />
                    Tambah Pemasok
                </LinkButton>
            </PageHeader>

            <DataTable
                data={pemasok}
                url="/pemasok"
                search={filters.search}
                searchPlaceholder="Cari kode, nama, atau alamat..."
                columns={[
                    { header: 'Kode', cell: (r) => <span className="font-medium">{r.kode_pemasok}</span> },
                    { header: 'Nama Pemasok', cell: (r) => r.nama },
                    { header: 'Telepon', cell: (r) => r.telepon ?? '-' },
                    { header: 'Alamat', cell: (r) => r.alamat ?? '-' },
                ]}
                actions={(r) => <RowActions editHref={`/pemasok/${r.id}/edit`} onDelete={() => hapus.setTarget(r)} />}
            />

            <ConfirmModal
                open={hapus.target !== null}
                title="Hapus Pemasok"
                message={`Yakin ingin menghapus pemasok ${hapus.target?.nama}? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={hapus.processing}
                onConfirm={hapus.konfirmasi}
                onCancel={() => hapus.setTarget(null)}
            />
        </AdminLayout>
    );
}
