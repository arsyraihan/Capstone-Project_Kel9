import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/Button';
import { formatRupiah } from '@/lib/format';

export type ItemRow = {
    barang_id: string;
    jumlah: string;
    harga_satuan: string;
};

export interface BarangOption {
    id: number;
    sku: string;
    nama: string;
    stok: number;
    satuan: string;
    harga_beli: number;
    harga_jual: number;
}

interface Props {
    items: ItemRow[];
    onChange: (items: ItemRow[]) => void;
    barang: BarangOption[];
    errors: Record<string, string | undefined>;
    /** Tampilkan kolom "Stok Tersedia" (dipakai pada form Pesanan). */
    showStok?: boolean;
    /** Tampilkan harga satuan (terisi dari master barang, bisa diubah), subtotal, dan total. */
    harga?: 'harga_beli' | 'harga_jual';
}

/** Tabel item dinamis: pilih barang, isi jumlah, tambah/hapus baris. Dipakai oleh form PO dan Pesanan. */
export default function ItemRows({ items, onChange, barang, errors, showStok = false, harga }: Props) {
    const ubah = (index: number, field: keyof ItemRow, value: string) => onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

    // Memilih barang sekaligus mengisi harga dari master barang.
    const pilihBarang = (index: number, id: string) => {
        const b = barang.find((x) => String(x.id) === id);
        onChange(items.map((item, i) => (i === index ? { ...item, barang_id: id, harga_satuan: b && harga ? String(b[harga]) : '0' } : item)));
    };

    const subtotal = (item: ItemRow) => (Number(item.jumlah) || 0) * (Number(item.harga_satuan) || 0);
    const kolom = 4 + (showStok ? 1 : 0) + (harga ? 2 : 0);
    const hapus = (index: number) => onChange(items.filter((_, i) => i !== index));
    const tambah = () => onChange([...items, { barang_id: '', jumlah: '1', harga_satuan: '0' }]);

    const dipilihDiBarisLain = (index: number) => new Set(items.filter((_, i) => i !== index).map((item) => item.barang_id));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Daftar Barang</span>
                <Button size="sm" variant="secondary" onClick={tambah}>
                    <Plus className="size-3.5" />
                    Tambah Baris
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className="w-12 border border-line px-2 py-2 text-center font-semibold">No</th>
                            <th className="border border-line px-2 py-2 font-semibold">Barang</th>
                            {showStok && <th className="w-32 border border-line px-2 py-2 text-right font-semibold">Stok Tersedia</th>}
                            <th className="w-28 border border-line px-2 py-2 font-semibold">Jumlah</th>
                            {harga && <th className="w-36 border border-line px-2 py-2 font-semibold">Harga Satuan</th>}
                            {harga && <th className="w-36 border border-line px-2 py-2 text-right font-semibold">Subtotal</th>}
                            <th className="w-20 border border-line px-2 py-2 text-center font-semibold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={kolom} className="border border-line px-2 py-6 text-center text-gray-500">
                                    Belum ada barang. Klik "Tambah Baris".
                                </td>
                            </tr>
                        )}
                        {items.map((item, index) => {
                            const terpilih = barang.find((b) => String(b.id) === item.barang_id);
                            const sudahDipilih = dipilihDiBarisLain(index);
                            const kurang = showStok && terpilih && Number(item.jumlah) > terpilih.stok;

                            return (
                                <tr key={index} className="align-top">
                                    <td className="border border-line px-2 py-2 text-center">{index + 1}</td>
                                    <td className="border border-line px-2 py-2">
                                        <select
                                            value={item.barang_id}
                                            onChange={(e) => pilihBarang(index, e.target.value)}
                                            className={`w-full rounded border bg-white px-2 py-1.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none ${
                                                errors[`items.${index}.barang_id`] ? 'border-danger' : 'border-line'
                                            }`}
                                        >
                                            <option value="">- Pilih barang -</option>
                                            {barang.map((b) => (
                                                <option key={b.id} value={b.id} disabled={sudahDipilih.has(String(b.id))}>
                                                    {b.sku} - {b.nama}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[`items.${index}.barang_id`] && <p className="mt-1 text-xs text-danger">{errors[`items.${index}.barang_id`]}</p>}
                                    </td>
                                    {showStok && (
                                        <td className={`border border-line px-2 py-2 text-right ${kurang ? 'font-semibold text-danger' : ''}`}>
                                            {terpilih ? `${terpilih.stok} ${terpilih.satuan}` : '-'}
                                        </td>
                                    )}
                                    <td className="border border-line px-2 py-2">
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.jumlah}
                                            onChange={(e) => ubah(index, 'jumlah', e.target.value)}
                                            className={`w-full rounded border bg-white px-2 py-1.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none ${
                                                errors[`items.${index}.jumlah`] ? 'border-danger' : 'border-line'
                                            }`}
                                        />
                                        {errors[`items.${index}.jumlah`] && <p className="mt-1 text-xs text-danger">{errors[`items.${index}.jumlah`]}</p>}
                                    </td>
                                    {harga && (
                                        <td className="border border-line px-2 py-2">
                                            <input
                                                type="number"
                                                min={0}
                                                value={item.harga_satuan}
                                                onChange={(e) => ubah(index, 'harga_satuan', e.target.value)}
                                                aria-label="Harga satuan"
                                                className={`w-full rounded border bg-white px-2 py-1.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none ${
                                                    errors[`items.${index}.harga_satuan`] ? 'border-danger' : 'border-line'
                                                }`}
                                            />
                                            {errors[`items.${index}.harga_satuan`] && <p className="mt-1 text-xs text-danger">{errors[`items.${index}.harga_satuan`]}</p>}
                                        </td>
                                    )}
                                    {harga && <td className="border border-line px-2 py-2 text-right">{formatRupiah(subtotal(item))}</td>}
                                    <td className="border border-line px-2 py-2 text-center">
                                        <Button size="sm" variant="danger" onClick={() => hapus(index)} aria-label="Hapus baris">
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        {harga && items.length > 0 && (
                            <tr className="bg-gray-100 font-semibold">
                                <td colSpan={kolom - 2} className="border border-line px-2 py-2 text-right">
                                    Total Nilai
                                </td>
                                <td className="border border-line px-2 py-2 text-right">{formatRupiah(items.reduce((t, item) => t + subtotal(item), 0))}</td>
                                <td className="border border-line" />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {errors.items && <p className="text-xs text-danger">{errors.items}</p>}
        </div>
    );
}
