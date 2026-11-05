import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import RowActions from '@/components/RowActions';
import useHapus from '@/hooks/useHapus';
import { Paginated, Rak } from '@/types';
import { Plus } from 'lucide-react';

interface Props {
    rak: Paginated<Rak>;
    filters: { search: string };
}

export default function Index({ rak, filters }: Props) {
    const hapus = useHapus<Rak>('/rak');

    return (
        <AdminLayout title="Rak">
            <PageHeader title="Data Rak" breadcrumbs={[{ label: 'Master Data' }, { label: 'Rak' }]}>
                <LinkButton href="/rak/create">
                    <Plus className="size-4" />
                    Tambah Rak
                </LinkButton>
            </PageHeader>

            <DataTable
                data={rak}
                url="/rak"
                search={filters.search}
                searchPlaceholder="Cari kode atau keterangan rak..."
                columns={[
                    { header: 'Kode Rak', cell: (r) => <span className="font-medium">{r.kode_rak}</span> },
                    { header: 'Keterangan', cell: (r) => r.keterangan ?? '-' },
                ]}
                actions={(r) => <RowActions editHref={`/rak/${r.id}/edit`} onDelete={() => hapus.setTarget(r)} />}
            />

            <ConfirmModal
                open={hapus.target !== null}
                title="Hapus Rak"
                message={`Yakin ingin menghapus rak ${hapus.target?.kode_rak}? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus"
                variant="danger"
                processing={hapus.processing}
                onConfirm={hapus.konfirmasi}
                onCancel={() => hapus.setTarget(null)}
            />
        </AdminLayout>
    );
}
