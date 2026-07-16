# Aplikasi Parkir (ParkirApp)

Sistem manajemen parkir berbasis web untuk mengelola operasional parkir kendaraan. Dibangun dengan **Laravel 12** (backend) dan **React 19 + TypeScript** (frontend) menggunakan Inertia.js SPA.

## Tujuan dan Fungsi Project

Aplikasi Parkir (ParkirApp) dirancang khusus untuk memodernisasi dan mendigitalisasi operasional parkir kendaraan (motor dan mobil). Sistem ini berfungsi sebagai pusat kendali untuk mencatat kendaraan yang masuk dan keluar, menghitung biaya parkir secara otomatis berdasarkan durasi, serta memberikan laporan pendapatan yang akurat dan transparan secara real-time.

## Kelebihan dan Kemudahan

- **Efisien & Cepat**: Proses check-in dan check-out yang efisien, membantu meminimalkan antrean di gerbang parkir.
- **Akurat & Otomatis**: Perhitungan tarif dilakukan secara otomatis oleh sistem, mencegah *human error* dan memastikan transparansi biaya.
- **Pessimistic Locking**: Mencegah konflik data (race condition) saat banyak transaksi terjadi di saat bersamaan.
- **Mudah Digunakan (User Friendly)**: Antarmuka yang modern (React + shadcn/ui), responsif, dan mendukung fitur **Dark Mode** untuk kenyamanan mata pengguna.
- **Akses Fleksibel**: Berbasis SPA (Single Page Application), dapat diakses di berbagai perangkat dengan navigasi halaman yang sangat cepat tanpa reload.
- **Transparansi Publik**: Tersedia halaman pengecekan parkir publik di mana pelanggan bisa mengecek status kendaraan dan biaya parkir mereka.
- **Keamanan Terjamin**: Dilengkapi dengan sistem persetujuan akun (Account Approval) untuk staf baru dan opsi Autentikasi Dua Faktor (2FA).


## Fitur

- **Manajemen Area Parkir** — Kelola zona parkir dengan kapasitas dan status real-time
- **Check-in / Check-out** — Transaksi parkir masuk/keluar dengan penguncian data (pessimistic locking) untuk mencegah race condition
- **Penghitungan Biaya Otomatis** — Tarif dihitung berdasarkan durasi (per jam) sesuai jenis kendaraan
- **Manajemen Tarif** — Atur tarif per jam untuk motor dan mobil
- **Manajemen Kendaraan** — Registrasi kendaraan pelanggan
- **Cek Parkir Publik** — Halaman publik untuk mengecek status parkir berdasarkan plat nomor
- **Laporan & Log Aktivitas** — Riwayat aktivitas dengan ekspor CSV
- **Dashboard** — Ringkasan data parkir (pendapatan, kapasitas, transaksi) — role-aware
- **Multi Role** — Owner (pemilik penuh), Admin (manajemen), Petugas (operasional)
- **Persetujuan Akun** — Admin/Petugas baru harus disetujui Owner sebelum dapat login
- **2FA** — Two-factor authentication
- **Dark Mode** — Tampilan gelap/terang

## Tech Stack

| Layer        | Teknologi                                          |
|-------------|-----------------------------------------------------|
| Backend      | PHP 8.2+, Laravel 12                                |
| Frontend     | React 19, TypeScript 5, Inertia.js 2                |
| Styling      | Tailwind CSS 4, shadcn/ui (New York), Radix UI      |
| Database     | MySQL (produksi) / SQLite (pengembangan)            |
| Build Tools  | Vite 7, Laravel Vite Plugin                         |
| Auth         | Laravel Fortify                                     |
| Testing      | Pest PHP                                            |

## Persyaratan Sistem

### Linux (Ubuntu/Debian)

- PHP 8.2 atau lebih baru
  - Ekstensi: `bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`, `pdo_mysql` (jika pakai MySQL), `pdo_sqlite`, `tokenium`, `xml`
- Composer 2.x
- Node.js 22.x atau lebih baru
- NPM 10.x atau lebih baru
- MySQL 8.x / MariaDB 10.x (opsional, bisa pakai SQLite)

### Windows

