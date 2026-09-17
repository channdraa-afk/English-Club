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
  - Domain Resmi: `https://englishclub.site` (Hostinger A Record `216.198.79.1`)
  - Google Search Console: Terverifikasi (Token: `VW60R6bNDlrt76VzkEMKiaWd_Yt3gRa_RYxM2wUOfus`)

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
- [x] Harmonisasi Color Palette Resmi Sesuai Logo EC SMEGA (`public/logo.png`):
  - 🔵 **Royal & Cobalt Blue** (`#2563eb`, `#1d4ed8`, `#1e3a8a`): Warna identitas utama sistem, bingkai logo taktil, outline input fokus, dan varian tombol `brand`.
  - 🔴 **Crimson Red Merah-Putih** (`#dc2626`, `#b91c1c`): Varian `crimson` tombol taktil dan aksen status kritis.
  - ⭐ **Golden Star Yellow** (`#f59e0b`, `#fbbf24`): Aksen bintang keemasan dan sorotan rating / KPI.
  - 🟢 **Globe Green** (`#10b981`, `#059669`): Varian `emerald` tombol taktil dan status presensi "✓ Hadir".
- [x] Ekspansi Akses Menu Dashboard untuk Seluruh 59 Pengurus A20 (PIN `123321`):
  - **Presensi Mandiri A20**: Presensi kehadiran kakak kelas + selebrasi konfeti warna logo EC SMEGA.
  - **Monitor Live A21**: Seluruh pengurus kini dapat memantau adik kelas yang sudah maupun belum hadir secara real-time.
  - **Bantu Absen A21**: Membantu adik kelas yang tidak bawa HP / kehabisan kuota tanpa perlu token.
  - **Suara & Masukan Adik Kelas**: Menampilkan rating dan aspirasi ide *"Next Agenda"* dari adik-adik agar seluruh kakak kelas semakin peka dan merasakan aspirasi lapangan.
  - **Struktur Pengurus A20**: Bagan hierarki resmi lengkap dengan gerbang rahasia 3-tap Ketua.
  - Akses Super Admin tetap eksklusif bagi Ketua (Kontrol Sesi, Rekap Rapor Bulanan, ACC Anggota Baru, Radar Kedisiplinan A20, dan Kotak Curhat Internal Pengurus).
- [x] Horizontal Mouse-Wheel Scrolling & Eliminasi Scrollbar Windows (`MentorDashboard.tsx` & `src/index.css`):
  - Mengonversi putaran roda mouse vertikal (`deltaY`) langsung menjadi geseran horizontal (`scrollLeft`) saat kursor berada di atas area menu tab.
  - Mencegah lompatan vertikal pada halaman web utama via listener `wheel` non-passive (`e.preventDefault()`).
  - Menghilangkan scrollbar abu-abu kaku bawaan Windows dengan utility lintas browser `.scrollbar-none`.
  - Mengatasi bug flexbox scroll clipping (`justify-start px-0.5`), sehingga ikon tab paling kiri tidak lagi terpotong.
  - Tombol panah taktil kiri & kanan muncul otomatis (*auto-detect overflow*) saat tab melebihi lebar layar desktop.
- [x] Kalender Matriks 4 Slot Hari Rabu Sebulan Penuh (Opsi B) di `ReportRecap.tsx`:
  - Otomatis memetakan seluruh hari Rabu dalam sebulan (misal September: 4 slot hari Rabu).
  - Slot tanggal yang belum tiba berstatus `-` dan tidak mengurangi persentase kehadiran rapor siswa (`heldNonHolidayMeetings`).
  - Ekspor cetak PDF dan file CSV langsung berformat matriks 4 pekan resmi berstandar rapor SMK Negeri 1 Purbalingga.
