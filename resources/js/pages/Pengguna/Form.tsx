import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/components/AdminLayout';
import FormCard from '@/components/FormCard';
import FormInput from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import SelectInput from '@/components/SelectInput';
import { Pengguna, Role } from '@/types';

export default function Form({ pengguna }: { pengguna: Pengguna | null }) {
    const { data, setData, post, put, processing, errors } = useForm<{ name: string; email: string; password: string; role: Role }>({
        name: pengguna?.name ?? '',
        email: pengguna?.email ?? '',
        password: '',
        role: pengguna?.role ?? 'petugas',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (pengguna) {
            put(`/pengguna/${pengguna.id}`);
        } else {
            post('/pengguna');
        }
    };

    const judul = pengguna ? 'Ubah Pengguna' : 'Tambah Pengguna';

    return (
        <AdminLayout title={judul}>
            <PageHeader title={judul} breadcrumbs={[{ label: 'Lainnya' }, { label: 'Pengguna', href: '/pengguna' }, { label: judul }]} />

            <FormCard onSubmit={submit} processing={processing} cancelHref="/pengguna">
                <FormInput label="Nama" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} autoFocus />
                <FormInput label="Email" name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <FormInput
                    label="Kata Sandi"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    hint={pengguna ? 'Kosongkan jika tidak ingin mengganti kata sandi.' : 'Minimal 8 karakter.'}
                />
                <SelectInput label="Role" name="role" value={data.role} onChange={(e) => setData('role', e.target.value as Role)} error={errors.role}>
                    <option value="admin">Admin</option>
                    <option value="petugas">Petugas Gudang</option>
                </SelectInput>
            </FormCard>
        </AdminLayout>
    );
}
