import { Role } from '@/types';

/** Nama peran yang tampil di antarmuka. */
export const namaPeran: Record<Role, string> = {
    admin: 'Admin',
    pengadaan: 'Staf Pengadaan & CO',
    gudang: 'Staf Gudang',
    picker: 'Packing (Picker)',
    pengiriman: 'Pengemasan & Pengiriman',
    manajemen: 'Manajemen',
    petugas: 'Petugas (peran lama)',
};

/** Peran yang boleh dipilih saat membuat/mengubah pengguna (peran lama `petugas` tidak ditawarkan lagi). */
export const daftarPeran: Role[] = ['admin', 'pengadaan', 'gudang', 'picker', 'pengiriman', 'manajemen'];

/** Uraian singkat tugas tiap peran (untuk bantuan di form pengguna). */
export const tugasPeran: Record<Role, string> = {
    admin: 'Mengelola akun pengguna dan master data (barang, pemasok, pelanggan, rak).',
    pengadaan: 'Membuat PO ke pemasok dan pesanan pelanggan (Customer Order).',
    gudang: 'Menerima barang dari pemasok, menyimpannya di rak, dan memantau stok.',
    picker: 'Mengambil barang di rak sesuai pesanan.',
    pengiriman: 'Mengemas pesanan, mengirim lewat ekspedisi, dan mencetak Surat Jalan.',
    manajemen: 'Memantau pasokan dan mengurus hutang, piutang, kas, serta konsinyasi.',
    petugas: 'Peran lama. Alihkan ke salah satu peran di atas.',
};