- [x] Bank 50+ Idiom Kurasi & Generator Word of the Day (`src/data/idioms.ts` & `MeetingControl.tsx`):
  - 50 idiom populer bertema motivasi, percakapan sehari-hari, dan kesuksesan dengan arti bahasa Indonesia dan contoh kalimat.
  - Tombol **`[ 🎲 Acak dari Bank Idiom ]`** di form atur sesi pertemuan untuk pemilihan idiom kilat.
  - Helper `getWeeklyIdiom` untuk auto-rotate mingguan yang konsisten berdasarkan nomor pekan kalender.
- [x] Optimalisasi Responsivitas Navbar Mobile (`Navbar.tsx`):
  - Tombol mode dibuat adaptif: `[ 🛡️ Mentor ]` / `[ 🛡️ Presensi ]` di mobile (menghemat 70px) dan `[ 🛡️ Dashboard Mentor ]` / `[ 🛡️ Ke Presensi ]` di desktop.
  - Logo dan teks judul fleksibel (`text-base sm:text-lg`, `min-w-0`), sehingga di HP tidak akan pernah terpotong saat dalam mode siswa maupun mentor.
  - Status sesi di desktop dirapikan menjadi `🟢 Sesi Dibuka` / `⚫ Sesi Ditutup` dengan tooltip judul lengkap tanpa efek terpotong ellipsis.
- [x] Domain Resmi Berkelas Dunia `englishclub.site` & Integrasi Google Search Console:
  - Akuisisi domain kustom single-dot `englishclub.site` aktif hingga September 2027.
  - Konfigurasi DNS A Record Vercel (`216.198.79.1`) dengan sertifikat SSL otomatis HTTPS.
  - Verifikasi kepemilikan Google Search Console via DNS TXT Record (`VW60R6bNDlrt76VzkEMKiaWd_Yt3gRa_RYxM2wUOfus`) & tag HTML di `index.html`.
  - Rich OpenGraph & Twitter Card previews dengan logo resmi SMEGA dan `theme-color` Royal Blue (`#2563eb`).
  - Permintaan pengindeksan prioritas bot Google (*Googlebot crawl priority*) tuntas dilakukan via URL Inspection Tool.
- [x] Fitur Status "Izin (Surat Fisik)" A21 Bebas Waktu & Pembukaan Akses Rekap Rapor untuk Seluruh Pengurus A20:
  - **Akses Terbuka untuk 59 Pengurus**: Tab Rekap Rapor Bulanan (Cetak PDF & Ekspor CSV) kini dapat diakses oleh semua kakak kelas via PIN `123321` tanpa memerlukan akun Super Admin.
  - **Manajemen Bebas Waktu (Tanpa Cutoff 17:30 WIB)**: Pengurus dapat menandai adik kelas berstatus "Izin (Surat Fisik)" kapan pun saat surat fisik diterima (sore, malam di rumah, atau hari berikutnya).
  - **Integrasi 3-Modul**:
    - `HelperAttendanceA21`: Tombol taktil cepat `[ 📄 Izin (Surat) ]` berdampingan dengan `[ ⚡ Hadir ]`.
    - `LiveMonitorA21`: Filter 4 sub-tab (Belum, Hadir, Izin, Semua) dengan aksi ubah status bolak-balik antara Hadir dan Izin.
    - `ReportRecap`: Selector status 3-arah interaktif pada rekap per pertemuan.
  - **Standar Rapor SMEGA (H | I | A)**: Matriks 4 pekan, cetak PDF resmi, dan ekspor CSV memuat breakdown kolom Hadir (H), Izin (I), dan Alpa (A) dengan persentase kehadiran sah.
