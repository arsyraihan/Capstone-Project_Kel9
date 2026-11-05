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
