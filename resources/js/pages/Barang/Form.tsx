import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/components/AdminLayout';
import FormCard from '@/components/FormCard';
import FormInput from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import SelectInput from '@/components/SelectInput';
import { Barang, Pemasok, Rak } from '@/types';

interface Props {
    barang: Barang | null;
    rak: Rak[];
    kategori: string[];
    pemasok: Pemasok[];
}

export default function Form({ barang, rak, kategori, pemasok }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        sku: barang?.sku ?? '',
        nama: barang?.nama ?? '',
        kategori: barang?.kategori ?? '',
        ukuran: barang?.ukuran ?? '',
        warna: barang?.warna ?? '',
        satuan: barang?.satuan ?? 'pcs',
        stok_minimum: String(barang?.stok_minimum ?? 10),
        rak_id: barang?.rak_id ? String(barang.rak_id) : '',
        harga_beli: String(barang?.harga_beli ?? 0),
        harga_jual: String(barang?.harga_jual ?? 0),
        jenis_stok: barang?.jenis_stok ?? 'beli',
        pemasok_id: barang?.pemasok_id ? String(barang.pemasok_id) : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (barang) {
            put(`/barang/${barang.id}`);
        } else {
            post('/barang');
        }
    };

    const judul = barang ? 'Ubah Barang' : 'Tambah Barang';

    return (
        <AdminLayout title={judul}>
            <PageHeader title={judul} breadcrumbs={[{ label: 'Master Data' }, { label: 'Barang', href: '/barang' }, { label: judul }]} />

            <FormCard onSubmit={submit} processing={processing} cancelHref="/barang">
                <FormInput label="SKU" name="sku" value={data.sku} onChange={(e) => setData('sku', e.target.value)} error={errors.sku} placeholder="Contoh: KMJ-001-M-HTM" hint="Satu kombinasi ukuran dan warna = satu SKU." autoFocus />
                <FormInput label="Nama Barang" name="nama" value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} />

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <FormInput label="Kategori" name="kategori" list="daftar-kategori" value={data.kategori} onChange={(e) => setData('kategori', e.target.value)} error={errors.kategori} />
                        <datalist id="daftar-kategori">
                            {kategori.map((k) => (
                                <option key={k} value={k} />
                            ))}
                        </datalist>
                    </div>
                    <FormInput label="Satuan" name="satuan" value={data.satuan} onChange={(e) => setData('satuan', e.target.value)} error={errors.satuan} />
                    <FormInput label="Ukuran" name="ukuran" value={data.ukuran} onChange={(e) => setData('ukuran', e.target.value)} error={errors.ukuran} placeholder="S / M / L / XL" />
                    <FormInput label="Warna" name="warna" value={data.warna} onChange={(e) => setData('warna', e.target.value)} error={errors.warna} />
                    <FormInput label="Stok Minimum" name="stok_minimum" type="number" min={0} value={data.stok_minimum} onChange={(e) => setData('stok_minimum', e.target.value)} error={errors.stok_minimum} />
                    <SelectInput label="Rak" name="rak_id" value={data.rak_id} onChange={(e) => setData('rak_id', e.target.value)} error={errors.rak_id}>
                        <option value="">- Belum ditempatkan -</option>
                        {rak.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.kode_rak}
                            </option>
                        ))}
                    </SelectInput>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <SelectInput label="Jenis Stok" name="jenis_stok" value={data.jenis_stok} onChange={(e) => setData('jenis_stok', e.target.value as 'beli' | 'konsinyasi')} error={errors.jenis_stok}>
                        <option value="beli">Beli putus (milik sendiri)</option>
                        <option value="konsinyasi">Konsinyasi (titipan pemasok)</option>
                    </SelectInput>
                    {data.jenis_stok === 'konsinyasi' ? (
                        <SelectInput label="Pemasok (pemilik titipan)" name="pemasok_id" value={data.pemasok_id} onChange={(e) => setData('pemasok_id', e.target.value)} error={errors.pemasok_id}>
                            <option value="">- Pilih pemasok -</option>
                            {pemasok.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.kode_pemasok} - {p.nama}
                                </option>
                            ))}
                        </SelectInput>
                    ) : (
                        <div />
                    )}
                    <FormInput label={data.jenis_stok === 'konsinyasi' ? 'Harga Titip (Rp)' : 'Harga Beli (Rp)'} name="harga_beli" type="number" min={0} value={data.harga_beli} onChange={(e) => setData('harga_beli', e.target.value)} error={errors.harga_beli} />
                    <FormInput label="Harga Jual (Rp)" name="harga_jual" type="number" min={0} value={data.harga_jual} onChange={(e) => setData('harga_jual', e.target.value)} error={errors.harga_jual} />
                </div>

                {data.jenis_stok === 'konsinyasi' && (
                    <div className="rounded border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-800">
                        Barang konsinyasi tetap milik pemasok. Toko baru berhutang setelah barang terjual, sebesar jumlah terjual × harga titip, lewat menu Konsinyasi. Barang yang tidak laku dapat diretur.
                    </div>
                )}

                <div className="rounded border border-line bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    {barang ? (
                        <>
                            Stok saat ini: <strong>{barang.stok}</strong> {barang.satuan}.{' '}
                        </>
                    ) : (
                        <>Stok awal otomatis 0. </>
                    )}
                    Stok tidak dapat diubah dari form ini; stok berubah melalui penerimaan barang dan pengambilan pesanan.
                </div>
            </FormCard>
        </AdminLayout>
    );
}
