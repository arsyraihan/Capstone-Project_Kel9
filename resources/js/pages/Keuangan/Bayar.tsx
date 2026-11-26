import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button, { LinkButton } from '@/components/Button';
import FormInput from '@/components/FormInput';
import Kotak from '@/components/Kotak';
import PageHeader from '@/components/PageHeader';
import RiwayatBayar from '@/components/RiwayatBayar';
import SelectInput from '@/components/SelectInput';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { Pembayaran } from '@/types';

type Jenis = 'hutang' | 'piutang' | 'konsinyasi';

interface Props {
    jenis: Jenis;
    tagihan: { id: number; nomor: string; pihak: string; jatuh_tempo: string | null; total: number; dibayar: number; sisa: number };
    riwayat: Pembayaran[];
    hariIni: string;
}

export default function Bayar({ jenis, tagihan, riwayat, hariIni }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tanggal: hariIni,
        jumlah: String(tagihan.sisa),
        metode: 'transfer',
        keterangan: '',
    });

    const info = {
        hutang: { judul: 'Bayar Hutang', kembali: '/keuangan/hutang', daftar: 'Hutang Pemasok', pihak: 'Pemasok' },
        piutang: { judul: 'Terima Pembayaran', kembali: '/keuangan/piutang', daftar: 'Piutang Pelanggan', pihak: 'Pelanggan' },
        konsinyasi: { judul: 'Bayar Konsinyasi', kembali: `/konsinyasi/${tagihan.id}`, daftar: 'Konsinyasi', pihak: 'Pemasok' },
    }[jenis];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/keuangan/bayar/${jenis}/${tagihan.id}`, {
            preserveScroll: true,
            // Setelah tersimpan, isian jumlah mengikuti sisa terbaru.
            onSuccess: (page) => setData({ ...data, jumlah: String((page.props.tagihan as Props['tagihan']).sisa), keterangan: '' }),
        });
    };

    return (
        <AdminLayout title={`${info.judul} ${tagihan.nomor}`}>
            <PageHeader title={`${info.judul} ${tagihan.nomor}`} breadcrumbs={[{ label: 'Keuangan' }, { label: info.daftar, href: info.kembali }, { label: info.judul }]}>
                <LinkButton href={info.kembali} variant="secondary">
                    Kembali
                </LinkButton>
            </PageHeader>

            <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kotak label={info.pihak} nilai={<span className="text-base">{tagihan.pihak}</span>} keterangan={`Jatuh tempo ${formatTanggal(tagihan.jatuh_tempo)}`} />
                <Kotak label="Total Tagihan" nilai={formatRupiah(tagihan.total)} />
                <Kotak label="Sudah Dibayar" nilai={formatRupiah(tagihan.dibayar)} />
                <Kotak label="Sisa" nilai={formatRupiah(tagihan.sisa)} merah={tagihan.sisa > 0} />
            </div>

            {tagihan.sisa > 0 ? (
                <form onSubmit={submit} className="mb-4 max-w-2xl rounded border border-line bg-white">
                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                        <FormInput label="Tanggal" name="tanggal" type="date" max={hariIni} value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} error={errors.tanggal} />
                        <FormInput label="Jumlah (Rp)" name="jumlah" type="number" min={1} max={tagihan.sisa} step="any" value={data.jumlah} onChange={(e) => setData('jumlah', e.target.value)} error={errors.jumlah} hint={`Maksimal ${formatRupiah(tagihan.sisa)}`} />
                        <SelectInput label="Metode" name="metode" value={data.metode} onChange={(e) => setData('metode', e.target.value)} error={errors.metode}>
                            <option value="transfer">Transfer</option>
                            <option value="tunai">Tunai</option>
                        </SelectInput>
                        <FormInput label="Keterangan" name="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} error={errors.keterangan} />
                    </div>
                    <div className="flex justify-end border-t border-line bg-gray-50 px-5 py-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Pembayaran'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">Tagihan ini sudah lunas.</div>
            )}

            <RiwayatBayar data={riwayat} />
        </AdminLayout>
    );
}
