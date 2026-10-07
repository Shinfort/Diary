# 📖 Private Diary App (Buku Harian Pribadi)

Aplikasi catatan harian pribadi interaktif dengan tampilan visual berbentuk buku (*Diary Book*). Aplikasi ini dikembangkan menggunakan **Next.js (App Router)**, **PostgreSQL (via Neon/pg)**, **Nodemailer**, dan UI modern yang interaktif.

Aplikasi memiliki dua akses utama:
1. **Halaman Publik (`/`)**: Bersifat *read-only* (hanya baca) untuk pengunjung umum/anonim untuk membaca timeline catatan yang dibagikan.
2. **Dashboard Admin (`/admin`)**: Digunakan oleh pemilik buku harian untuk menulis catatan baru, menghapus memori lama, dan melihat status sesi aktif.

---

## 🚀 Fitur Utama

- **Book-like Layout**: Desain unik menyerupai buku harian fisik dengan sidebar navigasi interaktif.
- **Admin Console**: Halaman khusus untuk mengelola seluruh tulisan di `/admin` (tulis entri, pilih mood, dan hapus entri).
- **Secure Authentication**: Keamanan terjamin menggunakan token JWT yang disimpan dalam *HTTP-only cookie* serta enkripsi password *bcrypt*.
- **Forgot Password System**: Fitur pemulihan otomatis yang mengirimkan password acak baru langsung ke email admin yang terdaftar menggunakan SMTP/Gmail.
- **Responsive Design**: Tampilan yang rapi dan nyaman dibaca di perangkat mobile maupun desktop.

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum mulai, pastikan Anda telah menginstal/menyiapkan:
- **Node.js** (v18.x atau yang terbaru)
- **PostgreSQL Database** (direkomendasikan menggunakan [Neon.tech](https://neon.tech/) atau database PostgreSQL lokal)
- **Akun Gmail & App Password** (jika ingin menggunakan fitur pengiriman email pemulihan sandi)

---

## 📦 Cara Memasang & Menjalankan Proyek

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal Anda:

### 1. Clone & Install Dependensi
Buka terminal pada direktori proyek Anda (misalnya di [Diary](file:///F:/Web/Diary)) lalu jalankan:
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Buat file bernama `.env.local` di direktori utama (root) proyek dan isi dengan konfigurasi berikut:
```env
# Koneksi ke database PostgreSQL (contoh menggunakan Neon DB)
DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require

# Kunci rahasia untuk enkripsi token JWT
JWT_SECRET=isi_dengan_string_acak_dan_panjang_anda

# Konfigurasi pengiriman email SMTP (untuk pemulihan password)
SMTP_EMAIL=email_anda@gmail.com
SMTP_PASSWORD=app_password_gmail_16_karakter
```
> [!IMPORTANT]
> **SMTP_PASSWORD** bukan password akun Gmail biasa Anda. Anda harus mengaktifkan *2-Step Verification* pada akun Google Anda, kemudian membuat **App Password** (Sandi Aplikasi) di pengaturan keamanan Google Anda.

### 3. Inisialisasi Database & Seeding Awal
Jalankan script inisialisasi database berikut untuk membuat tabel-tabel yang diperlukan (`users`, `diary_entries`, dan `diary_profile`) sekaligus membuat akun admin pertama dan profil default:
```bash
node scripts/init-db.js
```
Jika database Anda kosong, script ini akan secara otomatis melakukan:
- Membuat tabel database yang dibutuhkan.
- Mengisi data profil default.
- Membuat akun admin default menggunakan email dari `SMTP_EMAIL` Anda (atau `admin@diary.com` sebagai cadangan) dengan password default: `adminpassword123`.

### 4. Jalankan Server Pengembangan (Dev Server)
Jalankan perintah berikut untuk mulai menjalankan website di lokal:
```bash
npm run dev
```
Setelah server menyala, buka browser Anda dan akses:
- **Halaman Utama (Publik)**: [http://localhost:3000](http://localhost:3000)
- **Halaman Login Admin**: [http://localhost:3000/login](http://localhost:3000/login)

### 5. Membangun Proyek untuk Produksi (Build & Start)
Untuk performa terbaik di lingkungan produksi:
```bash
npm run build
npm run start
```

---

## 🔐 Tata Cara Masuk ke Admin Panel

Untuk mengelola tulisan harian, Anda harus masuk sebagai administrator dengan langkah berikut:

1. Navigasikan ke halaman login di [http://localhost:3000/login](http://localhost:3000/login).
2. Masukkan **Email** administrator yang terdaftar dan **Password** Anda.
   - **Kredensial Default Awal**:
     - **Email**: Email yang Anda masukkan pada variabel `SMTP_EMAIL` di `.env.local` (atau `admin@diary.com` jika tidak diset).
     - **Password**: `adminpassword123`
3. Tekan tombol **Authenticate Admin**. Setelah berhasil masuk, Anda akan langsung diarahkan ke Dashboard Admin di [http://localhost:3000/admin](http://localhost:3000/admin).
4. **Fitur Lupa Password**:
   - Jika Anda lupa password, klik **Forgot Password?** di halaman login.
   - Masukkan email administrator Anda, lalu klik **Send Recovery Email**.
   - Sistem akan menghasilkan password acak baru secara otomatis, memperbaruinya di database, dan mengirimkannya ke kotak masuk email Anda menggunakan SMTP. Gunakan password baru tersebut untuk masuk.
5. **Logout**:
   - Untuk keluar dari sesi admin, klik tab **Settings** di panel navigasi buku sebelah kiri, lalu klik tombol merah **Logout from Admin**.

---

## 🌐 Panduan Deployment (Cara Deploy)

Aplikasi ini siap dideploy ke platform cloud seperti **Vercel** (paling direkomendasikan untuk Next.js) atau platform VPS/PaaS lainnya:

### Deploy ke Vercel

1. Hubungkan repositori GitHub proyek Anda ke dashboard **Vercel**.
2. Sebelum melakukan deploy, masuk ke tab **Environment Variables** di Vercel, lalu tambahkan variabel berikut yang sesuai dengan database dan server mail Anda:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SMTP_EMAIL`
   - `SMTP_PASSWORD`
3. Klik tombol **Deploy**. Vercel akan otomatis mendeteksi konfigurasi Next.js, melakukan *build*, dan mempublikasikan website Anda.
4. **Migrasi Database Produksi**:
   Setelah deploy berhasil, jalankan script inisialisasi database (`node scripts/init-db.js`) satu kali di lokal dengan mengubah sementara isi `DATABASE_URL` di file `.env.local` Anda agar mengarah ke database produksi Anda, guna memastikan seluruh tabel terbuat dengan benar.

---

## 📁 Struktur Tabel Database

Aplikasi ini menggunakan PostgreSQL dengan 3 tabel utama:
- `users`: Menyimpan kredensial login administrator (`id`, `email`, `password_hash`, `created_at`).
- `diary_entries`: Menyimpan catatan harian yang Anda tulis (`id`, `title`, `content`, `mood`, `created_at`).
- `diary_profile`: Menyimpan informasi biografi singkat pemilik buku harian (`id`, `name`, `pronouns`, `farm`, `status`, `avatar_url`, `created_at`).
