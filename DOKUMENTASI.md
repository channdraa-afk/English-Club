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
- [x] Integrasi Logo Resmi EC SMEGA (`public/logo.png`) pada Navbar taktil dan Favicon tab browser.
- [x] Perapihan footer developer: pembersihan teks embel-embel jurusan sehingga bersih dan profesional (`Dikembangkan oleh Chandra (@channdraa-afk).`).
- [x] Sembunyikan Akses Ketua: Tombol `[ 👑 Akses Ketua ]` di-hide total dari pandangan publik/kakak kelas. Pintu masuk Super Admin murni via 3-tap kartu Chandra di tab Struktur Pengurus dengan password `mybinivioletevergarden`.
- [x] Sistem Jadwal Otomatis & Auto-Reset Token (`src/lib/schedule.ts`):
  - Presensi resmi eskul hanya aktif otomatis setiap hari **Rabu pukul 15:40 – 17:30 WIB**.
  - Setelah pukul 17:30 WIB, token otomatis kedaluwarsa / terkunci sendiri.
  - Tampilan presensi siswa otomatis mengunci dengan panduan jelas jika di luar jam eskul.
  - Fitur Bypass Manual di Super Admin untuk uji coba di luar jam eskul atau sesi tambahan.
- [x] Arsitektur Dual-Token (Pemisahan Siswa A21 vs Pengurus A20):
  - Token Siswa A21 (`activeMeeting.token`) tertera di papan tulis.
  - Token Pengurus A20 (`mentorToken`) dapat dikustomisasi mandiri oleh Ketua di Super Admin.
- [x] Form Presensi Mandiri Pengurus A20 + Kotak Curhat & Evaluasi Masalah Lapangan (`MentorAttendance.tsx`):
  - 59 pengurus absen mandiri menggunakan token pengurus.
  - Kotak curhat lapangan untuk menampung unek-unek riil (adik kelas pasif, kendala proyektor, speaker/mic delay, rundown molor, dll) + saran solusi.
  - Seluruh masukan langsung masuk dan terkumpul rapi di tab *Kotak Curhat & Evaluasi A20* di `AgendaVault.tsx`.
- [x] Modul Bantu Absen Adik Kelas A21 (`HelperAttendanceA21.tsx`):
  - Seluruh 59 pengurus Angkatan 20 dapat membantu mengabsenkan adik kelas dari smartphone kakak kelas **tanpa perlu token**, cocok saat adik kelas tidak bawa HP atau kehabisan kuota.
- [x] Modul Live Monitor Angkatan 21 (`LiveMonitorA21.tsx`):
  - Monitor kehadiran adik kelas secara real-time untuk Super Admin Ketua: progress bar dinamis, persentase kehadiran, breakdown per kelas (10-12 kelas), filter Sudah vs Belum Hadir, dan tombol tandai hadir instan.
- [x] Redesain Navigasi Tab Super Admin yang Ergonomis (`MentorDashboard.tsx`):
  - Menggantikan horizontal scroll yang kaku dengan **Category Switcher 3 Tombol** (`[ 🎒 Operasional A21 ]`, `[ 🛡️ Internal A20 ]`, `[ 🔲 Semua ]`).
  - Dilengkapi tombol panah navigasi kiri/kanan (`[ ‹ ]` dan `[ › ]`) untuk scrolling mulus tanpa hambatan.
- [x] Perapihan Berkas Word Resmi di `arsip-data/`:
  - `LAPORAN DAFTAR ANGGOTA ENGLISH CLUB 2026.docx`: 104 siswa aktif A21 (2 siswa keluar dihapus).
  - `Struktur_Sie_Kerja_English_Club_Angkatan_20.docx`: 59 pengurus A20, 7 koordinator sie ditandai tegas, dan catatan *double job* Reisya Saumi Agatha (Pengajar & PDD).
  - Berkas lama/kotor dihapus total.
- [x] Perombakan Hierarki Struktur & Spesialisasi Ketua Divisi (`StructureView.tsx`, Supabase, & docx):
  - Penataan urutan hierarki resmi: **Ketua ➔ Wakil Ketua ➔ Sekretaris ➔ Bendahara ➔ Ketua Divisi ➔ Seluruh Sie Kerja**.
  - Kartu Ketua (Chandra) berdiri sendiri di puncak piramida; kartu Wakil Ketua (Anggi) berada di seksi/baris bawah (tidak berdampingan).
  - Penetapan jabatan spesifik Ketua Divisi: **Hanan Aditya Zahid (Ketua Divisi Speaking)** & **Amirah Nur Fairuza (Ketua Divisi Writing)**.
  - Sinkronisasi live update ke tabel Supabase online, file DDL `setup_database.sql`, `seed.sql`, dan perapihan tabel pada berkas resmi `Struktur_Sie_Kerja_English_Club_Angkatan_20.docx`.

### 3.2. Roadmap Selanjutnya
- [ ] Uji coba lapangan perdana sistem presensi pada hari Rabu eskul (15:40 - 17:30 WIB).
- [ ] Evaluasi kehadiran bulanan pengurus A20 bersama Sie Kedisiplinan (Prisa Aztasyah) via tab Radar Kedisiplinan.
- [ ] Menghubungkan domain custom `.my.id` di dashboard Vercel jika diperlukan.

