import { formatRupiah, formatTanggal } from '@/lib/format';
import { Pembayaran } from '@/types';

const sel = 'border border-line px-3 py-2';

/** Tabel pembayaran yang sudah tercatat untuk satu tagihan. */
export default function RiwayatBayar({ data }: { data: Pembayaran[] }) {
    return (
        <div className="rounded border border-line bg-white">
            <div className="border-b border-line px-4 py-3 text-sm font-semibold text-gray-900">Riwayat Pembayaran</div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className={`${sel} font-semibold`}>No. Bukti</th>
                            <th className={`${sel} font-semibold`}>Tanggal</th>
                            <th className={`${sel} font-semibold`}>Metode</th>
                            <th className={`${sel} font-semibold`}>Keterangan</th>
                            <th className={`${sel} font-semibold`}>Dicatat oleh</th>
                            <th className={`${sel} text-right font-semibold`}>Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className={`${sel} py-6 text-center text-gray-500`}>
                                    Belum ada pembayaran.
                                </td>
                            </tr>
                        )}
                        {data.map((p) => (
                            <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                                <td className={`${sel} font-medium`}>{p.no_bukti}</td>
                                <td className={sel}>{formatTanggal(p.tanggal)}</td>
                                <td className={`${sel} capitalize`}>{p.metode}</td>
                                <td className={sel}>{p.keterangan || '-'}</td>
                                <td className={sel}>{p.user?.name ?? '-'}</td>
                                <td className={`${sel} text-right`}>{formatRupiah(p.jumlah)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
