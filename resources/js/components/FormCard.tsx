import { FormEventHandler, PropsWithChildren } from 'react';
import Button, { LinkButton } from '@/components/Button';

interface Props {
    onSubmit: FormEventHandler;
    processing: boolean;
    cancelHref: string;
    /** Lebar penuh untuk form yang berisi tabel harga. */
    wide?: boolean;
}

/** Pembungkus form tambah/ubah: panel putih + tombol Simpan dan Batal. */
export default function FormCard({ onSubmit, processing, cancelHref, wide = false, children }: PropsWithChildren<Props>) {
    return (
        <form onSubmit={onSubmit} className={`${wide ? 'max-w-5xl' : 'max-w-2xl'} rounded border border-line bg-white`}>
            <div className="space-y-4 p-5">{children}</div>
            <div className="flex justify-end gap-2 border-t border-line bg-gray-50 px-5 py-3">
                <LinkButton href={cancelHref} variant="secondary">
                    Batal
                </LinkButton>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </div>
        </form>
    );
}
