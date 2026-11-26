import { ReactNode } from 'react';

interface Props {
    label: string;
    nilai: ReactNode;
    keterangan?: ReactNode;
    merah?: boolean;
}

/** Kartu angka ringkas. */
export default function Kotak({ label, nilai, keterangan, merah = false }: Props) {
    return (
        <div className="rounded border border-line bg-white p-4">
            <div className="text-sm text-gray-500">{label}</div>
            <div className={`mt-1 text-2xl font-semibold ${merah ? 'text-danger' : 'text-gray-900'}`}>{nilai}</div>
            {keterangan && <div className="mt-1 text-xs text-gray-500">{keterangan}</div>}
        </div>
    );
}
