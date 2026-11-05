import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatWaktu } from '@/lib/format';
import { Barang, MutasiStok, Paginated } from '@/types';

interface Props {
    barang: Barang;
    mutasi: Paginated<MutasiStok>;
}

export default function Kartu({ barang, mutasi }: Props) {
    return (
        <AdminLayout title={`Kartu Stok ${barang.sku}`}>
            <PageHeader title={`Kartu Stok ${barang.sku}`} breadcrumbs={[{ label: 'Transaksi' }, { label: 'Stok', href: '/stok' }, { label: 'Kartu Stok' }]}>
                <LinkButton href="/stok" variant="secondary">
                    Kembali
                </LinkButton>
            </PageHeader>

            <div className="mb-4 grid gap-4 rounded border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="text-xs text-gray-500">Nama Barang</div>
                    <div className="text-sm">{barang.nama}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500">Kategori / Ukuran / Warna</div>
                    <div className="text-sm">
                        {barang.kategori} / {barang.ukuran} / {barang.warna}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-500">Stok Saat Ini</div>
                    <div className={`text-sm font-semibold ${barang.stok <= barang.stok_minimum ? 'text-danger' : ''}`}>
                        {barang.stok} {barang.satuan} (minimum {barang.stok_minimum})
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-500">Lokasi Rak</div>
                    <div className="text-sm">{barang.rak?.kode_rak ?? '-'}</div>
                </div>
            </div>

            <DataTable
                data={mutasi}
                url={`/stok/${barang.id}/kartu`}
                hideSearch
                hideActions
                emptyText="Belum ada mutasi stok untuk barang ini."
                columns={[
                    { header: 'Tanggal', cell: (r) => formatWaktu(r.tanggal) },
                    { header: 'Jenis', cell: (r) => <StatusBadge status={r.jenis} /> },
                    { header: 'Referensi', cell: (r) => <span className="font-medium">{r.referensi}</span> },
                    {
                        header: 'Jumlah',
                        cell: (r) => <span className={r.jenis === 'masuk' ? 'text-green-700' : 'text-red-700'}>{`${r.jenis === 'masuk' ? '+' : '-'}${r.jumlah}`}</span>,
                        className: 'text-right',
                    },
                    { header: 'Stok Akhir', cell: (r) => r.stok_akhir, className: 'text-right' },
                    { header: 'Keterangan', cell: (r) => r.keterangan ?? '-' },
                    { header: 'Petugas', cell: (r) => r.user?.name ?? '-' },
                ]}
            />
        </AdminLayout>
    );
}
