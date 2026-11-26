import { PemenuhanPemasok } from '@/types';

const sel = 'border border-line px-3 py-2';
const angka = (n: number) => n.toLocaleString('id-ID');

/** Hijau >= 98%, kuning 90-98%, merah < 90%. */
const warnaBar = (persen: number) => (persen >= 98 ? 'bg-green-600' : persen >= 90 ? 'bg-yellow-500' : 'bg-danger');

/** Pemenuhan pesanan per pemasok: barang dipesan dibandingkan yang benar-benar diterima. */
export default function TabelPemasok({ data }: { data: PemenuhanPemasok[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                        <th className={`${sel} font-semibold`}>Pemasok</th>
                        <th className={`${sel} text-right font-semibold`}>PO</th>
                        <th className={`${sel} text-right font-semibold`}>Belum Datang</th>
                        <th className={`${sel} text-right font-semibold`}>Dipesan</th>
                        <th className={`${sel} text-right font-semibold`}>Diterima</th>
                        <th className={`${sel} w-48 font-semibold`}>Pemenuhan</th>
                        <th className={`${sel} text-right font-semibold`}>PO Kurang Kirim</th>
                        <th className={`${sel} text-right font-semibold`}>Pcs Belum Datang</th>
                        <th className={`${sel} text-right font-semibold`}>Rata-rata Kirim</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((p) => (
                        <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                            <td className={sel}>
                                <span className="font-medium">{p.nama}</span>
                                <span className="block text-xs text-gray-500">{p.kode_pemasok}</span>
                            </td>
                            <td className={`${sel} text-right`}>{p.jumlah_po}</td>
                            <td className={`${sel} text-right`}>{p.po_belum_datang}</td>
                            <td className={`${sel} text-right`}>{angka(p.dipesan)}</td>
                            <td className={`${sel} text-right`}>{angka(p.diterima)}</td>
                            <td className={sel}>
                                {p.persen === null ? (
                                    <span className="text-gray-500">Belum ada penerimaan</span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 rounded bg-gray-200">
                                            <div className={`h-2 rounded ${warnaBar(p.persen)}`} style={{ width: `${Math.min(100, p.persen)}%` }} />
                                        </div>
                                        <span className="w-12 text-right text-xs font-semibold">{angka(p.persen)}%</span>
                                    </div>
                                )}
                            </td>
                            <td className={`${sel} text-right ${p.po_kurang_kirim > 0 ? 'font-semibold text-danger' : ''}`}>{p.po_kurang_kirim}</td>
                            <td className={`${sel} text-right`}>{angka(p.pcs_belum_datang)}</td>
                            <td className={`${sel} text-right`}>{p.rata_lama_kirim === null ? '-' : `${angka(p.rata_lama_kirim)} hari`}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