- [x] Resolusi Bug Izin, Dual-Mode Matriks, 1-Click WhatsApp Bot, & Perbaikan Format Cetak/CSV:
  - **Siklus Atomik Delete-Then-Insert**: Mengeliminasi kegagalan silent update Supabase RLS dan tabrakan `unique_meeting_member`. Status Izin, Hadir, dan Alpa kini tersimpan 100% instan dan permanen di Supabase.
  - **Filter Bersih AgendaVault**: Menyaring entri `IZIN_SURAT_FISIK` agar ruang unek-unek dan aspirasi adik kelas tetap bersih dari penanda status sistem.
  - **Dual-Mode Rekap Matriks**:
    1. *Mode Bulanan Resmi (Standar 4 Pekan)*: Menormalisasi tepat 4 slot pekan (Pekan 1–4) per bulan kalender untuk laporan wali kelas/pembina bulanan.
    2. *Mode Kumulatif Semester (Rapor Akhir)*: Menampilkan tabel rangkuman 9 kolom (`No | Nama | Kelas | Total Sesi | H | I | A | % Rapor | Predikat`) yang kebal terhadap risiko kertas terpotong meskipun eskul berjalan hingga 48 minggu.
  - **Cetak PDF A4 Landscape Anti-Kepotong**: Mengunci `@page { size: A4 landscape; margin: 8mm 6mm; }`, menetralkan padding/border/shadow card, dan mengaktifkan `print-color-adjust: exact` sehingga seluruh tabel termuat utuh tanpa huruf/kolom terpotong.
  - **Perbaikan Format CSV untuk Excel Windows Indonesia**: Menggunakan delimiter titik koma (`;`) dan UTF-8 BOM (`\uFEFF`) via Web Blob URL, sehingga saat dibuka di Microsoft Excel laptop Chandra, data otomatis terbagi ke Kolom A, B, C, D, dst tanpa menumpuk di Kolom A.
  - **Fitur 1-Klik Salin Alpa untuk WhatsApp**: Tombol taktil di `LiveMonitorA21` dan `ReportRecap` yang menyalin daftar nama adik kelas yang bolos / alpa beserta kelasnya dalam format pesan WhatsApp rapi siap paste (`Ctrl + V`).
- [x] Optimasi UX Silent Background Refresh, Anti-Layout-Shift, & Penyesuaian Etis Status Keaktifan:
  - **Silent Background Re-fetch**: Mengeliminasi unmount komponen `<MentorDashboard>` dan spinner layar penuh saat melakukan perubahan presensi. Refresh data berjalan senyap di latar belakang, menjaga tab aktif dan posisi scroll tetap stabil.
  - **Persistensi Tab Aktif (`sessionStorage`)**: Menyimpan state `activeTab` di `sessionStorage` sehingga tab yang sedang dibuka (misal: Rekap & Cetak Nilai) tidak akan pernah mental kembali ke tab awal.
  - **Anti-Layout Shift Mode Switcher**: Mengunci baris tab mode switcher dengan `flex-nowrap`, `overflow-x-auto`, dan `shrink-0` serta menyeragamkan tombol aksi kanan (`[ 🖨️ Cetak PDF ]` dan `[ 📥 Ekspor CSV ]`) sehingga tidak ada tombol yang melompat/patah ke baris kedua.
  - **Penyesuaian Etis "Status Keaktifan"**: Mengganti istilah "Predikat Rapor" dan grading A/B/C/D menjadi **"Status Keaktifan"** (*Sangat Aktif, Aktif, Cukup Aktif, Kurang Aktif*) untuk menghormati wewenang nilai rapor Guru Pembina SMEGA.
- [x] Sensasi Taktil Instan 0ms (Optimistic UI Updates di ReportRecap, LiveMonitorA21, & HelperAttendanceA21):
  - **Zero Millisecond Response**: Begitu tombol `+ Hadir`, `Izin (Surat)`, `Jadi Hadir`, atau `Batal` diklik, status badge siswa, tombol aksi, dan counter statistik langsung berganti di milidetik ke-0 secara instan tanpa menunggu siklus round-trip jaringan.
  - **Non-Blocking Feedback**: Mengeliminasi spinner layar/baris yang sebelumnya memblokir interaksi selama 2 detik; tombol kini tetap interaktif dan hanya memunculkan indikator sinkronisasi mikro yang halus.
  - **Fail-Safe Automatic Rollback**: Jika jaringan internet terputus di tengah proses, state UI secara otomatis dikembalikan ke status sebelumnya disertai peringatan dan nada audio error.

