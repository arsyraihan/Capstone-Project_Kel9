import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/components/AdminLayout';
import FormCard from '@/components/FormCard';
import FormInput, { FormTextarea } from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import { Pemasok } from '@/types';

export default function Form({ pemasok }: { pemasok: Pemasok | null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        kode_pemasok: pemasok?.kode_pemasok ?? '',
        nama: pemasok?.nama ?? '',
        telepon: pemasok?.telepon ?? '',
        alamat: pemasok?.alamat ?? '',
        termin_hari: String(pemasok?.termin_hari ?? 30),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (pemasok) {
            put(`/pemasok/${pemasok.id}`);
        } else {
            post('/pemasok');
        }
    };

    const judul = pemasok ? 'Ubah Pemasok' : 'Tambah Pemasok';

    return (
        <AdminLayout title={judul}>
            <PageHeader title={judul} breadcrumbs={[{ label: 'Master Data' }, { label: 'Pemasok', href: '/pemasok' }, { label: judul }]} />

            <FormCard onSubmit={submit} processing={processing} cancelHref="/pemasok">
                <FormInput label="Kode Pemasok" name="kode_pemasok" value={data.kode_pemasok} onChange={(e) => setData('kode_pemasok', e.target.value)} error={errors.kode_pemasok} placeholder="Contoh: PMS-006" autoFocus />
                <FormInput label="Nama Pemasok" name="nama" value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} />
                <FormInput label="Telepon" name="telepon" value={data.telepon} onChange={(e) => setData('telepon', e.target.value)} error={errors.telepon} />
                <FormTextarea label="Alamat" name="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} error={errors.alamat} />
                <FormInput label="Termin Pembayaran (hari)" name="termin_hari" type="number" min={0} max={180} value={data.termin_hari} onChange={(e) => setData('termin_hari', e.target.value)} error={errors.termin_hari} hint="Jangka waktu bayar PO tempo dan konsinyasi. Isi 0 untuk tunai." />
            </FormCard>
        </AdminLayout>
    );
}
