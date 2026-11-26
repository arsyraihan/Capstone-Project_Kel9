import { router } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import Kotak from '@/components/Kotak';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { Pembayaran } from '@/types';

interface Props {
    mutasi: Pembayaran[];
    saldoAwal: number;
    filters: { dari: string; sampai: string };
}

const sel = 'border border-line px-3 py-2';

/** Dokumen dan pihak yang terkait dengan satu baris kas. */
function uraian(p: Pembayaran): string {
    if (p.pembelian) return `${p.pembelian.no_po} - ${p.pembelian.pemasok?.nama ?? ''}`;
    if (p.pesanan) return `${p.pesanan.no_pesanan} - ${p.pesanan.pelanggan?.nama ?? ''}`;
    if (p.penyelesaian) return `${p.penyelesaian.no_penyelesaian} - ${p.penyelesaian.pemasok?.nama ?? ''}`;
    return p.keterangan ?? '-';
}

export default function Kas({ mutasi, saldoAwal, filters }: Props) {
    const [dari, setDari] = useState(filters.dari);
    const [sampai, setSampai] = useState(filters.sampai);

    const masuk = mutasi.filter((m) => m.arah === 'masuk').reduce((t, m) => t + m.jumlah, 0);
    const keluar = mutasi.filter((m) => m.arah === 'keluar').reduce((t, m) => t + m.jumlah, 0);

    // Saldo berjalan per baris.
    let saldo = saldoAwal;
    const baris = mutasi.map((m) => {
        saldo += m.arah === 'masuk' ? m.jumlah : -m.jumlah;
        return { ...m, saldo };
    });

    const tampilkan: FormEventHandler = (e) => {
        e.preventDefault();
        router.get('/keuangan/kas', { dari, sampai }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Buku Kas">
            <PageHeader title="Buku Kas" breadcrumbs={[{ label: 'Keuangan' }, { label: 'Buku Kas' }]}>
                <Button variant="secondary" onClick={() => window.print()}>
                    <Printer className="size-4" />
                    Cetak
                </Button>
            </PageHeader>

            <form onSubmit={tampilkan} className="mb-4 flex flex-wrap items-end gap-3 rounded border border-line bg-white p-4 print:hidden">
                <FormInput label="Dari" name="dari" type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
                <FormInput label="Sampai" name="sampai" type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
                <Button type="submit">Tampilkan</Button>
            </form>

            <p className="mb-3 text-sm text-gray-600">
                Periode {formatTanggal(filters.dari)} s.d. {formatTanggal(filters.sampai)}
            </p>

            <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kotak label="Saldo Awal" nilai={formatRupiah(saldoAwal)} />
                <Kotak label="Uang Masuk" nilai={formatRupiah(masuk)} />
                <Kotak label="Uang Keluar" nilai={formatRupiah(keluar)} />
                <Kotak label="Saldo Akhir" nilai={formatRupiah(saldoAwal + masuk - keluar)} merah={saldoAwal + masuk - keluar < 0} />
            </div>

            <div className="overflow-x-auto rounded border border-line bg-white">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className={`${sel} font-semibold`}>Tanggal</th>
                            <th className={`${sel} font-semibold`}>No. Bukti</th>
                            <th className={`${sel} font-semibold`}>Jenis</th>
                            <th className={`${sel} font-semibold`}>Uraian</th>
                            <th className={`${sel} text-right font-semibold`}>Masuk</th>
                            <th className={`${sel} text-right font-semibold`}>Keluar</th>
                            <th className={`${sel} text-right font-semibold`}>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {baris.length === 0 && (
                            <tr>
                                <td colSpan={7} className={`${sel} py-8 text-center text-gray-500`}>
                                    Tidak ada transaksi kas pada periode ini.
                                </td>
                            </tr>
                        )}
                        {baris.map((m) => (
                            <tr key={m.id} className="odd:bg-white even:bg-gray-50">
                                <td className={sel}>{formatTanggal(m.tanggal)}</td>
                                <td className={`${sel} font-medium`}>{m.no_bukti}</td>
                                <td className={sel}>
                                    <StatusBadge status={m.jenis} />
                                </td>
                                <td className={sel}>{uraian(m)}</td>
                                <td className={`${sel} text-right`}>{m.arah === 'masuk' ? formatRupiah(m.jumlah) : '-'}</td>
                                <td className={`${sel} text-right`}>{m.arah === 'keluar' ? formatRupiah(m.jumlah) : '-'}</td>
                                <td className={`${sel} text-right font-medium`}>{formatRupiah(m.saldo)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
