import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import DataTable from '@/components/DataTable';
import FilterStatusBayar from '@/components/FilterStatusBayar';
import JatuhTempo from '@/components/JatuhTempo';
import Kotak from '@/components/Kotak';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import useAuth from '@/hooks/useAuth';
import { formatRupiah, formatTanggal, statusTagihan } from '@/lib/format';
import { Paginated, Pesanan, UmurPiutang } from '@/types';

interface Props {
    pesanan: Paginated<Pesanan>;
    umur: UmurPiutang[];
    filters: { search: string; status: string };
    hariIni: string;
}

export default function Piutang({ pesanan, umur, filters, hariIni }: Props) {
    const bisaTerima = useAuth().is('manajemen');
    const status = (r: Pesanan) => statusTagihan(r.total, r.dibayar, r.jatuh_tempo, hariIni);

    return (
        <AdminLayout title="Piutang Pelanggan">
            <PageHeader title="Piutang Pelanggan" breadcrumbs={[{ label: 'Keuangan' }, { label: 'Piutang Pelanggan' }]} />

            <h2 className="mb-2 text-sm font-semibold text-gray-900">Umur Piutang</h2>
            <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {umur.map((u, i) => (
                    <Kotak key={u.label} label={u.label} nilai={formatRupiah(u.nilai)} keterangan={`${u.jumlah} pesanan`} merah={i > 0 && u.nilai > 0} />
                ))}
            </div>

            <DataTable
                data={pesanan}
                url="/keuangan/piutang"
                search={filters.search}
                searchPlaceholder="Cari nomor pesanan atau pelanggan..."
                extraParams={{ status: filters.status || undefined }}
                toolbar={<FilterStatusBayar url="/keuangan/piutang" status={filters.status} search={filters.search} />}
                columns={[
                    { header: 'No. Pesanan', cell: (r) => <span className="font-medium">{r.no_pesanan}</span> },
                    { header: 'Pelanggan', cell: (r) => r.pelanggan?.nama ?? '-' },
                    { header: 'Cara Bayar', cell: (r) => <StatusBadge status={r.cara_bayar} /> },
                    { header: 'Dikirim', cell: (r) => formatTanggal(r.tanggal_kirim) },
                    { header: 'Jatuh Tempo', cell: (r) => <JatuhTempo tanggal={r.jatuh_tempo} hariIni={hariIni} lunas={status(r) === 'lunas'} /> },
                    { header: 'Total', cell: (r) => formatRupiah(r.total), className: 'text-right whitespace-nowrap' },
                    { header: 'Sisa', cell: (r) => formatRupiah(Math.max(0, r.total - Number(r.dibayar ?? 0))), className: 'text-right whitespace-nowrap' },
                    { header: 'Status', cell: (r) => <StatusBadge status={status(r)} /> },
                ]}
                actions={(r) => (
                    <div className="flex justify-center gap-1.5">
                        <LinkButton href={`/pesanan/${r.id}`} variant="secondary" size="sm">
                            Detail
                        </LinkButton>
                        {bisaTerima && status(r) !== 'lunas' && (
                            <LinkButton href={`/keuangan/bayar/piutang/${r.id}`} size="sm">
                                Terima Bayar
                            </LinkButton>
                        )}
                    </div>
                )}
            />
        </AdminLayout>
    );
}
