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

| Peran | Email | Password |
|---|---|---|
| Admin | `admin@inventaris.test` | `password` |
| Petugas | `petugas@inventaris.test` | `password` |

## Build untuk Produksi
```bash
npm run build
```

## Masalah Umum

- **`could not find driver`**: ekstensi `pdo_pgsql` belum aktif di `php.ini`.
- **Halaman kosong / error Vite manifest**: `npm run dev` belum berjalan, atau jalankan `npm run build`.
- **Koneksi database ditolak**: periksa host, username, password, dan pastikan `DB_SSLMODE=require`.
- **`No application encryption key`**: jalankan `php artisan key:generate`.
