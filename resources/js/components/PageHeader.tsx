import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { PropsWithChildren } from 'react';

interface Crumb {
    label: string;
    href?: string;
}

interface Props {
    title: string;
    breadcrumbs?: Crumb[];
}

/** Judul halaman + breadcrumb. Tombol aksi diberikan lewat children. */
export default function PageHeader({ title, breadcrumbs = [], children }: PropsWithChildren<Props>) {
    return (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                <nav className="mt-1 flex items-center gap-1 text-xs text-gray-500 print:hidden">
                    <Link href="/dashboard" className="hover:text-navy">
                        Beranda
                    </Link>
                    {breadcrumbs.map((crumb) => (
                        <span key={crumb.label} className="flex items-center gap-1">
                            <ChevronRight className="size-3" />
                            {crumb.href ? (
                                <Link href={crumb.href} className="hover:text-navy">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-gray-700">{crumb.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    );
}
