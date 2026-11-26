/** `petugas` adalah peran lama; hanya tersisa untuk akun yang belum dialihkan oleh admin. */
export type Role = 'admin' | 'pengadaan' | 'gudang' | 'picker' | 'pengiriman' | 'manajemen' | 'petugas';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export interface Flash {
    success?: string | null;
    error?: string | null;
}

export interface Distributor {
    nama: string;
    alamat: string;
    telepon: string;
}

export interface SharedData {
    name: string;
    distributor: Distributor;
    auth: { user: AuthUser | null };
    flash: Flash;
    [key: string]: unknown;
}

/** Bentuk hasil paginate() Laravel. */
export interface Paginated<T> {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

/* Model */
export interface Rak {
    id: number;
    kode_rak: string;
    keterangan: string | null;
}

export interface Pemasok {
    id: number;
    kode_pemasok: string;
    nama: string;
    telepon: string | null;
    alamat: string | null;
    termin_hari: number;
}

export interface Pelanggan {
    id: number;
    kode_pelanggan: string;
    nama: string;
    telepon: string | null;
    alamat: string | null;
    termin_hari: number;
}

export interface Barang {
    id: number;
    sku: string;
    nama: string;
    kategori: string;
    ukuran: string;
    warna: string;
    satuan: string;
    stok: number;
    stok_minimum: number;
    rak_id: number | null;
    rak?: Rak | null;
    harga_beli: number;
    harga_jual: number;
    jenis_stok: 'beli' | 'konsinyasi';
    pemasok_id: number | null;
    pemasok?: Pemasok | null;
}

export interface Pengguna {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export interface DetailItem {
    id: number;
    barang_id: number;
    jumlah: number;
    barang?: Barang;
    harga_satuan: number;
    /** Hanya pada detail PO; null = belum diterima. */
    jumlah_diterima?: number | null;
}

export interface Pembelian {
    id: number;
    no_po: string;
    tanggal: string;
    pemasok_id: number;
    status: 'dipesan' | 'diterima';
    cara_bayar: 'tunai' | 'tempo' | 'konsinyasi';
    total: number;
    jatuh_tempo: string | null;
    /** Hasil withSum; bisa berupa teks dari database. */
    dibayar?: number | string | null;
    pembayaran?: Pembayaran[];
    tanggal_terima: string | null;
    keterangan: string | null;
    pemasok?: Pemasok;
    detail?: DetailItem[];
    pembuat?: { id: number; name: string } | null;
    penerima?: { id: number; name: string } | null;
}

export interface MutasiStok {
    id: number;
    tanggal: string;
    jenis: 'masuk' | 'keluar';
    jumlah: number;
    stok_akhir: number;
    referensi: string;
    keterangan: string | null;
    user?: { id: number; name: string } | null;
}

export type StatusPesanan = 'baru' | 'diambil' | 'dikemas' | 'dikirim' | 'selesai' | 'batal';

export interface Pesanan {
    id: number;
    no_pesanan: string;
    tanggal: string;
    pelanggan_id: number;
    status: StatusPesanan;
    cara_bayar: 'tunai' | 'tempo';
    total: number;
    jatuh_tempo: string | null;
    dibayar?: number | string | null;
    pembayaran?: Pembayaran[];
    jumlah_koli: number | null;
    ekspedisi: string | null;
    no_resi: string | null;
    tanggal_kirim: string | null;
    keterangan: string | null;
    pelanggan?: Pelanggan;
    detail?: DetailItem[];
    pembuat?: { id: number; name: string } | null;
    riwayat?: RiwayatPesanan[];
}

/** Jejak proses pesanan: siapa mengubah status menjadi apa, dan kapan. */
export interface RiwayatPesanan {
    id: number;
    status: StatusPesanan;
    waktu: string;
    user?: { id: number; name: string; role: Role } | null;
}

/** Satu baris arus kas. */
export interface Pembayaran {
    id: number;
    no_bukti: string;
    tanggal: string;
    arah: 'masuk' | 'keluar';
    jenis: 'piutang' | 'hutang' | 'konsinyasi' | 'saldo_awal';
    jumlah: number;
    metode: 'tunai' | 'transfer';
    keterangan: string | null;
    user?: { id: number; name: string } | null;
    pesanan?: Pesanan | null;
    pembelian?: Pembelian | null;
    penyelesaian?: PenyelesaianKonsinyasi | null;
}

export interface PenyelesaianKonsinyasi {
    id: number;
    no_penyelesaian: string;
    pemasok_id: number;
    periode_awal: string;
    periode_akhir: string;
    total: number;
    jatuh_tempo: string;
    dibayar?: number | string | null;
    pemasok?: Pemasok;
    pembuat?: { id: number; name: string } | null;
    pembayaran?: Pembayaran[];
    detail?: { id: number; barang_id: number; jumlah_terjual: number; harga_satuan: number; subtotal: number; barang?: Barang }[];
}

export interface PemenuhanPemasok {
    id: number;
    kode_pemasok: string;
    nama: string;
    jumlah_po: number;
    po_belum_datang: number;
    dipesan: number;
    diterima: number;
    persen: number | null;
    po_kurang_kirim: number;
    pcs_belum_datang: number;
    rata_lama_kirim: number | null;
}

export interface UmurPiutang {
    label: string;
    jumlah: number;
    nilai: number;
}
