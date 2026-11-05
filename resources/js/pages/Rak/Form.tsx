import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/components/AdminLayout';
import FormCard from '@/components/FormCard';
import FormInput from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import { Rak } from '@/types';

export default function Form({ rak }: { rak: Rak | null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        kode_rak: rak?.kode_rak ?? '',
        keterangan: rak?.keterangan ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (rak) {
            put(`/rak/${rak.id}`);
        } else {
            post('/rak');
        }
    };

    const judul = rak ? 'Ubah Rak' : 'Tambah Rak';

    return (
        <AdminLayout title={judul}>
            <PageHeader title={judul} breadcrumbs={[{ label: 'Master Data' }, { label: 'Rak', href: '/rak' }, { label: judul }]} />

            <FormCard onSubmit={submit} processing={processing} cancelHref="/rak">
                <FormInput label="Kode Rak" name="kode_rak" value={data.kode_rak} onChange={(e) => setData('kode_rak', e.target.value)} error={errors.kode_rak} placeholder="Contoh: A-01" autoFocus />
                <FormInput label="Keterangan" name="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} error={errors.keterangan} />
            </FormCard>
        </AdminLayout>
    );
}
