import { router } from '@inertiajs/react';
import { Ban, Check, Pencil } from 'lucide-react';
import { ReactNode, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button, { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import useAuth from '@/hooks/useAuth';
import RiwayatBayar from '@/components/RiwayatBayar';
import { formatRupiah, formatTanggal, formatWaktu, statusTagihan, tanggalHariIni } from '@/lib/format';
import { namaPeran } from '@/lib/peran';
import { Pesanan } from '@/types';

const langkah = ['baru', 'diambil', 'dikemas', 'dikirim', 'selesai'] as const;

function Info({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{children}</dd>
        </div>
    );
}

export default function Show({ pesanan }: { pesanan: Pesanan }) {
    const [batal, setBatal] = useState(false);
    const detail = pesanan.detail ?? [];
    const posisi = langkah.indexOf(pesanan.status as (typeof langkah)[number]);
    const { is } = useAuth();
    // Hanya Staf Pengadaan & CO yang boleh mengubah/membatalkan pesanan (selama masih baru).
    const dapatDiubah = pesanan.status === 'baru' && is('pengadaan');
    const tagihan = pesanan.status === 'dikirim' || pesanan.status === 'selesai';

    return (
        <AdminLayout title={`Pesanan ${pesanan.no_pesanan}`}>
            <PageHeader title={`Pesanan ${pesanan.no_pesanan}`} breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pesanan', href: '/pesanan' }, { label: 'Detail' }]}>
                {dapatDiubah && (
                    <>
                        <LinkButton href={`/pesanan/${pesanan.id}/edit`} variant="secondary">
                            <Pencil className="size-4" />
                            Ubah
                        </LinkButton>
                        <Button variant="danger" onClick={() => setBatal(true)}>
                            <Ban className="size-4" />
                            Batalkan
                        </Button>
                    </>
                )}
            </PageHeader>

            {/* Alur status */}
            <div className="mb-4 rounded border border-line bg-white p-5">
                {pesanan.status === 'batal' ? (
                    <div className="flex items-center gap-2 text-sm">
                        <StatusBadge status="batal" />
                        <span className="text-gray-600">Pesanan ini dibatalkan.</span>
                    </div>
                ) : (
                    <ol className="flex flex-wrap items-center gap-2 text-sm">
                        {langkah.map((s, i) => (
                            <li key={s} className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 capitalize ${
                                        i < posisi ? 'border-green-200 bg-green-50 text-green-700' : i === posisi ? 'border-navy bg-navy text-white' : 'border-line bg-gray-50 text-gray-400'
                                    }`}
                                >
                                    {i < posisi && <Check className="size-3.5" />}
                                    {s}
                                </span>
                                {i < langkah.length - 1 && <span className="text-gray-300">&rarr;</span>}
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            <div className="mb-4 rounded border border-line bg-white p-5">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Info label="Tanggal Pesanan">{formatTanggal(pesanan.tanggal)}</Info>
                    <Info label="Pelanggan">{pesanan.pelanggan?.nama ?? '-'}</Info>
                    <Info label="Status">
                        <StatusBadge status={pesanan.status} />
                    </Info>
                    <Info label="Dibuat oleh">{pesanan.pembuat?.name ?? '-'}</Info>
                    <Info label="Alamat Pengiriman">{pesanan.pelanggan?.alamat ?? '-'}</Info>
                    <Info label="Jumlah Koli">{pesanan.jumlah_koli ?? '-'}</Info>
                    <Info label="Ekspedisi / Resi">{pesanan.ekspedisi ? `${pesanan.ekspedisi} / ${pesanan.no_resi}` : '-'}</Info>
                    <Info label="Tanggal Kirim">{formatTanggal(pesanan.tanggal_kirim)}</Info>
                    <Info label="Cara Bayar">
                        <StatusBadge status={pesanan.cara_bayar} />
                    </Info>
                    <Info label="Nilai Pesanan">{formatRupiah(pesanan.total)}</Info>
                    <Info label="Jatuh Tempo">{formatTanggal(pesanan.jatuh_tempo)}</Info>
                    <Info label="Pembayaran">
                        {tagihan ? (
                            <>
                                <StatusBadge status={statusTagihan(pesanan.total, pesanan.dibayar, pesanan.jatuh_tempo, tanggalHariIni())} />
                                <span className="ml-2">Dibayar {formatRupiah(pesanan.dibayar)}</span>
                            </>
                        ) : (
                            'Piutang timbul saat dikirim'
                        )}
                    </Info>
                    <div className="sm:col-span-2">
                        <Info label="Keterangan">
                            <span className="whitespace-pre-line">{pesanan.keterangan || '-'}</span>
                        </Info>
                    </div>
                </dl>
            </div>

            <div className="mb-4 rounded border border-line bg-white">
                <div className="border-b border-line px-4 py-3 text-sm font-semibold text-gray-900">Riwayat Proses</div>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className="w-14 border border-line px-3 py-2 text-center font-semibold">No</th>
                            <th className="border border-line px-3 py-2 font-semibold">Tahap</th>
                            <th className="border border-line px-3 py-2 font-semibold">Dikerjakan oleh</th>
                            <th className="border border-line px-3 py-2 font-semibold">Peran</th>
                            <th className="border border-line px-3 py-2 font-semibold">Waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(pesanan.riwayat ?? []).length === 0 && (
                            <tr>
                                <td colSpan={5} className="border border-line px-3 py-6 text-center text-gray-500">
                                    Belum ada riwayat proses untuk pesanan ini.
                                </td>
                            </tr>
                        )}
                        {(pesanan.riwayat ?? []).map((r, i) => (
                            <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                                <td className="border border-line px-3 py-2 text-center">{i + 1}</td>
                                <td className="border border-line px-3 py-2">
                                    <StatusBadge status={r.status} />
                                </td>
                                <td className="border border-line px-3 py-2 font-medium">{r.user?.name ?? '-'}</td>
                                <td className="border border-line px-3 py-2">{r.user ? namaPeran[r.user.role] : '-'}</td>
                                <td className="border border-line px-3 py-2">{formatWaktu(r.waktu)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="rounded border border-line bg-white">
                <div className="border-b border-line px-4 py-3 text-sm font-semibold text-gray-900">Daftar Barang</div>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className="w-14 border border-line px-3 py-2 text-center font-semibold">No</th>
                            <th className="border border-line px-3 py-2 font-semibold">SKU</th>
                            <th className="border border-line px-3 py-2 font-semibold">Nama Barang</th>
                            <th className="border border-line px-3 py-2 font-semibold">Rak</th>
                            <th className="border border-line px-3 py-2 text-right font-semibold">Jumlah</th>
                            <th className="border border-line px-3 py-2 text-right font-semibold">Harga Satuan</th>
                            <th className="border border-line px-3 py-2 text-right font-semibold">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detail.map((d, i) => (
                            <tr key={d.id} className="odd:bg-white even:bg-gray-50">
                                <td className="border border-line px-3 py-2 text-center">{i + 1}</td>
                                <td className="border border-line px-3 py-2 font-medium">{d.barang?.sku}</td>
                                <td className="border border-line px-3 py-2">
                                    {d.barang?.nama} ({d.barang?.ukuran}, {d.barang?.warna})
                                </td>
                                <td className="border border-line px-3 py-2">{d.barang?.rak?.kode_rak ?? '-'}</td>
                                <td className="border border-line px-3 py-2 text-right">
                                    {d.jumlah} {d.barang?.satuan}
                                </td>
                                <td className="border border-line px-3 py-2 text-right">{formatRupiah(d.harga_satuan)}</td>
                                <td className="border border-line px-3 py-2 text-right">{formatRupiah(d.jumlah * d.harga_satuan)}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100 font-semibold">
                            <td colSpan={4} className="border border-line px-3 py-2 text-right">
                                Total
                            </td>
                            <td className="border border-line px-3 py-2 text-right">{detail.reduce((t, d) => t + d.jumlah, 0)} pcs</td>
                            <td className="border border-line" />
                            <td className="border border-line px-3 py-2 text-right">{formatRupiah(pesanan.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {tagihan && (
                <div className="mt-4">
                    {is('manajemen') && Number(pesanan.dibayar ?? 0) < pesanan.total && (
                        <div className="mb-2 flex justify-end">
                            <LinkButton href={`/keuangan/bayar/piutang/${pesanan.id}`}>Terima Bayar</LinkButton>
                        </div>
                    )}
                    <RiwayatBayar data={pesanan.pembayaran ?? []} />
                </div>
            )}

            <ConfirmModal
                open={batal}
                title="Batalkan Pesanan"
                message={`Yakin ingin membatalkan pesanan ${pesanan.no_pesanan}? Pesanan yang dibatalkan tidak dapat diproses lagi.`}
                confirmLabel="Ya, Batalkan"
                variant="danger"
                onConfirm={() => router.post(`/pesanan/${pesanan.id}/batal`)}
                onCancel={() => setBatal(false)}
            />
        </AdminLayout>
    );
}
