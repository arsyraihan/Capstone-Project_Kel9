import { namaPeran } from '@/lib/peran';

const warna: Record<string, string> = {
    // Pesanan
    baru: 'bg-gray-100 text-gray-700 border-gray-300',
    diambil: 'bg-blue-50 text-blue-700 border-blue-200',
    dikemas: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    dikirim: 'bg-purple-50 text-purple-700 border-purple-200',
    selesai: 'bg-green-50 text-green-700 border-green-200',
    batal: 'bg-red-50 text-red-700 border-red-200',
    // Purchase Order
    dipesan: 'bg-gray-100 text-gray-700 border-gray-300',
    diterima: 'bg-green-50 text-green-700 border-green-200',
    // Mutasi stok
    masuk: 'bg-green-50 text-green-700 border-green-200',
    keluar: 'bg-red-50 text-red-700 border-red-200',
    // Peran pengguna
    admin: 'bg-blue-50 text-blue-700 border-blue-200',
    pengadaan: 'bg-purple-50 text-purple-700 border-purple-200',
    gudang: 'bg-green-50 text-green-700 border-green-200',
    picker: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    pengiriman: 'bg-blue-50 text-blue-700 border-blue-200',
    manajemen: 'bg-red-50 text-red-700 border-red-200',
    petugas: 'bg-gray-100 text-gray-700 border-gray-300',
};

const label: Record<string, string> = namaPeran;

export default function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium capitalize ${warna[status] ?? warna.baru}`}>
            {label[status] ?? status}
        </span>
    );
}