- PHP 8.2 atau lebih baru ([php.net](https://php.net/downloads))
  - Ekstensi yang sama seperti di Linux (aktifkan di `php.ini`)
- Composer 2.x ([getcomposer.org](https://getcomposer.org/download/))
- Node.js 22.x atau lebih baru ([nodejs.org](https://nodejs.org/))
- NPM (bundling dengan Node.js)
- MySQL 8.x / MariaDB 10.x (opsional)
- **Visual C++ Redistributable** (diperlukan PHP dan beberapa ekstensi)

> **Catatan MySQL:** Secara default `.env.example` menggunakan SQLite. Jika ingin menggunakan MySQL, sesuaikan konfigurasi database di `.env`.

## Cara Install dan Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/<username>/aplikasi_parkir.git
cd aplikasi_parkir
```

### 2. Install Dependencies

#### Linux

```bash
composer install
npm install
```

#### Windows (CMD / PowerShell / Git Bash)

```bash
composer install
npm install
```

> Jika ada error saat `npm install` di Windows, coba hapus `node_modules` dan `package-lock.json`, lalu jalankan ulang, atau gunakan Git Bash / WSL.

### 3. Konfigurasi Environment

```bash
cp .env.example .env
```

Ubah isi `.env` sesuai kebutuhan:

```env
APP_NAME=ParkirApp
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite    # atau mysql
```

Jika menggunakan **MySQL**:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parkir
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Generate App Key

```bash
php artisan key:generate
```

### 5. Buat Database

#### SQLite (default)

Di Linux:

```bash
touch database/database.sqlite
```

Di Windows (CMD):

```cmd
type nul > database\database.sqlite
```

Di Windows (PowerShell / Git Bash):

```bash
New-Item database/database.sqlite -ItemType File
# atau
touch database/database.sqlite
```

#### MySQL

```sql
CREATE DATABASE parkir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Jalankan Migrasi dan Seeder

```bash
php artisan migrate --seed
```

Perintah ini akan:
- Membuat tabel-tabel database
- Mengisi data awal (area parkir, tarif, kendaraan contoh)
- Membuat akun Owner default

### 7. Build Frontend

```bash
npm run build
```

### 8. Jalankan Aplikasi

Butuh **dua terminal terpisah**:

**Terminal 1 — Laravel Server:**

```bash
php artisan serve
```

Aplikasi bisa diakses di `http://localhost:8000`

**Terminal 2 — Vite Dev Server (untuk development/hot reload):**

```bash
npm run dev
```

> Untuk **production**, cukup jalankan `php artisan serve` setelah `npm run build`. Vite dev server tidak diperlukan saat production.

### Alternatif: Menjalankan Sekaligus

```bash
php artisan serve & npm run dev
```

Atau:

```bash
composer run dev
```

## Akun Default (Seeder)

| Role     | Email               | Password  |
|----------|---------------------|-----------|
| Owner    | owner@parkir.com    | password  |

> Login sebagai Owner, lalu setujui akun Admin/Petugas lain dari menu User Management.

## Struktur Database

| Tabel               | Keterangan                           |
|---------------------|--------------------------------------|
| `users`             | Pengguna dengan role & status approval |
| `tb_area_parkir`    | Zona parkir + kapasitas              |
| `tb_kendaraan`      | Data kendaraan terdaftar             |
| `tb_tarif`          | Tarif per jam per jenis kendaraan    |
| `tb_transaksi`      | Riwayat parkir masuk/keluar          |
| `tb_log_aktivitas`  | Catatan audit seluruh aktivitas      |

## Perintah Berguna

```bash
# Reset database
php artisan migrate:fresh --seed

# Membuat storage link (jika perlu)
php artisan storage:link

# Melihat daftar route
php artisan route:list

# Menjalankan test
php artisan test

# Code style fix (Laravel Pint)
./vendor/bin/pint
```

## Pemecahan Masalah

### `The APP_KEY is required`

Jalankan `php artisan key:generate`

### `Target class [seeder_class] does not exist`

Jalankan `composer dump-autoload` lalu ulangi migrasi.

### `Vite manifest not found`

Jalankan `npm install && npm run build`.

### Error koneksi database MySQL

Pastikan service MySQL berjalan, database sudah dibuat, dan kredensial di `.env` benar.

### Error `touch` tidak dikenal di Windows

Gunakan `type nul > database\database.sqlite` (CMD). Alternatif: install Git Bash atau gunakan WSL.

### Permission denied storage/

```bash
chmod -R 775 storage bootstrap/cache
```
