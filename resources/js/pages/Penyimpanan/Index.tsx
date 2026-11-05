import { router } from '@inertiajs/react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import { Barang, Paginated, Rak } from '@/types';

interface Props {
    barang: Paginated<Barang>;
    rak: Rak[];
    filters: { search: string };
}

export default function Index({ barang, rak, filters }: Props) {
    const pindah = (item: Barang, rakId: string) => {
        router.patch(`/penyimpanan/${item.id}`, { rak_id: rakId || null }, { preserveScroll: true, preserveState: true });
    };

    return (
        <AdminLayout title="Penyimpanan">
            <PageHeader title="Penyimpanan Barang" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Penyimpanan' }]} />

            <p className="mb-3 text-sm text-gray-600">Pilih rak pada kolom Aksi untuk memindahkan lokasi simpan barang. Perubahan tersimpan otomatis.</p>

            <DataTable
                data={barang}
                url="/penyimpanan"
                search={filters.search}
                searchPlaceholder="Cari SKU, nama, kategori, atau warna..."
                columns={[
                    { header: 'SKU', cell: (r) => <span className="font-medium">{r.sku}</span> },
                    { header: 'Nama Barang', cell: (r) => r.nama },
                    { header: 'Ukuran', cell: (r) => r.ukuran },
                    { header: 'Warna', cell: (r) => r.warna },
                    { header: 'Stok', cell: (r) => `${r.stok} ${r.satuan}`, className: 'text-right' },
                    { header: 'Rak Saat Ini', cell: (r) => r.rak?.kode_rak ?? <span className="text-gray-400">Belum ditempatkan</span> },
                ]}
                actions={(r) => (
                    <select
                        aria-label={`Rak untuk ${r.sku}`}
                        value={r.rak_id ?? ''}
                        onChange={(e) => pindah(r, e.target.value)}
                        className="w-full rounded border border-line bg-white px-2 py-1 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                    >
                        <option value="">- Belum ditempatkan -</option>
                        {rak.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.kode_rak}
                            </option>
                        ))}
                    </select>
                )}
            />
        </AdminLayout>
    );
}
