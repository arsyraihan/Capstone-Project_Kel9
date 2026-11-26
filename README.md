# SIM Inventaris Pakaian

Sistem Informasi Manajemen Inventaris Pakaian berbasis **Laravel 12 + Inertia.js + React (TypeScript)** dengan database **PostgreSQL (Supabase)**.

## Prasyarat

Pastikan sudah terpasang:

| Kebutuhan | Versi | Cek |
|---|---|---|
| PHP | 8.2 atau lebih baru | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js + npm | 20 atau lebih baru | `node -v` |
| Git | terbaru | `git --version` |

Ekstensi PHP yang harus aktif: `pdo_pgsql`, `pgsql`, `mbstring`, `openssl`, `xml`, `ctype`, `fileinfo`, `curl`.
(Di Windows/XAMPP, hapus tanda `;` pada `extension=pdo_pgsql` dan `extension=pgsql` di `php.ini`.)

## Langkah Instalasi

### 1. Clone repository
```bash
git clone https://github.com/arsyraihan/Capstone-Project_Kel9.git
cd Capstone-Project_Kel9
```

### 2. Pasang dependensi
```bash
composer install
npm install
```

### 3. Buat file environment
```bash
cp .env.example .env        # Windows PowerShell: copy .env.example .env
php artisan key:generate
```

### 4. Atur koneksi database di `.env`
Database memakai PostgreSQL. Isi bagian berikut (minta nilainya ke pemilik proyek, atau pakai Postgres/Supabase milik sendiri):

```env
DB_CONNECTION=pgsql
DB_HOST=aws-0-<region>.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.<project-ref>
DB_PASSWORD=<password-database>
DB_SSLMODE=require
```

> Untuk Supabase, ambil data koneksi di **Project Settings > Database > Connection string > Session pooler**.
> **Jangan commit file `.env`** (sudah ada di `.gitignore`).

### 5. Jalankan migrasi dan seeder
```bash
php artisan migrate --seed
```
Perintah ini membuat semua tabel dan mengisi data contoh (rak, pemasok, pelanggan, barang, serta transaksi contoh).

> Perintah di atas untuk database **baru/kosong**. Jika database Supabase bersama sudah berisi data,
> cukup jalankan `php artisan migrate`, lalu `php artisan db:seed --class=SinkronKeuanganSeeder`
> (lihat bagian *Fitur keuangan & monitoring*).

> ⚠️ Jangan memakai `migrate:fresh` atau `db:wipe` pada database bersama (Supabase), karena akan **menghapus seluruh data**.

### 6. Jalankan aplikasi
Buka **dua terminal**:

```bash
# Terminal 1 - server Laravel
php artisan serve

# Terminal 2 - Vite (frontend)
npm run dev
```
> Di PowerShell, jika `npm run dev` gagal karena *execution policy*, pakai `npm.cmd run dev`.

Buka **http://localhost:8000** di browser.

## Akun Demo

| Peran | Email | Password | Tugas |
|---|---|---|---|
| Admin | `admin@inventaris.test` | `password` | Akun pengguna dan master data |
| Staf Pengadaan & CO | `pengadaan@inventaris.test` | `password` | PO ke pemasok, pesanan pelanggan |
| Staf Gudang | `gudang@inventaris.test` | `password` | Penerimaan, penyimpanan, stok |
| Packing (Picker) | `picker@inventaris.test` | `password` | Pengambilan barang di rak |
| Pengemasan & Pengiriman | `pengiriman@inventaris.test` | `password` | Kemas, kirim, Surat Jalan, selesai |
| Manajemen | `manajemen@inventaris.test` | `password` | Monitoring pemasok, hutang, piutang, kas, konsinyasi |

> Akun `petugas@inventaris.test` (peran lama) tetap ada di database bersama sampai diubah oleh admin
> lewat menu **Pengguna** ke salah satu peran di atas.

### Untuk database yang sudah berisi data contoh

Jalankan sekali setelah `php artisan migrate`:

```bash
php artisan db:seed --class=SinkronPeranSeeder
```

Seeder ini membuat akun enam peran dan menyesuaikan pelaksana pada transaksi contoh. Data buatan anggota
kelompok setelah 6 Nov 2026 tidak diubah.

## Fitur keuangan & monitoring

**Monitoring pemasok.** Gudang mengisi **jumlah datang** saat penerimaan. Menu *Monitoring Pemasok* dan
dashboard membandingkan barang dipesan dengan yang diterima (persentase pemenuhan, PO kurang kirim,
PO belum datang, rata-rata lama kirim).

**Pembayaran ke pemasok** (dipilih saat membuat PO):

| Cara bayar | Kapan menjadi hutang | Jatuh tempo |
|---|---|---|
| Tunai | saat barang diterima | tanggal terima |
| Tempo (kredit) | saat barang diterima, boleh dicicil | tanggal terima + termin pemasok |
| Konsinyasi | saat barang titipan terjual | periode akhir penyelesaian + termin pemasok |

Hutang dihitung dari jumlah yang **diterima**, bukan yang dipesan.

**Pembayaran dari pelanggan:** piutang timbul saat pesanan dikirim. Tunai jatuh tempo pada tanggal kirim,
tempo ditambah termin pelanggan.

**Konsinyasi:** barang jenis *konsinyasi* tetap milik pemasok. Manajemen membuat penyelesaian per periode
(jumlah terjual × harga titip). Barang tidak laku dapat diretur oleh gudang (*Retur Konsinyasi*).
Penjualan yang dikirim pada tanggal akhir periode **setelah** penyelesaian dibuat tidak ikut tertagih,
jadi buat penyelesaian setelah pengiriman hari itu selesai.

| Menu | Boleh melihat | Boleh mencatat |
|---|---|---|
| Monitoring Pemasok | manajemen, admin, pengadaan | - |
| Hutang, Piutang, Buku Kas, Konsinyasi | manajemen, admin | manajemen |
| Retur Konsinyasi | gudang | gudang |

### Untuk database Supabase yang sudah berisi data

Jalankan sekali, berurutan:

```bash
php artisan migrate
php artisan db:seed --class=SinkronKeuanganSeeder
```

Seeder ini mengisi harga barang yang masih 0, menghitung nilai PO dan pesanan lama, lalu mencatatnya
**sudah lunas** ("Pelunasan data lama") agar tidak muncul sebagai tunggakan. Aman dijalankan berulang.
Karena tidak ada saldo awal kas pada data lama, saldo di Buku Kas bisa tampak negatif.

## Build untuk Produksi
```bash
npm run build
```

## Masalah Umum

- **`could not find driver`**: ekstensi `pdo_pgsql` belum aktif di `php.ini`.
- **Halaman kosong / error Vite manifest**: `npm run dev` belum berjalan, atau jalankan `npm run build`.
- **Koneksi database ditolak**: periksa host, username, password, dan pastikan `DB_SSLMODE=require`.
- **`No application encryption key`**: jalankan `php artisan key:generate`.
