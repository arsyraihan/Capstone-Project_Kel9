import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import RowActions from '@/components/RowActions';
import StatusBadge from '@/components/StatusBadge';
import useHapus from '@/hooks/useHapus';
import { Paginated, Pengguna } from '@/types';
import { Plus } from 'lucide-react';

interface Props {
    pengguna: Paginated<Pengguna>;
    filters: { search: string };
}

export default function Index({ pengguna, filters }: Props) {
    const hapus = useHapus<Pengguna>('/pengguna');

    return (
        <AdminLayout title="Pengguna">
            <PageHeader title="Data Pengguna" breadcrumbs={[{ label: 'Lainnya' }, { label: 'Pengguna' }]}>
                <LinkButton href="/pengguna/create">
                    <Plus className="size-4" />
                    Tambah Pengguna
                </LinkButton>
            </PageHeader>

            <DataTable
                data={pengguna}
                url="/pengguna"
                search={filters.search}
                searchPlaceholder="Cari nama atau email..."
                columns={[
                    { header: 'Nama', cell: (r) => <span className="font-medium">{r.name}</span> },
                    { header: 'Email', cell: (r) => r.email },
                    { header: 'Peran', cell: (r) => <StatusBadge status={r.role} /> },
                ]}
                actions={(r) => <RowActions editHref={`/pengguna/${r.id}/edit`} onDelete={() => hapus.setTarget(r)} />}
            />

            <ConfirmModal
                open={hapus.target !== null}
                title="Hapus Pengguna"
                message={`Yakin ingin menghapus pengguna ${hapus.target?.name}? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={hapus.processing}
                onConfirm={hapus.konfirmasi}
                onCancel={() => hapus.setTarget(null)}
            />
        </AdminLayout>
    );
}
