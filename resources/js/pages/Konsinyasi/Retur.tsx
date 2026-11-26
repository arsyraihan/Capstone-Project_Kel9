import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import SelectInput from '@/components/SelectInput';
import { formatWaktu } from '@/lib/format';
import { Barang, MutasiStok } from '@/types';

interface Props {
    barang: Barang[];
    riwayat: (MutasiStok & { barang?: Barang })[];
}

const sel = 'border border-line px-3 py-2';

export default function Retur({ barang, riwayat }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({ barang_id: '', jumlah: '1', keterangan: '' });
    const terpilih = barang.find((b) => String(b.id) === data.barang_id);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/retur-konsinyasi', { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <AdminLayout title="Retur Konsinyasi">
            <PageHeader title="Retur Barang Konsinyasi" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Retur Konsinyasi' }]} />

            <form onSubmit={submit} className="mb-4 max-w-2xl rounded border border-line bg-white">
                <div className="space-y-4 p-5">
                    <SelectInput label="Barang Titipan" name="barang_id" value={data.barang_id} onChange={(e) => setData('barang_id', e.target.value)} error={errors.barang_id}>
                        <option value="">- Pilih barang -</option>
                        {barang.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.sku} - {b.nama} ({b.pemasok?.nama}), stok {b.stok}
                            </option>
                        ))}
                    </SelectInput>
                    <FormInput label="Jumlah Retur" name="jumlah" type="number" min={1} value={data.jumlah} onChange={(e) => setData('jumlah', e.target.value)} error={errors.jumlah} hint={terpilih ? `Stok saat ini ${terpilih.stok} ${terpilih.satuan}.` : undefined} />
                    <FormInput label="Keterangan" name="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} error={errors.keterangan} />
                    <p className="text-xs text-gray-500">Retur mengurangi stok dan mengembalikan barang ke pemiliknya. Retur tidak dihitung sebagai penjualan.</p>
                </div>
                <div className="flex justify-end border-t border-line bg-gray-50 px-5 py-3">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Catat Retur'}
                    </Button>
                </div>
            </form>

            <div className="overflow-x-auto rounded border border-line bg-white">
                <div className="border-b border-line px-4 py-3 text-sm font-semibold text-gray-900">Retur Terbaru</div>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className={`${sel} font-semibold`}>Referensi</th>
                            <th className={`${sel} font-semibold`}>Waktu</th>
                            <th className={`${sel} font-semibold`}>Barang</th>
                            <th className={`${sel} text-right font-semibold`}>Jumlah</th>
                            <th className={`${sel} font-semibold`}>Keterangan</th>
                            <th className={`${sel} font-semibold`}>Oleh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riwayat.length === 0 && (
                            <tr>
                                <td colSpan={6} className={`${sel} py-6 text-center text-gray-500`}>
                                    Belum ada retur.
                                </td>
                            </tr>
                        )}
                        {riwayat.map((r) => (
                            <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                                <td className={`${sel} font-medium`}>{r.referensi}</td>
                                <td className={sel}>{formatWaktu(r.tanggal)}</td>
                                <td className={sel}>{r.barang?.sku}</td>
                                <td className={`${sel} text-right`}>{r.jumlah}</td>
                                <td className={sel}>{r.keterangan}</td>
                                <td className={sel}>{r.user?.name ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
