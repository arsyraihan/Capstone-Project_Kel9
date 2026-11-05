import { Printer } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import Button, { LinkButton } from '@/components/Button';
import KopSurat from '@/components/KopSurat';
import PageHeader from '@/components/PageHeader';
import { formatTanggal } from '@/lib/format';
import { Pesanan } from '@/types';

export default function SuratJalan({ pesanan }: { pesanan: Pesanan }) {
    const detail = pesanan.detail ?? [];

    return (
        <AdminLayout title={`Surat Jalan ${pesanan.no_pesanan}`}>
            <div className="print:hidden">
                <PageHeader title="Surat Jalan" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pengiriman', href: '/pengiriman?tab=dikirim' }, { label: 'Surat Jalan' }]}>
                    <LinkButton href="/pengiriman" variant="secondary">
                        Kembali
                    </LinkButton>
                    <Button onClick={() => window.print()}>
                        <Printer className="size-4" />
                        Cetak
                    </Button>
                </PageHeader>
            </div>

            <div className="mx-auto max-w-3xl rounded border border-line bg-white p-8 text-sm text-gray-900 print:max-w-none print:rounded-none print:border-0 print:p-0">
                <KopSurat judul="Surat Jalan" />

                <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1">
                    <table className="text-sm">
                        <tbody>
                            <tr>
                                <td className="w-32 py-0.5 text-gray-600">No. Pesanan</td>
                                <td className="font-semibold">: {pesanan.no_pesanan}</td>
                            </tr>
                            <tr>
                                <td className="py-0.5 text-gray-600">Tanggal Pesanan</td>
                                <td>: {formatTanggal(pesanan.tanggal)}</td>
                            </tr>
                            <tr>
                                <td className="py-0.5 text-gray-600">Tanggal Kirim</td>
                                <td>: {formatTanggal(pesanan.tanggal_kirim)}</td>
                            </tr>
                            <tr>
                                <td className="py-0.5 text-gray-600">Jumlah Koli</td>
                                <td>: {pesanan.jumlah_koli ?? '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="text-sm">
                        <tbody>
                            <tr>
                                <td className="w-24 py-0.5 align-top text-gray-600">Kepada</td>
                                <td className="font-semibold">: {pesanan.pelanggan?.nama}</td>
                            </tr>
                            <tr>
                                <td className="py-0.5 align-top text-gray-600">Alamat</td>
                                <td>: {pesanan.pelanggan?.alamat ?? '-'}</td>
                            </tr>
                            <tr>
                                <td className="py-0.5 align-top text-gray-600">Telepon</td>
                                <td>: {pesanan.pelanggan?.telepon ?? '-'}</td>
                            </tr>
                            <tr>
                                <td className="py-0.5 align-top text-gray-600">Ekspedisi</td>
                                <td>
                                    : {pesanan.ekspedisi ?? '-'}
                                    {pesanan.no_resi ? ` (Resi ${pesanan.no_resi})` : ''}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="w-12 border border-gray-400 px-2 py-1.5 text-center font-semibold">No</th>
                            <th className="border border-gray-400 px-2 py-1.5 font-semibold">SKU</th>
                            <th className="border border-gray-400 px-2 py-1.5 font-semibold">Nama Barang</th>
                            <th className="border border-gray-400 px-2 py-1.5 font-semibold">Ukuran</th>
                            <th className="border border-gray-400 px-2 py-1.5 font-semibold">Warna</th>
                            <th className="border border-gray-400 px-2 py-1.5 text-right font-semibold">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detail.map((d, i) => (
                            <tr key={d.id}>
                                <td className="border border-gray-400 px-2 py-1.5 text-center">{i + 1}</td>
                                <td className="border border-gray-400 px-2 py-1.5">{d.barang?.sku}</td>
                                <td className="border border-gray-400 px-2 py-1.5">{d.barang?.nama}</td>
                                <td className="border border-gray-400 px-2 py-1.5">{d.barang?.ukuran}</td>
                                <td className="border border-gray-400 px-2 py-1.5">{d.barang?.warna}</td>
                                <td className="border border-gray-400 px-2 py-1.5 text-right">
                                    {d.jumlah} {d.barang?.satuan}
                                </td>
                            </tr>
                        ))}
                        <tr className="font-semibold">
                            <td colSpan={5} className="border border-gray-400 px-2 py-1.5 text-right">
                                Total
                            </td>
                            <td className="border border-gray-400 px-2 py-1.5 text-right">{detail.reduce((t, d) => t + d.jumlah, 0)} pcs</td>
                        </tr>
                    </tbody>
                </table>

                {pesanan.keterangan && (
                    <p className="mt-3 text-sm">
                        <span className="text-gray-600">Catatan:</span> {pesanan.keterangan}
                    </p>
                )}

                {/* Tanda tangan */}
                <div className="mt-10 grid grid-cols-3 gap-6 text-center text-sm">
                    {['Petugas Gudang', 'Pengirim / Ekspedisi', 'Penerima'].map((peran) => (
                        <div key={peran}>
                            <div>{peran}</div>
                            <div className="mt-16 border-t border-gray-800 pt-1">(.............................)</div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
