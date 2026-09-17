# 🇬🇧 English Club SMEGA — Attendance & Community Portal

> Portal presensi modern mobile-first berbasis taktil dan sistem manajemen ekstrakurikuler resmi **English Club SMK Negeri 1 Purbalingga (SMEGA)**.

[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff?style=flat&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 📖 Gambaran Proyek

**English Club SMEGA Portal** dibangun untuk mendigitalisasi dan mempermudah operasional ekstrakurikuler mingguan di SMK Negeri 1 Purbalingga. Aplikasi ini menyelesaikan masalah klasik pencatatan presensi manual dengan mengintegrasikan sistem token fisik di papan tulis, validasi anti-kecurangan, rekap nilai rapor otomatis per kelas, serta kanal aspirasi kegiatan mingguan.

---

## ✨ Fitur Utama

1. **Sistem Presensi Anti-Titip Absen (Whiteboard Token Lock)**:
   - Presensi hanya dapat diisi oleh siswa yang hadir di ruang kelas dengan memasukkan kode token yang ditulis oleh pengurus di papan tulis.
   - Sesi presensi memiliki jendela waktu aktif yang dapat dikontrol oleh mentor.
   - Proteksi duplikasi: Setiap siswa hanya dapat melakukan presensi satu kali per pertemuan.

2. **Smart Autocomplete Selector**:
   - Siswa cukup mengetikkan 2–3 huruf awal namanya untuk memilih profil dari master data Angkatan 21 tanpa risiko kesalahan ejaan (typo).

3. **Kanal Aspirasi & Feedback Sesi ("Next Agenda")**:
   - Rating kepuasan kegiatan hari ini melalui 3 emotikon interaktif.
   - Kotak saran ide kegiatan pertemuan selanjutnya (*"Next agenda mau ngapain?"*) untuk kurasi materi mingguan.
   - Opsi pengiriman feedback secara anonim demi menjaga kenyamanan siswa.

4. **Word of the Day & Celebration Card**:
   - Kartu apresiasi kehadiran interaktif dengan efek konfeti dan audio taktil murni via Web Audio API.
   - Menyajikan idiom atau kutipan bahasa Inggris hari itu (*Word of the Day*) beserta artinya yang siap dibagikan ke status media sosial.

5. **Portal Terpadu Pengurus (Mentor Dashboard)**:
   - **Kontrol Sesi Pertemuan**: Pembuatan sesi, generator token acak, pengisian Word of the Day, dan penutupan sesi.
   - **Rekap Rapor 1-Klik**: Filter kehadiran berdasarkan kelas wali kelas, kalkulasi persentase kehadiran, dan tombol ekspor langsung ke Excel/CSV atau salin tabel ke papan klip.
   - **Presensi Pengurus**: Pencatatan kehadiran mandiri untuk 59 pengurus Angkatan 20.
   - **Approval Anggota Baru**: Tinjau pendaftaran calon anggota baru (Nama, Kelas, WhatsApp, Alasan) dengan tombol setujui/tolak satu klik.
   - **Bagan Struktur Organisasi**: Visualisasi pembagian 7 sie kerja, koordinator, dan BPH inti.

---

## 🛠️ Arsitektur Teknologi

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React, Google Font Nunito
- **Audio Engine**: Web Audio API Synthesizer murni (tanpa aset file eksternal)
- **Animasi & Interaksi**: Canvas Confetti
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Realtime REST)
- **Deployment**: Vercel

---

## 🚀 Panduan Instalasi Lokal

### 1. Klon Repositori
```bash
git clone https://github.com/channdraa-afk/English-Club.git
cd English-Club
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi variabel dengan kredensial proyek Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Setup Database Supabase
Jalankan seluruh perintah SQL yang ada pada berkas [`supabase/setup_database.sql`](supabase/setup_database.sql) di dalam menu **SQL Editor** pada dashboard Supabase Anda untuk menginisialisasi tabel, indeks, keamanan RLS, serta data master anggota.

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

---

## 👨‍💻 Pengembang

Dikembangkan oleh **Chandra** ([@channdraa-afk](https://github.com/channdraa-afk)) — Pelajar Rekayasa Perangkat Lunak (RPL).
