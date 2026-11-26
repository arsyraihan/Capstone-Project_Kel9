import { router } from '@inertiajs/react';
import { PackageCheck } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button, { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import { FormTextarea } from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import { formatTanggal } from '@/lib/format';
import { Pembelian } from '@/types';

export default function Form({ pembelian }: { pembelian: Pembelian }) {
    const detail = pembelian.detail ?? [];
    const [dicek, setDicek] = useState<Set<number>>(new Set());
    const [keterangan, setKeterangan] = useState('');
    const [konfirmasi, setKonfirmasi] = useState(false);
    const [processing, setProcessing] = useState(false);
    // Jumlah yang benar-benar datang; awalnya sama dengan yang dipesan.
    const [datang, setDatang] = useState<Record<number, string>>(() => Object.fromEntries(detail.map((d) => [d.id, String(d.jumlah)])));

    const sah = (id: number, dipesan: number) => /^\d+$/.test(datang[id]) && Number(datang[id]) <= dipesan;
    const semuaSah = detail.every((d) => sah(d.id, d.jumlah)) && detail.some((d) => Number(datang[d.id]) > 0);
    const adaKurang = detail.some((d) => sah(d.id, d.jumlah) && Number(datang[d.id]) < d.jumlah);

    const semuaDicek = detail.length > 0 && dicek.size === detail.length;

    const toggle = (id: number) =>
        setDicek((awal) => {
            const baru = new Set(awal);
            if (baru.has(id)) {
                baru.delete(id);
            } else {
                baru.add(id);
            }
            return baru;
        });

    const toggleSemua = () => setDicek(semuaDicek ? new Set() : new Set(detail.map((d) => d.id)));

    const terima = () => {
        router.post(
            `/penerimaan/${pembelian.id}`,
            { keterangan, diterima: datang },
            {
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setKonfirmasi(false);
                },
            },
        );
    };

    return (
        <AdminLayout title={`Penerimaan ${pembelian.no_po}`}>
            <PageHeader title={`Penerimaan PO ${pembelian.no_po}`} breadcrumbs={[{ label: 'Transaksi' }, { label: 'Penerimaan', href: '/penerimaan' }, { label: 'Proses' }]} />

            <div className="mb-4 grid max-w-3xl gap-4 rounded border border-line bg-white p-5 sm:grid-cols-3">
                <div>
                    <div className="text-xs text-gray-500">Tanggal PO</div>
                    <div className="text-sm">{formatTanggal(pembelian.tanggal)}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500">Pemasok</div>
                    <div className="text-sm">{pembelian.pemasok?.nama}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500">Catatan PO</div>
                    <div className="text-sm whitespace-pre-line">{pembelian.keterangan || '-'}</div>
                </div>
            </div>

            <div className="mb-4 rounded border border-line bg-white">
                <div className="border-b border-line px-4 py-3 text-sm font-semibold text-gray-900">Cek Barang yang Datang</div>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className="w-14 border border-line px-3 py-2 text-center font-semibold">
                                <input type="checkbox" checked={semuaDicek} onChange={toggleSemua} aria-label="Centang semua" className="rounded border-line text-navy focus:ring-navy" />
                            </th>
                            <th className="border border-line px-3 py-2 font-semibold">SKU</th>
                            <th className="border border-line px-3 py-2 font-semibold">Nama Barang</th>
                            <th className="border border-line px-3 py-2 text-right font-semibold">Dipesan</th>
                            <th className="w-36 border border-line px-3 py-2 font-semibold">Jumlah Datang</th>
                            <th className="w-28 border border-line px-3 py-2 text-right font-semibold">Selisih</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detail.map((d) => (
                            <tr key={d.id} className="odd:bg-white even:bg-gray-50">
                                <td className="border border-line px-3 py-2 text-center">
                                    <input type="checkbox" checked={dicek.has(d.id)} onChange={() => toggle(d.id)} className="rounded border-line text-navy focus:ring-navy" />
                                </td>
                                <td className="border border-line px-3 py-2 font-medium">{d.barang?.sku}</td>
                                <td className="border border-line px-3 py-2">
                                    {d.barang?.nama} ({d.barang?.ukuran}, {d.barang?.warna})
                                </td>
                                <td className="border border-line px-3 py-2 text-right">
                                    {d.jumlah} {d.barang?.satuan}
                                </td>
                                <td className="border border-line px-3 py-2">
                                    <input
                                        type="number"
                                        min={0}
                                        max={d.jumlah}
                                        value={datang[d.id]}
                                        onChange={(e) => setDatang({ ...datang, [d.id]: e.target.value })}
                                        aria-label={`Jumlah datang ${d.barang?.sku}`}
                                        className={`w-full rounded border bg-white px-2 py-1.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none ${sah(d.id, d.jumlah) ? 'border-line' : 'border-danger'}`}
                                    />
                                    {!sah(d.id, d.jumlah) && <p className="mt-1 text-xs text-danger">Isi 0 sampai {d.jumlah}.</p>}
                                </td>
                                <td className={`border border-line px-3 py-2 text-right ${sah(d.id, d.jumlah) && Number(datang[d.id]) < d.jumlah ? 'font-semibold text-danger' : ''}`}>
                                    {sah(d.id, d.jumlah) ? Number(datang[d.id]) - d.jumlah : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="max-w-3xl space-y-4 rounded border border-line bg-white p-5">
                <FormTextarea label="Keterangan Penerimaan" name="keterangan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Tulis selisih atau kondisi barang jika ada (opsional)." />
                <p className="text-xs text-gray-500">Stok dan nilai hutang dihitung dari jumlah yang datang. Penerimaan hanya sekali; sisa yang kurang kirim perlu dipesan lewat PO baru.</p>
                <div className="flex justify-end gap-2">
                    <LinkButton href="/penerimaan" variant="secondary">
                        Kembali
                    </LinkButton>
                    <Button disabled={!semuaDicek || !semuaSah} onClick={() => setKonfirmasi(true)}>
                        <PackageCheck className="size-4" />
                        Terima Barang
                    </Button>
                </div>
                {!semuaDicek && <p className="text-right text-xs text-gray-500">Centang semua barang terlebih dahulu untuk mengaktifkan tombol.</p>}
            </div>

            <ConfirmModal
                open={konfirmasi}
                title="Terima Barang"
                message={`Terima barang dari PO ${pembelian.no_po} sesuai jumlah datang?${adaKurang ? ' Ada barang yang kurang kirim.' : ''} Stok akan bertambah dan PO berubah menjadi "diterima".`}
                confirmLabel="Ya, Terima Barang"
                processing={processing}
                onConfirm={terima}
                onCancel={() => setKonfirmasi(false)}
            />
        </AdminLayout>
    );
}