- [x] Perpanjangan Token Pengurus (18:00 WIB) & Target Sesi Otomatis Kelipatan Hari Rabu:
  - **Kelonggaran Spesial Pengurus (s.d. 18:00 WIB / Jam 6 Sore)**: Memisahkan jendela waktu presensi di `schedule.ts` berdasarkan parameter `role`. Adik kelas (A21) hangus tepat pukul 17:30 WIB agar tidak ada celah titip absen dari rumah, sedangkan kakak kelas pengurus (A20) diberi kelonggaran 30 menit tambahan hingga pukul 18:00 WIB untuk menuntaskan piket menyapu/merapikan kelas/aula, inventaris proyektor/sound, dan rapat evaluasi harian BPH.
  - **Target Wednesday Resolver (`getTargetWednesdayDate`)**: Logika cerdas berbasis kalender nyata zona waktu Jakarta (WIB). Karena eskul EC SMEGA hanya diadakan pada hari Rabu, jika admin mengakses di hari Kamis (misal: 17 September 2026), target sesi otomatis mengunci ke Rabu terdekat berikutnya (23 September 2026). Jika diakses pada Kamis 24 September, target otomatis maju ke Rabu 30 September 2026.
  - **Tombol Libur Jelas & Konfirmasi Aman (`MeetingControl.tsx`)**: Mengganti label ambigu `[ Set Pertemuan Libur ]` menjadi dinamis `[ 🌴 Liburkan Sesi: Rabu, 23 September 2026 ]` atau `[ 🏖️ Sesi Diliburkan (Klik untuk Buka Kembali) ]` dengan pop-up konfirmasi yang menyebutkan nama sesi dan tanggal hari Rabu tersebut secara eksplisit.
  - **Ketahanan Nilai Rapor**: Sesi yang diliburkan otomatis dikecualikan dari perhitungan total pertemuan wajib di `ReportRecap.tsx` dan `MentorDisciplineRadar.tsx`, sehingga tidak ada siswa maupun pengurus yang dihitung alpa/alpha.

- [x] Menu Kategori "🌐 Umum" & Pemisahan Presisi Curhat A20 vs Aspirasi A21 (`MentorDashboard.tsx` & `AgendaVault.tsx`):
  - **Menu Baru "🌐 Umum"**: Memindahkan fitur general yang sebelumnya terselip di kategori A21—yaitu **Kontrol Sesi & Token** (pengaturan sesi, token A21 & A20, bypass jadwal, sesi libur, PIN) dan **ACC Anggota Baru** (portal registrasi pendaftaran umum)—ke dalam kategori mandiri `🌐 Umum`.
  - **Pemisahan Aspirasi Adik vs Curhat Pengurus**:
    - Di `🎒 Operasional A21 (Adik Kelas)`: Tab khusus **`✨ Suara & Masukan Adik`** (fokus pada rating keseruan eskul & ide *Next Agenda* dari adik kelas).
    - Di `🛡️ Internal A20 (Pengurus)`: Tab khusus **`💬 Curhat & Evaluasi A20`** (fokus pada kotak unek-unek riil, kendala teknis lapangan/sarpras, dan evaluasi sesama pengurus angkatan Chandra).
  - **Auto-Switch Tab Cerdas**: Saat tombol kategori diklik (`🌐 Umum`, `🎒 Operasional A21`, `🛡️ Internal A20`), sistem secara cerdas memilih tab pertama yang relevan jika tab sebelumnya tidak berada di kategori tersebut, menjamin UX super ergonomis tanpa menu kosong.

### 3.2. Roadmap Selanjutnya
- [ ] Uji coba lapangan perdana sistem presensi pada hari Rabu eskul (15:40 - 17:30 WIB).
- [ ] Evaluasi kehadiran bulanan pengurus A20 bersama Sie Kedisiplinan (Prisa Aztasyah) via tab Radar Kedisiplinan.



