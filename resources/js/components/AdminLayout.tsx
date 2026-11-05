import { Head, router, usePage } from '@inertiajs/react';
import { LogOut, Menu } from 'lucide-react';
import { PropsWithChildren, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import { SharedData } from '@/types';

interface Props {
    title: string;
}

const namaRole = { admin: 'Admin', petugas: 'Petugas Gudang' } as const;

export default function AdminLayout({ title, children }: PropsWithChildren<Props>) {
    const { auth, flash, name } = usePage<SharedData>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Tampilkan flash message dari Laravel sebagai notifikasi.
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    return (
        <div className="min-h-screen bg-page print:bg-white">
            <Head title={title} />
            <Toaster position="top-right" toastOptions={{ style: { fontSize: '14px', borderRadius: '4px' } }} />

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex min-h-screen flex-col lg:pl-64 print:pl-0">
                {/* Header */}
                <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white px-4 print:hidden">
                    <button type="button" className="rounded p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
                        <Menu className="size-5" />
                    </button>
                    <div className="hidden text-sm text-gray-500 lg:block">{name}</div>

                    <div className="flex items-center gap-4">
                        <div className="text-right text-sm leading-tight">
                            <div className="font-medium text-gray-900">{auth.user?.name}</div>
                            <div className="text-xs text-gray-500">{auth.user ? namaRole[auth.user.role] : ''}</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <LogOut className="size-4" />
                            Keluar
                        </button>
                    </div>
                </header>

                {/* Konten */}
                <main className="flex-1 p-4 sm:p-6">{children}</main>

                {/* Footer */}
                <footer className="border-t border-line bg-white px-4 py-3 text-center text-xs text-gray-500 print:hidden">
                    &copy; {new Date().getFullYear()} {name} &middot; Capstone Project Kelompok 9 &middot; Universitas Nusantara PGRI Kediri
                </footer>
            </div>
        </div>
    );
}
