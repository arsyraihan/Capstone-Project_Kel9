import { Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Paginated } from '@/types';

export interface Column<T> {
    header: string;
    cell: (row: T) => ReactNode;
    className?: string;
}

interface Props<T> {
    columns: Column<T>[];
    data: Paginated<T>;
    /** URL halaman ini, dipakai saat mencari/berpindah halaman. */
    url: string;
    search?: string;
    searchPlaceholder?: string;
    /** Parameter query tambahan yang ikut terkirim (misalnya filter kategori). */
    extraParams?: Record<string, string | undefined>;
    /** Elemen di samping kolom cari (misalnya dropdown filter). */
    toolbar?: ReactNode;
    /** Isi kolom "Aksi". Jika tidak diisi, kolom Aksi tetap tampil tapi kosong. */
    actions?: (row: T) => ReactNode;
    rowClassName?: (row: T) => string;
    emptyText?: string;
    hideSearch?: boolean;
    hideActions?: boolean;
}

const labelHalaman = (label: string) => {
    const huruf = label.toLowerCase();
    if (huruf.includes('previous') || huruf.includes('sebelumnya')) return 'Sebelumnya';
    if (huruf.includes('next') || huruf.includes('berikutnya')) return 'Berikutnya';
    return label;
};

/** Tabel + kolom cari (ilike di server) + paginasi 10 baris. Kolom "No" dan "Aksi" selalu ada. */
export default function DataTable<T extends { id: number }>({
    columns,
    data,
    url,
    search = '',
    searchPlaceholder = 'Cari...',
    extraParams = {},
    toolbar,
    actions,
    rowClassName,
    emptyText = 'Data tidak ditemukan.',
    hideSearch = false,
    hideActions = false,
}: Props<T>) {
    const [keyword, setKeyword] = useState(search);
    const awal = useRef(true);

    // Cari otomatis setelah berhenti mengetik (debounce 400 ms).
    useEffect(() => {
        if (awal.current) {
            awal.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(url, { ...extraParams, search: keyword || undefined }, { preserveState: true, preserveScroll: true, replace: true });
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword]);

    const mulai = data.from ?? 1;

    return (
        <div className="rounded border border-line bg-white">
            <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-line p-3 print:hidden ${hideSearch && !toolbar ? 'hidden' : ''}`}>
                {hideSearch ? <div /> : <div className="relative w-full sm:w-80">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full rounded border border-line py-2 pr-3 pl-9 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                    />
                </div>}
                {toolbar}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className="w-14 border border-line px-3 py-2 text-center font-semibold">No</th>
                            {columns.map((col) => (
                                <th key={col.header} className={`border border-line px-3 py-2 font-semibold ${col.className ?? ''}`}>
                                    {col.header}
                                </th>
                            ))}
                            {!hideActions && <th className="w-44 border border-line px-3 py-2 text-center font-semibold print:hidden">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + (hideActions ? 1 : 2)} className="border border-line px-3 py-8 text-center text-gray-500">
                                    {emptyText}
                                </td>
                            </tr>
                        )}
                        {data.data.map((row, index) => (
                            <tr key={row.id} className={`odd:bg-white even:bg-gray-50 ${rowClassName?.(row) ?? ''}`}>
                                <td className="border border-line px-3 py-2 text-center">{mulai + index}</td>
                                {columns.map((col) => (
                                    <td key={col.header} className={`border border-line px-3 py-2 ${col.className ?? ''}`}>
                                        {col.cell(row)}
                                    </td>
                                ))}
                                {!hideActions && <td className="border border-line px-3 py-2 print:hidden">{actions?.(row)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-3 text-sm text-gray-600 print:hidden">
                <span>{data.total > 0 ? `Menampilkan ${data.from}-${data.to} dari ${data.total} data` : 'Tidak ada data'}</span>

                {data.last_page > 1 && (
                    <div className="flex flex-wrap gap-1">
                        {data.links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    preserveScroll
                                    className={`rounded border px-2.5 py-1 ${link.active ? 'border-navy bg-navy text-white' : 'border-line bg-white hover:bg-gray-100'}`}
                                >
                                    {labelHalaman(link.label)}
                                </Link>
                            ) : (
                                <span key={i} className="rounded border border-line px-2.5 py-1 text-gray-400">
                                    {labelHalaman(link.label)}
                                </span>
                            ),
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
