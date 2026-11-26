import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/components/AdminLayout';
import FormCard from '@/components/FormCard';
import FormInput, { FormTextarea } from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import { Pelanggan } from '@/types';

export default function Form({ pelanggan }: { pelanggan: Pelanggan | null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        kode_pelanggan: pelanggan?.kode_pelanggan ?? '',
        nama: pelanggan?.nama ?? '',
        telepon: pelanggan?.telepon ?? '',
        alamat: pelanggan?.alamat ?? '',
        termin_hari: String(pelanggan?.termin_hari ?? 0),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (pelanggan) {
            put(`/pelanggan/${pelanggan.id}`);
        } else {
            post('/pelanggan');
        }
    };

    const judul = pelanggan ? 'Ubah Pelanggan' : 'Tambah Pelanggan';

    return (
        <AdminLayout title={judul}>
            <PageHeader title={judul} breadcrumbs={[{ label: 'Master Data' }, { label: 'Pelanggan', href: '/pelanggan' }, { label: judul }]} />

            <FormCard onSubmit={submit} processing={processing} cancelHref="/pelanggan">
                <FormInput label="Kode Pelanggan" name="kode_pelanggan" value={data.kode_pelanggan} onChange={(e) => setData('kode_pelanggan', e.target.value)} error={errors.kode_pelanggan} placeholder="Contoh: PLG-007" autoFocus />
                <FormInput label="Nama Pelanggan" name="nama" value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} />
                <FormInput label="Telepon" name="telepon" value={data.telepon} onChange={(e) => setData('telepon', e.target.value)} error={errors.telepon} />
                <FormTextarea label="Alamat" name="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} error={errors.alamat} />
                <FormInput label="Termin Pembayaran (hari)" name="termin_hari" type="number" min={0} max={180} value={data.termin_hari} onChange={(e) => setData('termin_hari', e.target.value)} error={errors.termin_hari} hint="Jangka waktu pelanggan membayar setelah barang dikirim. Isi 0 untuk tunai." />
            </FormCard>
        </AdminLayout>
    );
}
