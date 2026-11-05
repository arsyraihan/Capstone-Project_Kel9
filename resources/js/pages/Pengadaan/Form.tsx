import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/components/AdminLayout';
import FormCard from '@/components/FormCard';
import FormInput, { FormTextarea } from '@/components/FormInput';
import ItemRows, { ItemRow } from '@/components/ItemRows';
import PageHeader from '@/components/PageHeader';
import SelectInput from '@/components/SelectInput';
import { Barang, Pembelian, Pemasok } from '@/types';

interface Props {
    pembelian: Pembelian | null;
    pemasok: Pemasok[];
    barang: Barang[];
    hariIni: string;
}

type FormData = {
    tanggal: string;
    pemasok_id: string;
    keterangan: string;
    items: ItemRow[];
};

export default function Form({ pembelian, pemasok, barang, hariIni }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        tanggal: pembelian?.tanggal ?? hariIni,
        pemasok_id: pembelian ? String(pembelian.pemasok_id) : '',
        keterangan: pembelian?.keterangan ?? '',
        items: pembelian?.detail?.map((d) => ({ barang_id: String(d.barang_id), jumlah: String(d.jumlah) })) ?? [{ barang_id: '', jumlah: '1' }],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (pembelian) {
            put(`/pengadaan/${pembelian.id}`);
        } else {
            post('/pengadaan');
        }
    };

    const judul = pembelian ? `Ubah PO ${pembelian.no_po}` : 'Buat Purchase Order';

    return (
        <AdminLayout title={judul}>
            <PageHeader title={judul} breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pengadaan', href: '/pengadaan' }, { label: pembelian ? 'Ubah' : 'Buat PO' }]} />

            <FormCard onSubmit={submit} processing={processing} cancelHref="/pengadaan">
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Tanggal" name="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} error={errors.tanggal} />
                    <SelectInput label="Pemasok" name="pemasok_id" value={data.pemasok_id} onChange={(e) => setData('pemasok_id', e.target.value)} error={errors.pemasok_id}>
                        <option value="">- Pilih pemasok -</option>
                        {pemasok.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.kode_pemasok} - {p.nama}
                            </option>
                        ))}
                    </SelectInput>
                </div>
                <FormTextarea label="Keterangan" name="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} error={errors.keterangan} />

                <ItemRows items={data.items} onChange={(items) => setData('items', items)} barang={barang} errors={errors as Record<string, string | undefined>} />

                {!pembelian && <p className="text-xs text-gray-500">Nomor PO dibuat otomatis (format PO-TANGGAL-001).</p>}
            </FormCard>
        </AdminLayout>
    );
}
