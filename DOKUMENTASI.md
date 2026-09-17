# 📋 DOKUMENTASI PROYEK: ENGLISH CLUB SMEGA PORTAL

> Berkas panduan operasional mandiri, arsitektur teknis, dan pelacak status pengerjaan untuk proyek ke-4 Chandra: **English Club SMEGA (Attendance & Community Portal)**.

---

## 🛠️ PILAR 1: SETUP & PANDUAN PENGEMBANGAN (HOW-TO)

### 1.1. Konfigurasi Lingkungan Lokal
- **File Konfigurasi**: `.env.local`
  ```env
  VITE_SUPABASE_URL=https://hqsbmomlubeasmpnwkcb.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Kredensial Vault (Recall Ready)**:
  - Supabase URL: `https://hqsbmomlubeasmpnwkcb.supabase.co`
  - Supabase Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Database Password: `englishclubsmega666`
  - Mentor Quick PIN: `123321` (disimpan otomatis di `localStorage` per perangkat)
  - GitHub Repo: `https://github.com/channdraa-afk/English-Club`
  - Vercel Project: `english-club` (Team Evergarden)

### 1.2. Perintah Penting
- **Instalasi**: `npm install`
- **Jalankan Lokal**: `npm run dev`
- **Build Produksi**: `npm run build`
- **Inisialisasi Database**: Salin isi `supabase/setup_database.sql` dan jalankan di SQL Editor Supabase.

---

## 📦 PILAR 2: APA SAJA YANG DIPAKAI (STACK & DEPENDENCIES)

### 2.1. Frontend & Framework
- **React 19** (`^19.0.0`) & **Vite 6** (`^6.2.0`): Kompilasi kilat, performa tinggi, konsumsi memori rendah.
- **TypeScript**: Type-safety untuk entitas member, presensi, token, dan feedback.
- **Tailwind CSS 3.4**: Utility-first styling dengan sistem `shadow-tactile` kustom ala Duolingo.
- **Lucide React**: Ikon antarmuka modern yang ringan.
- **Google Font Nunito**: Tipografi ramah dan mudah dibaca di layar smartphone.

### 2.2. Audio Engine & Efek Interaktif
- **Web Audio API Pure Synthesizer** (`src/lib/audio.ts`):
  - `sound.playPop()`: Efek taktil klik tombol 3D.
  - `sound.playSuccess()`: Harmoni 3-nada selebrasi saat presensi terekam.
  - `sound.playError()`: Nada peringatan saat token keliru.
- **Canvas Confetti** (`canvas-confetti`): Ledakan konfeti lembut saat presensi berhasil diserahkan.

### 2.3. Backend & Cloud Database
- **Supabase (PostgreSQL 15)**:
  - `@supabase/supabase-js`: Klien resmi.
  - Skema 5 Tabel: `members`, `meetings`, `attendances`, `registrations`, `app_settings`.
  - Row Level Security (RLS) terpasang.

---

## 📍 PILAR 3: STATE TRACKER (STATUS SAAT INI & ROADMAP)

### 3.1. Milestone Selesai (Completed)
- [x] Ekstraksi dan pembersihan master data dari berkas Word resmi (`LAPORAN DAFTAR ANGGOTA` & `Struktur_Sie_Kerja`):
  - 104 anggota aktif Angkatan 21 (2 siswa keluar ditandai inaktif).
  - 59 pengurus Angkatan 20 lengkap dengan pemetaan 7 Koordinator Sie dan catatan *double job* (Reisya Saumi Agatha - Pengajar & PDD).
- [x] Perancangan skema database DDL dan skrip seed 165 anggota (`supabase/setup_database.sql`).
- [x] UI Presensi Siswa Mobile-First:
  - Smart autocomplete nama anti-typo.
  - Input token fisik papan tulis.
  - Feedback 3 emotikon + input bebas ide *"Next Agenda Mau Ngapain?"*.
  - Checkbox *"Kirim Anonim"*.
  - Kartu selebrasi *Word of the Day* siap screenshot.
- [x] Portal Rahasia Pengurus (Mentor Dashboard):
  - Autentikasi PIN (`123321`) + auto-save login di `localStorage`.
  - Pintu masuk rahasia mentor via spam-click 5x pada logo EC (ikon perisai dihapus dari navbar publik).
  - Kontrol sesi pertemuan, token generator, dan tombol set pertemuan libur + banner pengumuman otomatis.
  - Rekap harian dengan tombol "Tandai Hadir Manual" untuk siswa yang izin pindah ekskul.
  - Rekap Matriks Bulanan untuk Sekretaris dengan 2 opsi ekspor: Cetak/Simpan PDF (bersih tanpa kop & tanda tangan) serta Ekspor CSV.
  - Presensi terpisah khusus mentor Angkatan 20.
  - Brankas ide & masukan siswa.
  - Portal ACC pendaftaran anggota baru (approval otomatis masuk tabel `members`).
  - Visualisasi bagan pengurus 59 anggota.
- [x] Manajemen berkas bersih: dokumen mentah docx & json dirapikan ke dalam subfolder `arsip-data/` (di-ignore di Git).
- [x] Standar dokumentasi `README.md` & `DOKUMENTASI.md` tanpa prompt leak.

### 3.2. Roadmap Selanjutnya
- [ ] Menjalankan skrip `supabase/setup_database.sql` di dashboard Supabase milik Chandra.
- [ ] Push kode pertama ke GitHub `channdraa-afk/English-Club` untuk memicu deploy otomatis di Vercel.
- [ ] Menghubungkan domain custom `.my.id` di dashboard Vercel.
