import { Head, useForm, usePage } from '@inertiajs/react';
import { Shirt } from 'lucide-react';
import { FormEventHandler } from 'react';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import { SharedData } from '@/types';

export default function Login() {
    const { name } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors, reset } = useForm<{ email: string; password: string; remember: boolean }>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-page px-4">
            <Head title="Masuk" />

            <div className="w-full max-w-sm">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded bg-navy text-white">
                        <Shirt className="size-6" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">{name}</h1>
                    <p className="mt-1 text-sm text-gray-500">Silakan masuk untuk melanjutkan</p>
                </div>

                <form onSubmit={submit} className="space-y-4 rounded border border-line bg-white p-6">
                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        autoFocus
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        placeholder="nama@inventaris.test"
                    />
                    <FormInput
                        label="Kata Sandi"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-line text-navy focus:ring-navy"
                        />
                        Ingat saya
                    </label>

                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing ? 'Memproses...' : 'Masuk'}
                    </Button>
                </form>

                <p className="mt-4 text-center text-xs text-gray-500">Akun dibuat oleh admin. Hubungi admin jika belum memiliki akun.</p>
            </div>
        </div>
    );
}
