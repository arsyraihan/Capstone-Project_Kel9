import { formatTanggal, selisihHari } from '@/lib/format';

interface Props {
    tanggal: string | null;
    hariIni: string;
    lunas?: boolean;
}

/** Tanggal jatuh tempo beserta "N hari lagi" / "terlambat N hari". */
export default function JatuhTempo({ tanggal, hariIni, lunas = false }: Props) {
    if (!tanggal) {
        return <>-</>;
    }

    const sisa = selisihHari(hariIni, tanggal);

    return (
        <>
            {formatTanggal(tanggal)}
            {!lunas && (
                <span className={`block text-xs ${sisa < 0 ? 'font-semibold text-danger' : 'text-gray-500'}`}>
                    {sisa < 0 ? `terlambat ${-sisa} hari` : sisa === 0 ? 'jatuh tempo hari ini' : `${sisa} hari lagi`}
                </span>
            )}
        </>
    );
}
