import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

/** Kop sederhana (nama distributor + alamat) untuk Surat Jalan dan Laporan. Tampil jelas saat dicetak. */
export default function KopSurat({ judul }: { judul?: string }) {
    const { distributor } = usePage<SharedData>().props;

    return (
        <div className="mb-4 border-b-2 border-gray-800 pb-3 text-center">
            <div className="text-lg font-bold tracking-wide text-gray-900 uppercase">{distributor.nama}</div>
            <div className="text-sm text-gray-700">{distributor.alamat}</div>
            <div className="text-sm text-gray-700">Telp. {distributor.telepon}</div>
            {judul && <div className="mt-3 text-base font-semibold tracking-wider text-gray-900 uppercase underline">{judul}</div>}
        </div>
    );
}
