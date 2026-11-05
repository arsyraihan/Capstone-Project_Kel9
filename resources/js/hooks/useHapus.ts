import { router } from '@inertiajs/react';
import { useState } from 'react';

/** Alur hapus: pilih baris -> tampilkan ConfirmModal -> kirim DELETE ke `${baseUrl}/${id}`. */
export default function useHapus<T extends { id: number }>(baseUrl: string) {
    const [target, setTarget] = useState<T | null>(null);
    const [processing, setProcessing] = useState(false);

    const konfirmasi = () => {
        if (!target) {
            return;
        }
        router.delete(`${baseUrl}/${target.id}`, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setTarget(null);
            },
        });
    };

    return { target, setTarget, konfirmasi, processing };
}
