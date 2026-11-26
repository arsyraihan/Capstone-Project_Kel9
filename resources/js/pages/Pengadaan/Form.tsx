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
    cara_bayar: 'tunai' | 'tempo' | 'konsinyasi';
    keterangan: string;
    items: ItemRow[];
};

export default function Form({ pembelian, pemasok, barang, hariIni }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        tanggal: pembelian?.tanggal ?? hariIni,
        pemasok_id: pembelian ? String(pembelian.pemasok_id) : '',
        keterangan: pembelian?.keterangan ?? '',
        cara_bayar: pembelian?.cara_bayar ?? 'tunai',
        items: pembelian?.detail?.map((d) => ({ barang_id: String(d.barang_id), jumlah: String(d.jumlah), harga_satuan: String(d.harga_satuan) })) ?? [{ barang_id: '', jumlah: '1', harga_satuan: '0' }],
    });

    // Konsinyasi hanya titipan milik pemasok terpilih; beli putus hanya barang milik sendiri.
    const saring = (pemasokId: string, caraBayar: string) =>
        barang.filter((b) => (caraBayar === 'konsinyasi' ? b.jenis_stok === 'konsinyasi' && String(b.pemasok_id) === pemasokId : b.jenis_stok === 'beli'));

    // Saat pemasok/cara bayar berubah, baris yang barangnya tidak lagi tersedia dikosongkan.
    const ubahSumber = (pemasokId: string, caraBayar: FormData['cara_bayar']) => {
        const boleh = new Set(saring(pemasokId, caraBayar).map((b) => String(b.id)));
        setData({
            ...data,
            pemasok_id: pemasokId,
            cara_bayar: caraBayar,
            items: data.items.map((i) => (i.barang_id === '' || boleh.has(i.barang_id) ? i : { barang_id: '', jumlah: i.jumlah, harga_satuan: '0' })),
        });
    };

    const termin = pemasok.find((p) => String(p.id) === data.pemasok_id)?.termin_hari;
    const penjelasan = {
        tunai: 'Beli putus tunai: hutang jatuh tempo pada hari barang diterima gudang dan dibayar lunas.',
        tempo: `Beli putus kredit: hutang jatuh tempo ${termin === undefined ? 'sesuai termin pemasok' : `${termin} hari`} setelah barang diterima, boleh dicicil.`,
        konsinyasi: 'Titip jual: barang tetap milik pemasok, baru dibayar setelah terjual. Yang tidak laku dapat diretur.',
    }[data.cara_bayar];

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

            <FormCard onSubmit={submit} processing={processing} cancelHref="/pengadaan" wide>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Tanggal" name="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} error={errors.tanggal} />
                    <SelectInput label="Pemasok" name="pemasok_id" value={data.pemasok_id} onChange={(e) => ubahSumber(e.target.value, data.cara_bayar)} error={errors.pemasok_id}>
                        <option value="">- Pilih pemasok -</option>
                        {pemasok.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.kode_pemasok} - {p.nama}
                            </option>
                        ))}
                    </SelectInput>
                    <SelectInput label="Cara Bayar" name="cara_bayar" value={data.cara_bayar} onChange={(e) => ubahSumber(data.pemasok_id, e.target.value as FormData['cara_bayar'])} error={errors.cara_bayar}>
                        <option value="tunai">Tunai (beli putus)</option>
                        <option value="tempo">Tempo / kredit (beli putus)</option>
                        <option value="konsinyasi">Konsinyasi (titip jual)</option>
                    </SelectInput>
                </div>
                <p className="rounded border border-line bg-gray-50 px-3 py-2 text-sm text-gray-600">{penjelasan}</p>
                <FormTextarea label="Keterangan" name="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} error={errors.keterangan} />

                <ItemRows items={data.items} onChange={(items) => setData('items', items)} barang={saring(data.pemasok_id, data.cara_bayar)} errors={errors as Record<string, string | undefined>} harga="harga_beli" />
                {data.cara_bayar === 'konsinyasi' && saring(data.pemasok_id, data.cara_bayar).length === 0 && (
                    <p className="text-xs text-danger">Pemasok ini belum memiliki barang titipan (atau pemasok belum dipilih).</p>
                )}

                {!pembelian && <p className="text-xs text-gray-500">Nomor PO dibuat otomatis (format PO-TANGGAL-001).</p>}
            </FormCard>
        </AdminLayout>
    );
}
