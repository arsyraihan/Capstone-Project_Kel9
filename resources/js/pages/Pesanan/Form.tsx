import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/components/AdminLayout';
import FormCard from '@/components/FormCard';
import FormInput, { FormTextarea } from '@/components/FormInput';
import ItemRows, { ItemRow } from '@/components/ItemRows';
import PageHeader from '@/components/PageHeader';
import SelectInput from '@/components/SelectInput';
import { Barang, Pelanggan, Pesanan } from '@/types';

interface Props {
    pesanan: Pesanan | null;
    pelanggan: Pelanggan[];
    barang: Barang[];
    hariIni: string;
}

type FormData = {
    tanggal: string;
    pelanggan_id: string;
    keterangan: string;
    items: ItemRow[];
};

export default function Form({ pesanan, pelanggan, barang, hariIni }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        tanggal: pesanan?.tanggal ?? hariIni,
        pelanggan_id: pesanan ? String(pesanan.pelanggan_id) : '',
        keterangan: pesanan?.keterangan ?? '',
        items: pesanan?.detail?.map((d) => ({ barang_id: String(d.barang_id), jumlah: String(d.jumlah) })) ?? [{ barang_id: '', jumlah: '1' }],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (pesanan) {
            put(`/pesanan/${pesanan.id}`);
        } else {
            post('/pesanan');
        }
    };

    const judul = pesanan ? `Ubah Pesanan ${pesanan.no_pesanan}` : 'Buat Pesanan';

    return (
        <AdminLayout title={judul}>
            <PageHeader title={judul} breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pesanan', href: '/pesanan' }, { label: pesanan ? 'Ubah' : 'Buat Pesanan' }]} />

            <FormCard onSubmit={submit} processing={processing} cancelHref="/pesanan">
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Tanggal" name="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} error={errors.tanggal} />
                    <SelectInput label="Pelanggan" name="pelanggan_id" value={data.pelanggan_id} onChange={(e) => setData('pelanggan_id', e.target.value)} error={errors.pelanggan_id}>
                        <option value="">- Pilih pelanggan -</option>
                        {pelanggan.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.kode_pelanggan} - {p.nama}
                            </option>
                        ))}
                    </SelectInput>
                </div>
                <FormTextarea label="Keterangan" name="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} error={errors.keterangan} />

                <ItemRows items={data.items} onChange={(items) => setData('items', items)} barang={barang} errors={errors as Record<string, string | undefined>} showStok />

                <p className="text-xs text-gray-500">
                    Stok berkurang saat pesanan diambil oleh Staf Packing (Picker), bukan saat pesanan dibuat. Jumlah berwarna merah berarti melebihi stok yang tersedia saat ini.
                </p>
            </FormCard>
        </AdminLayout>
    );
}
