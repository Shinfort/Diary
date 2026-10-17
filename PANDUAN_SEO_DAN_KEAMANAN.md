# 📘 Rangkuman & Panduan Lengkap SEO & Keamanan Siber Shine Journal

Dokumen ini merangkum seluruh konfigurasi **SEO (Search Engine Optimization)**, **Peta Situs (Sitemap)**, **Riset Kata Kunci**, dan **Sistem Keamanan Siber** yang telah diterapkan pada aplikasi **Shine Journal**.

---

## 🌐 1. Akses & URL Penting

| Halaman | URL Akses | Deskripsi & Hak Akses |
| :--- | :--- | :--- |
| **Beranda Publik (Mode Baca)** | [https://shinejournals.vercel.app](https://shinejournals.vercel.app) | Terbuka untuk umum/anonim. Pengunjung dapat membaca linimasa catatan publik, melihat galeri foto/video, dan menyaring mood tanpa perlu login. |
| **Login Administrator** | [https://shinejournals.vercel.app/login](https://shinejournals.vercel.app/login) | **Khusus Pemilik/Admin**. Tombol login di beranda telah disembunyikan. Hanya email `p.utari087@gmail.com` yang diizinkan masuk. |
| **Dashboard Kelola Jurnal** | [https://shinejournals.vercel.app/admin](https://shinejournals.vercel.app/admin) | Area privat untuk menulis catatan baru, mengunggah foto/video (kuota 5GB), memilih mood, dan mengedit tulisan. |
| **Peta Situs Dinamis** | [https://shinejournals.vercel.app/sitemap.xml](https://shinejournals.vercel.app/sitemap.xml) | Peta situs XML yang otomatis membaca timestamp catatan terbaru dari database untuk Googlebot. |
| **Arahan Bot Mesin Pencari** | [https://shinejournals.vercel.app/robots.txt](https://shinejournals.vercel.app/robots.txt) | Mengizinkan perayapan halaman publik dan memblokir area privat/API dari pencarian Google. |

---

## 🔍 2. Hasil Riset Keyword (Kata Kunci Google)

Kata kunci berikut telah ditanamkan ke dalam `metadata.keywords`, tag meta deskripsi, dan konten artikel semantik:

| Kategori | Kata Kunci Target | Search Intent Pengguna Google |
| :--- | :--- | :--- |
| **Head Terms (Utama)** | `diary online`, `buku harian online`, `jurnal harian online`, `buku diary digital` | Pencarian volume tinggi untuk website pencatat harian pribadi. |
| **Visual & Estetika (Niche)** | `diary online estetik`, `buku harian estetik`, `web diary book`, `aesthetic diary online` | Pengguna yang menyukai konsep buku fisik realistis dan tema menarik. |
| **Fitur & Manfaat** | `mood tracker indonesia`, `galeri memori foto video`, `catatan harian rahasia`, `ruang cerita pribadi` | Mencari buku harian yang mendukung pelacakan suasana hati dan media foto/video. |
| **Long-tail (Pertanyaan Google)** | `rekomendasi buku harian online gratis`, `buku catatan harian yang bisa dibuka di HP` | Pertanyaan spesifik di Google yang langsung dijawab oleh FAQ Rich Snippets. |

---

## 📈 3. Optimasi On-Page SEO & Data Terstruktur

### A. Meta Data & Open Graph (`src/app/layout.tsx`)
- **Title Tag**: `Shine Journal - Buku Catatan Harian Pribadi & Diary Online Interaktif`
- **Description**: Menjelaskan fitur buku fisik digital, galeri foto & video, serta mood tracker dalam 155 karakter yang ramah CTR.
- **Social Card Preview (`src/app/opengraph-image.tsx`)**: Menghasilkan gambar thumbnail 1200×630 beresolusi tinggi otomatis saat tautan dibagikan di WhatsApp, Twitter/X, Telegram, atau Facebook.

### B. Schema.org JSON-LD & FAQ Rich Snippets
Website dilengkapi skema data terstruktur standar industri:
1. **`WebSite`**: Mendefinisikan entitas situs resmi.
2. **`WebApplication`**: Memberitahu Google bahwa situs ini adalah aplikasi web gaya hidup responsif (mendukung PWA).
3. **`FAQPage`**: Berisi tanya-jawab resmi yang memungkinkan Google menampilkan menu dropdown interaktif langsung di halaman hasil pencarian (*Google Search Results*).

### C. Komponen Tanya-Jawab Interaktif (`src/components/FaqSection.tsx`)
Menampilkan akordeon FAQ langsung di bawah buku harian beranda. Ini memastikan kepatuhan terhadap pedoman Google (konten schema harus terlihat langsung oleh pengguna).

---

## 🗺️ 4. Sitemap Dinamis & robots.txt

### `src/app/sitemap.ts`
Menggunakan fungsi asinkron yang terhubung ke database Neon PostgreSQL:
```sql
SELECT MAX(created_at) as latest FROM diary_entries
```
- Setiap kali Anda mempublikasikan cerita baru, atribut `lastModified` di `sitemap.xml` akan otomatis terbarui.
- Googlebot akan memprioritaskan perayapan ulang untuk mengindeks cerita baru Anda lebih cepat.

### `src/app/robots.ts`
- **Allow**: `/` (Halaman utama/publik)
- **Disallow**: `/admin`, `/api/*`, `/verify*`, `/login` (Menjaga keamanan dan menghemat kuota *crawl budget* Googlebot).

---

## 🔒 5. Keamanan Siber (Cybersecurity Hardening)

Seluruh celah keamanan potensial telah ditambal dengan standar defensif OWASP:

| Aspek Keamanan | Implementasi & Pertahanan | Lokasi File |
| :--- | :--- | :--- |
| **Penutupan Registrasi Publik** | Endpoint registrasi ditutup total (`403 Forbidden`). Pengunjung umum tidak bisa mendaftar akun. | `src/app/api/auth/register/route.ts` |
| **Penguncian Login Admin** | Hanya email `p.utari087@gmail.com` dengan peran `admin` yang diizinkan untuk login. Akun lain otomatis ditolak. | `src/app/api/auth/login/route.ts` |
| **Anti Brute-Force (Rate Limiting)** | Maksimal 5 kali percobaan login gagal dalam 15 menit. Jika terlampaui, IP diblokir sementara (*HTTP 429 Too Many Requests*). | `src/app/api/auth/login/route.ts` |
| **Perlindungan Reset Password** | Password tidak pernah dibocorkan ke respon API. Password baru hanya dikirim langsung ke email admin terdaftar via SMTP. | `src/app/api/auth/forgot-password/route.ts` |
| **Header Keamanan OWASP** | Menangkal Clickjacking (`X-Frame-Options: DENY`), MIME Sniffing (`X-Content-Type-Options: nosniff`), serta pembatasan izin hardware. | `next.config.ts` |
| **Enkripsi Token JWT** | Kunci rahasia JWT diperbarui menggunakan string acak kriptografis 256-bit. | `.env.local` & `src/lib/auth.ts` |

---

## 🚀 6. Checklist Pemilik untuk Google Search Console

1. **Verifikasi Kepemilikan**:
   - Tag HTML telah terpasang di `<head>`:
     ```html
     <meta name="google-site-verification" content="u7zPsJZz_B9xa88111H4eDmzYxl3_7SQacxySUErQIc" />
     ```
   - Klik **Verify** di Google Search Console.
2. **Kirimkan Sitemap**:
   - Di menu **Sitemaps**, masukkan `sitemap.xml` lalu klik **Submit**.
3. **Minta Pengindeksan Prioritas (Request Indexing)**:
   - Ketik `https://shinejournals.vercel.app/` di bilah inspeksi URL paling atas, lalu klik **Request Indexing**.
4. **Cek Hasil di Google**:
   - Secara berkala ketik di Google: `site:shinejournals.vercel.app`.
