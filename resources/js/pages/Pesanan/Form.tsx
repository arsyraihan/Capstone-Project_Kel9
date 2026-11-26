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
    cara_bayar: 'tunai' | 'tempo';
    keterangan: string;
    items: ItemRow[];
};

export default function Form({ pesanan, pelanggan, barang, hariIni }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        tanggal: pesanan?.tanggal ?? hariIni,
        pelanggan_id: pesanan ? String(pesanan.pelanggan_id) : '',
        keterangan: pesanan?.keterangan ?? '',
        cara_bayar: pesanan?.cara_bayar ?? 'tunai',
        items: pesanan?.detail?.map((d) => ({ barang_id: String(d.barang_id), jumlah: String(d.jumlah), harga_satuan: String(d.harga_satuan) })) ?? [{ barang_id: '', jumlah: '1', harga_satuan: '0' }],
    });

    const terpilih = pelanggan.find((p) => String(p.id) === data.pelanggan_id);

    // Cara bayar otomatis mengikuti termin pelanggan (tetap bisa diubah).
    const pilihPelanggan = (id: string) => {
        const p = pelanggan.find((x) => String(x.id) === id);
        setData({ ...data, pelanggan_id: id, cara_bayar: p && p.termin_hari > 0 ? 'tempo' : 'tunai' });
    };

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

            <FormCard onSubmit={submit} processing={processing} cancelHref="/pesanan" wide>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Tanggal" name="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} error={errors.tanggal} />
                    <SelectInput label="Pelanggan" name="pelanggan_id" value={data.pelanggan_id} onChange={(e) => pilihPelanggan(e.target.value)} error={errors.pelanggan_id}>
                        <option value="">- Pilih pelanggan -</option>
                        {pelanggan.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.kode_pelanggan} - {p.nama}
                            </option>
                        ))}
                    </SelectInput>
                    <div>
                        <SelectInput label="Cara Bayar" name="cara_bayar" value={data.cara_bayar} onChange={(e) => setData('cara_bayar', e.target.value as FormData['cara_bayar'])} error={errors.cara_bayar}>
                            <option value="tunai">Tunai (bayar saat barang diterima)</option>
                            <option value="tempo">Tempo / kredit</option>
                        </SelectInput>
                        {data.cara_bayar === 'tempo' && terpilih && <p className="mt-1 text-xs text-gray-500">Jatuh tempo {terpilih.termin_hari} hari setelah dikirim.</p>}
                    </div>
                </div>
                <FormTextarea label="Keterangan" name="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} error={errors.keterangan} />

                <ItemRows items={data.items} onChange={(items) => setData('items', items)} barang={barang} errors={errors as Record<string, string | undefined>} showStok harga="harga_jual" />

                <p className="text-xs text-gray-500">
                    Stok berkurang saat pesanan diambil oleh Staf Packing (Picker), bukan saat pesanan dibuat. Jumlah berwarna merah berarti melebihi stok yang tersedia saat ini.
                </p>
            </FormCard>
        </AdminLayout>
    );
}
