import { ReactNode, useEffect } from 'react';
import Button from '@/components/Button';

interface Props {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'primary' | 'danger';
    processing?: boolean;
    /** Nonaktifkan tombol konfirmasi (mis. isian belum lengkap). */
    confirmDisabled?: boolean;
    /** Isian tambahan di bawah pesan (mis. input jumlah koli). */
    children?: ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
}

/** Konfirmasi untuk hapus, batal, dan perubahan status. */
export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = 'Ya, Lanjutkan',
    variant = 'primary',
    processing = false,
    confirmDisabled = false,
    children,
    onConfirm,
    onCancel,
}: Props) {
    useEffect(() => {
        if (!open) {
            return;
        }
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onCancel]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 print:hidden" onClick={onCancel}>
            <div role="dialog" aria-modal="true" className="w-full max-w-md rounded border border-line bg-white shadow" onClick={(e) => e.stopPropagation()}>
                <div className="border-b border-line px-5 py-3">
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                </div>
                <div className="space-y-3 px-5 py-4 text-sm text-gray-700">
                    <p>{message}</p>
                    {children}
                </div>
                <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
                    <Button variant="secondary" onClick={onCancel} disabled={processing}>
                        Batal
                    </Button>
                    <Button variant={variant} onClick={onConfirm} disabled={processing || confirmDisabled}>
                        {processing ? 'Memproses...' : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
