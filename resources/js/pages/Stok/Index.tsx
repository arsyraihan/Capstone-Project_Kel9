import { router } from '@inertiajs/react';
import { History } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { LinkButton } from '@/components/Button';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import SelectInput from '@/components/SelectInput';
import { Barang, Paginated } from '@/types';

interface Props {
    barang: Paginated<Barang>;
    kategori: string[];
    filters: { search: string; kategori: string };
}

export default function Index({ barang, kategori, filters }: Props) {
    const filterKategori = (nilai: string) => {
        router.get('/stok', { search: filters.search || undefined, kategori: nilai || undefined }, { preserveState: true, replace: true });
    };

    const dibawahMinimum = (b: Barang) => b.stok <= b.stok_minimum;

    return (
        <AdminLayout title="Stok">
            <PageHeader title="Stok Barang" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Stok' }]} />

            <DataTable
                data={barang}
                url="/stok"
                search={filters.search}
                searchPlaceholder="Cari SKU, nama, kategori, warna..."
                extraParams={{ kategori: filters.kategori || undefined }}
                toolbar={
                    <div className="w-full sm:w-56">
                        <SelectInput aria-label="Filter kategori" value={filters.kategori} onChange={(e) => filterKategori(e.target.value)}>
                            <option value="">Semua kategori</option>
                            {kategori.map((k) => (
                                <option key={k} value={k}>
                                    {k}
                                </option>
                            ))}
                        </SelectInput>
                    </div>
                }
                rowClassName={(r) => (dibawahMinimum(r) ? '!bg-red-50 text-red-800' : '')}
                columns={[
                    { header: 'SKU', cell: (r) => <span className="font-medium">{r.sku}</span> },
                    { header: 'Nama Barang', cell: (r) => r.nama },
                    { header: 'Kategori', cell: (r) => r.kategori },
                    { header: 'Ukuran', cell: (r) => r.ukuran },
                    { header: 'Warna', cell: (r) => r.warna },
                    { header: 'Stok', cell: (r) => <span className="font-semibold">{`${r.stok} ${r.satuan}`}</span>, className: 'text-right' },
                    { header: 'Min.', cell: (r) => r.stok_minimum, className: 'text-right' },
                    { header: 'Rak', cell: (r) => r.rak?.kode_rak ?? '-' },
                    {
                        header: 'Keterangan',
                        cell: (r) => (dibawahMinimum(r) ? <span className="font-medium text-danger">Di bawah minimum</span> : <span className="text-gray-500">Aman</span>),
                    },
                ]}
                actions={(r) => (
                    <div className="flex justify-center">
                        <LinkButton href={`/stok/${r.id}/kartu`} variant="secondary" size="sm">
                            <History className="size-3.5" />
                            Kartu Stok
                        </LinkButton>
                    </div>
                )}
            />
        </AdminLayout>
    );
}
