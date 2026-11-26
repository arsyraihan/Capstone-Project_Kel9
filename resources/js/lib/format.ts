/** "2026-11-05" -> "05/11/2026" */
export function formatTanggal(tanggal: string | null | undefined): string {
    if (!tanggal) {
        return '-';
    }
    const [y, m, d] = tanggal.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

/** Waktu ISO dari server -> "05/11/2026 18:30" (zona waktu Jakarta). */
export function formatWaktu(waktu: string | null | undefined): string {
    if (!waktu) {
        return '-';
    }
    return new Date(waktu)
        .toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
        .replace(',', '')
        .replace(/\./g, ':')
        .replace(/(\d{2}\/\d{2}\/\d{4}) /, '$1 ');
}

/** 1250000 -> "Rp 1.250.000" */
export function formatRupiah(nilai: number | string | null | undefined): string {
    const n = Number(nilai ?? 0);
    return `${n < 0 ? '-' : ''}Rp ${Math.abs(n).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;
}

/** Tanggal hari ini (YYYY-MM-DD) menurut zona waktu Jakarta. */
export function tanggalHariIni(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

/** Jumlah hari dari `dari` ke `sampai` (negatif bila `sampai` sudah lewat). */
export function selisihHari(dari: string, sampai: string): number {
    return Math.round((Date.parse(sampai.slice(0, 10)) - Date.parse(dari.slice(0, 10))) / 86_400_000);
}

export type StatusTagihan = 'lunas' | 'jatuh_tempo' | 'belum';

export function statusTagihan(total: number, dibayar: number | string | null | undefined, jatuhTempo: string | null | undefined, hariIni: string): StatusTagihan {
    if (Number(dibayar ?? 0) >= Number(total)) {
        return 'lunas';
    }
    return jatuhTempo && jatuhTempo.slice(0, 10) < hariIni ? 'jatuh_tempo' : 'belum';
}
