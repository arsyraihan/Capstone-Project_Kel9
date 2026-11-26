import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import DataTable from '@/components/DataTable';
import FilterStatusBayar from '@/components/FilterStatusBayar';
import JatuhTempo from '@/components/JatuhTempo';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import useAuth from '@/hooks/useAuth';
import { formatRupiah, formatTanggal, statusTagihan } from '@/lib/format';
import { Paginated, Pembelian } from '@/types';

interface Props {
    pembelian: Paginated<Pembelian>;
    filters: { search: string; status: string };
    hariIni: string;
}

export default function Hutang({ pembelian, filters, hariIni }: Props) {
    const bisaBayar = useAuth().is('manajemen');
    const status = (r: Pembelian) => statusTagihan(r.total, r.dibayar, r.jatuh_tempo, hariIni);

    return (
        <AdminLayout title="Hutang Pemasok">
            <PageHeader title="Hutang Pemasok" breadcrumbs={[{ label: 'Keuangan' }, { label: 'Hutang Pemasok' }]} />
            <p className="mb-3 text-sm text-gray-600">Hutang dihitung dari barang yang benar-benar diterima. PO konsinyasi tidak tampil di sini (lihat menu Konsinyasi).</p>

            <DataTable
                data={pembelian}
                url="/keuangan/hutang"
                search={filters.search}
                searchPlaceholder="Cari nomor PO atau pemasok..."
                extraParams={{ status: filters.status || undefined }}
                toolbar={<FilterStatusBayar url="/keuangan/hutang" status={filters.status} search={filters.search} />}
                columns={[
                    { header: 'No. PO', cell: (r) => <span className="font-medium">{r.no_po}</span> },
                    { header: 'Pemasok', cell: (r) => r.pemasok?.nama ?? '-' },
                    { header: 'Cara Bayar', cell: (r) => <StatusBadge status={r.cara_bayar} /> },
                    { header: 'Diterima', cell: (r) => formatTanggal(r.tanggal_terima) },
                    { header: 'Jatuh Tempo', cell: (r) => <JatuhTempo tanggal={r.jatuh_tempo} hariIni={hariIni} lunas={status(r) === 'lunas'} /> },
                    { header: 'Total', cell: (r) => formatRupiah(r.total), className: 'text-right whitespace-nowrap' },
                    { header: 'Sisa', cell: (r) => formatRupiah(Math.max(0, r.total - Number(r.dibayar ?? 0))), className: 'text-right whitespace-nowrap' },
                    { header: 'Status', cell: (r) => <StatusBadge status={status(r)} /> },
                ]}
                actions={(r) => (
                    <div className="flex justify-center gap-1.5">
                        <LinkButton href={`/pengadaan/${r.id}`} variant="secondary" size="sm">
                            Detail
                        </LinkButton>
                        {bisaBayar && status(r) !== 'lunas' && (
                            <LinkButton href={`/keuangan/bayar/hutang/${r.id}`} size="sm">
                                Bayar
                            </LinkButton>
                        )}
                    </div>
                )}
            />
        </AdminLayout>
    );
}
