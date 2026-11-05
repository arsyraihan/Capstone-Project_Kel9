import { Link, router } from '@inertiajs/react';
import { CheckCheck, Printer, Truck } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button, { LinkButton } from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import FormInput from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import { formatTanggal } from '@/lib/format';
import { Paginated, Pesanan } from '@/types';

interface Props {
    tab: 'dikemas' | 'dikirim';
    pesanan: Paginated<Pesanan>;
    filters: { search: string };
}

const tabs = [
    { key: 'dikemas', label: 'Siap Dikirim' },
    { key: 'dikirim', label: 'Dalam Pengiriman' },
] as const;

export default function Index({ tab, pesanan, filters }: Props) {
    const [kirim, setKirim] = useState<Pesanan | null>(null);
    const [selesai, setSelesai] = useState<Pesanan | null>(null);
    const [ekspedisi, setEkspedisi] = useState('');
    const [noResi, setNoResi] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const bukaKirim = (r: Pesanan) => {
        setKirim(r);
        setEkspedisi('');
        setNoResi('');
        setErrors({});
    };

    const proses = (url: string, data: Record<string, string>, tutup: () => void) =>
        router.post(url, data, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onError: (e) => setErrors(e),
            onSuccess: tutup,
            onFinish: () => setProcessing(false),
        });

    const suratJalan = (r: Pesanan) => (
        <LinkButton href={`/pengiriman/${r.id}/surat-jalan`} variant="secondary" size="sm">
            <Printer className="size-3.5" />
            Surat Jalan
        </LinkButton>
    );

    return (
        <AdminLayout title="Pengiriman">
            <PageHeader title="Pengiriman Barang" breadcrumbs={[{ label: 'Transaksi' }, { label: 'Pengiriman' }]} />

            <div className="mb-3 flex gap-1 border-b border-line">
                {tabs.map((t) => (
                    <Link
                        key={t.key}
                        href={`/pengiriman?tab=${t.key}`}
                        className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === t.key ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            <DataTable
                data={pesanan}
                url="/pengiriman"
                search={filters.search}
                extraParams={{ tab }}
                searchPlaceholder="Cari nomor pesanan atau pelanggan..."
                emptyText={tab === 'dikemas' ? 'Tidak ada pesanan yang siap dikirim.' : 'Tidak ada pesanan yang sedang dalam pengiriman.'}
                columns={[
                    { header: 'No. Pesanan', cell: (r) => <span className="font-medium">{r.no_pesanan}</span> },
                    { header: 'Pelanggan', cell: (r) => r.pelanggan?.nama ?? '-' },
                    { header: 'Alamat', cell: (r) => r.pelanggan?.alamat ?? '-' },
                    { header: 'Koli', cell: (r) => r.jumlah_koli ?? '-', className: 'text-right' },
                    ...(tab === 'dikirim'
                        ? [
                              { header: 'Ekspedisi', cell: (r: Pesanan) => r.ekspedisi ?? '-' },
                              { header: 'No. Resi', cell: (r: Pesanan) => r.no_resi ?? '-' },
                              { header: 'Tgl Kirim', cell: (r: Pesanan) => formatTanggal(r.tanggal_kirim) },
                          ]
                        : []),
                ]}
                actions={(r) => (
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {suratJalan(r)}
                        {tab === 'dikemas' ? (
                            <Button size="sm" onClick={() => bukaKirim(r)}>
                                <Truck className="size-3.5" />
                                Kirim
                            </Button>
                        ) : (
                            <Button size="sm" onClick={() => setSelesai(r)}>
                                <CheckCheck className="size-3.5" />
                                Tandai Selesai
                            </Button>
                        )}
                    </div>
                )}
            />

            <ConfirmModal
                open={kirim !== null}
                title="Kirim Pesanan"
                message={`Isi data pengiriman untuk pesanan ${kirim?.no_pesanan}.`}
                confirmLabel="Kirim"
                processing={processing}
                confirmDisabled={!ekspedisi.trim() || !noResi.trim()}
                onConfirm={() => kirim && proses(`/pengiriman/${kirim.id}/kirim`, { ekspedisi, no_resi: noResi }, () => setKirim(null))}
                onCancel={() => setKirim(null)}
            >
                <FormInput label="Ekspedisi" name="ekspedisi" value={ekspedisi} onChange={(e) => setEkspedisi(e.target.value)} error={errors.ekspedisi} placeholder="Contoh: JNE, J&T, Sicepat" autoFocus />
                <FormInput label="Nomor Resi" name="no_resi" value={noResi} onChange={(e) => setNoResi(e.target.value)} error={errors.no_resi} />
            </ConfirmModal>

            <ConfirmModal
                open={selesai !== null}
                title="Tandai Selesai"
                message={`Pesanan ${selesai?.no_pesanan} sudah diterima pelanggan? Status akan berubah menjadi "selesai".`}
                confirmLabel="Ya, Tandai Selesai"
                processing={processing}
                onConfirm={() => selesai && proses(`/pengiriman/${selesai.id}/selesai`, {}, () => setSelesai(null))}
                onCancel={() => setSelesai(null)}
            />
        </AdminLayout>
    );
}
