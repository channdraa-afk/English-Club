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
- **Kredensial Vault (Zero Credential Leak)**:
  - Supabase URL: `https://hqsbmomlubeasmpnwkcb.supabase.co`
  - Supabase Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Public Client Key dengan RLS Policy)
  - Database Password: Tersimpan aman di vault lokal pengembang (Zero Public Leak)
  - Mentor Quick PIN: Terkelola via database `app_settings` (disimpan otomatis di `localStorage` per perangkat)
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

### 2.3. Generator Dokumen Word Resmi (.docx)
- **docxtemplater** (`^3.68.2`) & **pizzip** (`^3.1.9`): Generator berkas Microsoft Word (.docx) murni di sisi browser (client-side binary XML templating) untuk Surat Peminjaman Ruang/Alat dan Laporan Bulanan 103 siswa.

### 2.4. Backend & Cloud Database
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
  - Autentikasi PIN Resmi Pengurus + auto-save login di `localStorage`.
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
- [x] Sembunyikan Akses Ketua: Tombol `[ 👑 Akses Ketua ]` di-hide total dari pandangan publik/kakak kelas. Pintu masuk Super Admin murni via 3-tap kartu Chandra di tab Struktur Pengurus yang dilindungi kriptografi One-Way Hashing SHA-256 (Anti-F12).
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
- [x] Ekspansi Akses Menu Dashboard untuk Seluruh 59 Pengurus A20 (PIN Resmi Pengurus):
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
  - **Akses Terbuka untuk 59 Pengurus**: Tab Rekap Rapor Bulanan (Cetak PDF & Ekspor CSV) kini dapat diakses oleh semua kakak kelas via PIN Pengurus tanpa memerlukan akun Super Admin.
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
- [x] Pemurnian Menu Pengurus, Hak Akses Anti-Otak-Atik, Rekap Kedisiplinan A20 Kedis, & Logo EC di Seluruh Kop PDF:
  - **Pemurnian Monitor Live A21 (`LiveMonitorA21.tsx`)**: Menghapus seluruh tombol mutasi absensi (`+ Hadir`, `📄 Izin`, `Batal`). Tab ini kini 100% murni menjadi *radar cockpit* pengamatan realtime (progress bar, statistik per kelas, daftar alpa, salin WhatsApp) tanpa duplikasi tombol.
  - **Sentralisasi Bantuan Presensi di `Bantu Absen A21` (`HelperAttendanceA21.tsx`)**: Satu-satunya tempat sah bagi mentor di lapangan untuk membantu adik kelas yang tidak bawa HP / kuota habis saat sesi eskul aktif.
  - **Penguncian Akses Modifikasi Presensi (Anti Otak-Atik di `ReportRecap.tsx`)**: Kolom *"Aksi (Bisa Diatur Kapan Saja)"* dan tombol manipulasi status hadir/izin/batal dikunci total dan hanya muncul untuk **Super Admin (Ketua Chandra)**. Mentor biasa, Kedis, dan Sekre hanya berada di mode *Read-Only & Print/Export* demi menjaga integritas data nilai rapor.
- [x] Dual-Mode Rekap Kedisiplinan A20, Teguran WhatsApp Kedis, & Dual Ekspor PDF/CSV (`MentorDisciplineRadar.tsx`):
  - **Mode Switcher (Bulanan vs Kumulatif Semester/Tahunan)**:
    - *Mode Bulanan (Shift 2x)*: Mengevaluasi target kuota 2x kehadiran per bulan aktif, matriks per tanggal sesi hari Rabu, dan persentase kepatuhan bulanan.
    - *Mode Kumulatif / Tahunan*: Mengakumulasi total seluruh sesi eskul yang terlaksana sepanjang semester/tahun ajaran, total hadir, target shift 50%, persentase kehadiran, dan predikat dedikasi (*Super Dedikasi ≥75%*, *Disiplin Sesuai Shift ≥50%*, *Kurang Kuota <50%*, *Kritis 0x Hadir*).
  - **1-Klik Salin Konfirmasi Kehadiran ke WhatsApp Per Sesi Minggu / Per Tanggal untuk Kedis**:
    - Selector Sesi Pertemuan: Memungkinkan Kedis memilih tanggal sesi eskul yang baru saja selesai (misal: Sesi Rabu kemarin) tanpa harus menunggu rekap sebulan penuh.
    - Tombol taktil cerdas `[ 📋 Salin Belum Hadir (WA) ]` dengan feedback Web Audio API & visual konfirmasi 3 detik.
    - Otomatis merangkum daftar pengurus A20 yang tidak hadir pada sesi tersebut beserta jabatan/sie dan kelasnya ke format pesan resmi WA yang santun namun tegas untuk menagih konfirmasi kejelasan.
  - **Dual Ekspor Cetak PDF A4 Landscape Resmi**:
    - Mode Bulanan: Menghasilkan lembar cetak PDF rekap bulanan dengan kop Logo Resmi EC (`/logo.png`), ringkasan KPI, dan matriks tanggal kehadiran.
    - Mode Kumulatif: Menghasilkan lembar cetak PDF rekap kumulatif dengan kop Logo Resmi EC (`/logo.png`), ringkasan KPI tahunan, total sesi, dan status dedikasi.
    - **Haram Ada Tanda Tangan**: Keduanya murni tanpa kolom tanda tangan Kedis maupun Ketua sesuai instruksi sakral Chandra.
  - **Dual Ekspor CSV Excel Windows Indonesia**:
    - `Radar_Kedisiplinan_A20_Bulanan_<Bulan>.csv` dan `Radar_Kedisiplinan_A20_Kumulatif_<Tahun>.csv` dengan delimiter titik koma (`;`) dan UTF-8 BOM (`\uFEFF`) agar tidak berantakan saat dibuka di Microsoft Excel.
- [x] Otomasi Cloud Keep-Alive Supabase Anti-Sleep (`.github/workflows/keep-alive.yml`):
  - **Set & Forget 100% Otomatis**: Menjalankan cron job serverless di awan GitHub Actions setiap 2 hari sekali (`0 0 */2 * *`) pada pukul 07:00 WIB untuk mem-ping REST API Supabase.
  - **Anti-Pause 7 Hari**: Menjaga database tetap terjaga dan aktif tanpa perlu Chandra menambah data dummy/palsu ataupun membuka laptop/web secara manual di hari libur.
  - **Bersih & Ringan**: Cukup melakukan query ringan `SELECT key FROM app_settings LIMIT 1` (hanya butuh 2-3 detik eksekusi cURL) yang langsung me-reset timer istirahat Supabase menjadi 0.

- [x] Fitur Radar Bibit Lomba (Talent Scout Bintang A21) untuk Seleksi Delegasi Lomba SMEGA:
  - **Akses Terbuka Semua Mentor**: Terbuka di tab `⭐ Radar Bibit Lomba` di bawah kategori `🎒 Operasional A21 (Adik Kelas)`.
  - **Aturan Sakral Bintang Anti-Dobel**: 1x pertemuan maksimal 1 bintang per anak. Jika sudah diberi oleh 1 mentor, mentor lain melihat statusnya terkunci berbintang untuk sesi tersebut.
  - **Modal Wajib Cabang Lomba, Catatan Alasan, & Nama Mentor**:
    - Mentor wajib memilih cabang lomba/kategori keunggulan: 🎙️ *Speech*, 📖 *Storytelling*, ⚔️ *Debate*, 📺 *Newscasting*, 🔠 *Scrabble*, 🐝 *Spelling Bee*, 🗣️ *Read Aloud*, atau ✨ *Lain-lainnya*.
    - Mentor wajib mengisi catatan ulasan alasan adik kelas tersebut menonjol untuk dibaca mentor lain.
    - Mentor wajib mengisi nama penilai (contoh: *Kak Chandra*) yang otomatis tersimpan di `localStorage` perangkat.
  - **Penempatan Bintang Anti-Meluber & Gamifikasi Octalysis**:
    - Menggunakan badge taktil 3D ringkas `⭐ N` (misal `⭐ 5`).
    - Sistem Tier Gelar Bakat: 🥉 *Rising Star* (1-2 ⭐), 🥈 *Active Speaker* (3-5 ⭐), 🥇 *Champion Talent* (6+ ⭐).
    - Modal lembar riwayat catatan ulasan per siswa jika badge diklik.
    - Podium Leaderboard 3 Besar (Piala Emas, Perak, Perunggu) untuk peraih bintang terbanyak.
    - Fitur copot / hapus bintang jika terjadi salah semat.
  - **Integrasi Badge Multi-Modul**:
    - Tampilan badge `⭐ N` otomatis muncul di samping nama siswa di `LiveMonitorA21` dan `ReportRecap` (rekap per pertemuan).
  - **Resilience Data Architecture**:
    - Menyimpan ke tabel `talent_stars` dengan skema RLS mandiri, serta fallback otomatis ke `app_settings` (key `'talent_stars'`) sehingga fitur langsung bekerja instan tanpa jeda dependensi.
  - **Eliminasi Dialog Native Browser (`window.confirm` ➔ Modal Taktil 3D)**:
    - Menghapus total dialog konfirmasi kaku bawaan browser (`window.confirm` & `alert`).
    - Menggantinya dengan **Modal Konfirmasi Taktil 3D** serasi tema Duolingo: ikon squircle tempat sampah 3D rose (`[ 🗑️ ]`), teks konfirmasi ramah yang menyebutkan nama siswa secara spesifik, tombol `[ Batal ]` taktil abu-abu, dan tombol eksekusi `[ Ya, Copot 🗑️ ]` merah rose 3D pushable dengan feedback Web Audio API murni.
- [x] Pengamanan Bertingkat (Defense-in-Depth Architecture) & Pembersihan Sistem:
  - **Sanitasi Kredensial Zero Leak**: Menghapus master password PostgreSQL Supabase, PIN mentor, dan password Super Admin dari repositori publik GitHub `DOKUMENTASI.md`.
  - **Kriptografi One-Way Hashing SHA-256 (Web Crypto API)**: Kata sandi ketua diverifikasi menggunakan hash 64-karakter (`bfa576d3...`). Teks sandi asli lenyap 100% dari file bundle JavaScript (`index-*.js`), kebal dari pencarian `Ctrl + F` di DevTools / Inspect Element.
  - **Anti-Console Tampering (Signature Verification)**: Akses Super Admin mewajibkan pencocokan signature hash kriptografis. Manipulasi primitif `sessionStorage.setItem('ec_superadmin_auth', 'true')` di console langsung ditolak dan di-purge otomatis oleh sistem.
  - **Proteksi Master Data Siswa (RLS Hardening)**: Tabel `members` (165 siswa) dikunci menjadi *Read-Only* bagi client publik melalui skrip `supabase/security_hardening.sql`, mencegah vandalisme database lewat REST API.
- [x] Peluncuran Official Flagship Website EC SMEGA (`englishclub.site` Unified Route):
  - **Identitas Sejarah Sejak 23 Maret 2006**: Menampilkan warisan 20 tahun sejarah English Club SMKN 1 Purbalingga dengan yel-yel kebanggaan (*"Spirit of English Club! Improve Your English Skill!"*).
  - **Sistem Cerdas Peka Waktu (Smart Time-Aware)**: Pada hari Rabu pukul 15:40 – 17:30 WIB, web otomatis langsung membuka Form Presensi Siswa tanpa scroll. Di luar jam eskul, web otomatis menyajikan halaman landing page resmi yang megah dan berkelas.
  - **Direct Hash Link Papan Tulis**: URL `englishclub.site/#absen` atau `/#presensi` langsung membuka form presensi kapan pun secara instan.
  - **Showcase 2 Divisi Unggulan**: Memperkenalkan *Speaking Division* (Hanan Aditya Zahid) dan *Writing Division* (Amirah Nur Fairuza) serta 7 Sie Kerja Pengurus A20.
  - **Kalender 4 Agenda Besar Ikonik**: Menampilkan *English Expression (EE)*, *English Adventure (EA)*, *Pemantapan & Pelantikan*, dan *Dies Natalis 23 Maret*.
  - **Galeri & Integrasi Instagram**: Menghubungkan langsung profil resmi Instagram `@englishclubsvhs1pbg` dan highlight dokumentasi lapangan.
  - **Form Pendaftaran Anggota Baru Online**: Formulir pendaftaran terhubung langsung ke tabel `registrations` Supabase dengan konfeti selebrasi.
  - **Navigasi Bolak-Balik Terpadu**: Tombol `[ 🏛️ Web Utama ]` di navbar presensi dan dashboard pengurus untuk kembali ke beranda kapan saja.

- [x] Refinement Redaksi, Koreksi 7 Sie Asli A20, & Dynamic Content Editor Super Admin:
  - **Redaksi Presisi & Alami**:
    - Banner jadwal resmi diperbarui ke format fleksibel: `📅 Agenda Rutin: Setiap Rabu, 15:40 – 17:30 WIB di SMKN 1 Purbalingga.` tanpa ruang kaku.
    - Subtitle Hero diperbaiki menggantikan istilah kaku *"Wadah resmi"* menjadi *"Ekstrakurikuler resmi SMK Negeri 1 Purbalingga..."*.
    - Kartu Championship Spirit diperbaiki menggantikan istilah pewayangan *"kawah candradimuka"* menjadi *"Mempersiapkan dan melatih delegasi lomba..."*.
  - **Koreksi Data Asli 7 Sie Pengurus A20**:
    - Menghapus asumsi filler Sie Kebersihan dan Perlengkapan.
    - Menampilkan 7 Sie resmi sesuai dokumen sah A20: `👩‍🏫 Sie Pengajar & Pendamping`, `⚖️ Sie Kedisiplinan`, `📸 Sie PDD`, `📢 Sie Humas`, `🏢 Sie Sarpras`, `⚙️ Sie Operasional`, dan `📚 Sie Kurikulum`.
  - **Pembersihan Kartu Agenda Besar (No Clunky Initials Logo)**:
    - Menghapus kotak logo inisial mini yang kaku (`🎭 EE`, `🏕️ EA`, dll) sehingga kartu berpenampilan bersih, elegan, dan lega.
    - Mengubah sub-judul agar dinamis tanpa mengunci jumlah agenda (*"Milestone dan program kerja tahunan..."*).
  - **Integrasi Penuh Super Admin di Halaman Web**:
    - Menghubungkan state `isSuperAdmin` dari root aplikasi ke `LandingPage`.
    - Floating Top Admin Bar saat login: `👑 Mode Super Admin Aktif (Chandra) | [ 🏛️ Masuk Pusat Komando ] [ 🔒 Kunci ]`.
    - Tombol jalan pintas login Super Admin langsung di footer web utama (`[ 👑 Portal Super Admin ]`) tanpa perlu memutar lewat halaman presensi.
  - **Dynamic Content Management (Agenda & Galeri Dokumentasi)**:
    - CRUD Agenda Besar langsung di website: tombol `[ ➕ Tambah Agenda Baru ]`, modal taktil edit judul, tag, deskripsi, dan warna aksen, serta tombol hapus.
    - Galeri Dokumentasi Dinamis: tombol `[ ➕ Tambah Foto / Momen ]`, modal taktil edit judul, keterangan/subteks, dan link URL foto nyata (Google Drive, Imgur, Supabase, dll) dengan pratinjau langsung, serta tombol hapus.
    - Tersimpan realtime ke database Supabase `app_settings` (key: `'big_events'` dan `'gallery_items'`).
- [x] Streamline UX Super Admin Navbar, Eliminasi Sticky Bar, & Branding Galeri EC SMEGA:
  - **Single-Source Authentication (Pintu Tunggal Anti-Duplikasi)**: Menghapus total celah login ganda di landing page dan footer. Satu-satunya gerbang login Super Admin adalah 3-tap rahasia pada kartu Ketua di Struktur Pengurus Portal Mentor (`StructureView.tsx`).
  - **Privilege Persistence Lintas Halaman**: Begitu login di portal mentor, saat Ketua kembali ke landing page web utama, status Super Admin tetap aktif otomatis via verifikasi hash kriptografis `sessionStorage`.
  - **Eliminasi Sticky Bar Mengganggu**: Menghapus bilah hitam tebal di atas website yang sebelumnya menutupi hero section.
  - **Badge Taktil Emas di Navbar (`[ 👑 Chandra | Portal | 🔒 ]`)**: Indikator status Super Admin disatukan ke dalam navbar putih yang sudah ada (mengonsumsi 0 piksel tambahan viewport), lengkap dengan tombol pintas ke Portal Komando dan tombol kunci.
  - **Eliminasi Tombol Footer (Penyembunyian Sempurna)**: Tombol akses Super Admin di footer dihapus 100% dari mata publik; footer kembali bersih dan berwibawa.
  - **Personalisasi Form Pendaftaran**: Placeholder nama dan kelas diisi detail resmi pengembang (`Contoh: Chandra Darmawan Jhon` dan `Contoh: XI RPL 2`).
  - **Branding Galeri Default Logo Resmi EC SMEGA**: Kartu galeri dokumentasi default menggunakan Logo Resmi EC SMEGA (`/logo.png`) berlatar putih bersih dengan fallback `object-contain`.
  - **Penyempurnaan Keamanan Navbar & Eliminasi Tombol Perisai (`ShieldCheck`)**: Menghapus total tombol perisai mencurigakan dari navbar publik landing page. Akses ke Portal Mentor kini 100% konsisten menggunakan **Secret 5x Tap pada Logo EC SMEGA** (atau direct URL `#mentor`), menjaga navbar publik tetap bersih dan berwibawa.
- [x] Human-Centric UI Polish, Eliminasi Bom Pill, & Pembersihan Copywriting Lebay:
  - **Eliminasi Bom Pill (Eyebrow Capsule Overdose)**: Menghapus seluruh kapsul pill repetitif di atas heading section (`Mengenal Lebih Dekat`, `Dua Sayap Keunggulan`, `Agenda Besar Tahunan`, `Dokumentasi Resmi`, `Pendaftaran Online`), memberikan ruang bernafas lega bagi tipografi Nunito yang gagah.
  - **Pembersihan Copywriting AI Lebay**: Mengganti frasa puitis klise ("Dua Sayap Keunggulan", "Literasi & Taktis", "Bukan sekadar eskul biasa", "petualangan seru") menjadi kalimat manusia yang to-the-point, membumi, dan ramah anak sekolah.
  - **Restorasi Nuansa Bahasa Inggris 3 Pilar**: Mengembalikan judul pilar ke bahasa Inggris aslinya yang kuat (`Safe Space to Speak`, `Championship Spirit`, `Solid Generation`) untuk mempertahankan identitas dan nuansa khas English Club SMEGA.
  - **Eliminasi Emoji Soup**: Menghapus emotikon berulang di setiap biji pill cabang latihan divisi dan 7 Sie Kerja, menyisakan teks badge taktil yang bersih dan tidak melelahkan mata.
  - **Unboxing 7 Sie Kerja (Anti-Nested Card)**: Melepaskan 7 Sie dari kurungan kotak abu-abu tebal; kini tampil mengalir sebagai strip badge taktil horizontal yang rapi di bawah kartu divisi.
  - **Hero Stats 3-Kolom Mantap & Proporsional**: Menghapus kartu stat "2 Divisi Utama" yang dipaksakan; mengunci 3 metrik inti berbobot (`104 Anggota A21`, `59 Pengurus A20`, `20+ Tahun Sejarah`) dalam grid 3 kolom yang lega di desktop dan mobile.


- [x] Optimasi Layout Responsif Mobile & Eliminasi Overlapping (Zero Screen Collision):
  - **Zero Tabrakan Navbar Presensi (`Navbar.tsx`)**: Menyembunyikan badge teks horizontal `SMEGA` di mobile (karena sudah terwakili di logo resmi) dan menerapkan icon-first taktil pada seluruh cluster aksi kanan (`<Globe />`, `<UserPlus />`, `<Shield />`), menghemat lebih dari 50px ruang sehingga tidak ada lagi tabrakan atau tombol menginjak huruf badge.
  - **Single-Icon Super Admin Mobile (`LandingPage.tsx`)**: Mengubah klaster 3 elemen Super Admin di mobile menjadi satu tombol mahkota emas taktil ringkas `[ 👑 ]` (34px), membebaskan 70px ruang horizontal sehingga tombol `[ ✨ Presensi ]` tampil utuh 100% tanpa kepotong di tepi layar.
  - **Intentional Line-Break Slogan & Utuh Wavy Underline (`LandingPage.tsx`)**: Mengunci frasa `English Club!` sebagai blok utuh tak terpisah dengan wavy underline kuning melengkung mulus dari ujung ke ujung, menata yel-yel dalam 3 baris proporsional, serta merampingkan badge sejarah menjadi 1 baris (`EST. 2006 • SMKN 1 PURBALINGGA`).
  - **Subtitle Opening Bebas Kepotong (`LandingPage.tsx`)**: Merampingkan padding vertikal hero (`pt-6 pb-12`) sehingga kata-kata pengantar eskul langsung tampak nyaman dan terbaca di layar pertama tanpa terpotong di tepi layar (*above the fold*).
  - **Eliminasi Tabrakan Kartu Divisi (`LandingPage.tsx`)**: Menyesuaikan header kartu Speaking dan Writing Division menjadi responsif vertikal di mobile agar pil kategori tidak lagi menabrak teks nama divisi.
  - **Perbaikan Duplikasi Teks Radar**: Menghapus teks redundan `WIB WIB` pada banner radar pertemuan eskul.
  - **Optimasi Pill Status Di Luar Jadwal (`MemberAttendance.tsx`)**: Mengatur line-height dan font size status eskul ditutup agar tidak tertekuk menjadi 3 baris yang terlalu tebal.

- [x] Auto-Open Presensi Cerdas & Penyempurnaan Mode Bypass (Instant Time-Aware Routing):
  - **Auto-Open Tanpa Klik (Detik ke-0)**: Ketika siswa atau pengurus membuka website `https://englishclub.site` saat sesi eskul aktif (Rabu 15:40 – 17:30 WIB) atau saat mode Bypass dinyalakan oleh Ketua, sistem secara otomatis langsung membuka menu presensi (`#absen`) tanpa perlu klik tombol apa pun.
  - **Local Persistence Zero-Delay Cache (`localStorage`)**: Status bypass disinkronkan ke cache lokal (`ec_manual_bypass`). Saat browser memuat halaman pertama kali, rute langsung diputuskan secara sinkron seketika tanpa menunggu jeda network Supabase, mengeliminasi flicker dan jeda loading.
  - **Post-Fetch Smart Routing**: Begitu fetch Supabase selesai, jika status bypass aktif dan pengguna berada di root URL (bukan di `#beranda`), sistem langsung mengarahkan tampilan ke menu presensi.
  - **Anti-Trap Guardrail untuk `#beranda`**: Pengguna yang sengaja menekan tombol "Web Utama" atau membuka link `#beranda` tidak akan dipaksa mental balik ke menu presensi; mereka tetap bebas membaca profil dan galeri eskul dengan tenang.
  - **Supabase Realtime Synchronization**: Menambahkan listener WebSocket Supabase Realtime pada tabel `app_settings`. Begitu tombol Bypass ditekan oleh Ketua di HP atau laptop, seluruh perangkat yang sedang membuka website langsung tersinkronisasi dalam hitungan milidetik.
  - **Live Clock Interval Ticker (15 Detik)**: Timer ringan yang memantau pergantian waktu secara berkala. Jika siswa membuka web pada jam 15:39 WIB di hari Rabu, tepat pada 15:40 WIB sistem otomatis berpindah ke formulir presensi tanpa perlu me-refresh halaman.
  - **Banner Taktil Bypass Ramah di Formulir Presensi (`MemberAttendance.tsx`)**: Menampilkan pita oranye taktil bersahabat di atas form presensi saat mode bypass aktif, memberi kejelasan visual bahwa pintu presensi dibuka manual untuk simulasi/uji coba.
  - **Haptic Audio Feedback Taktil di Tombol Bypass (`MeetingControl.tsx`)**: Mengintegrasikan Web Audio API murni saat tombol bypass dinyalakan (`sound.playSuccess()`) dan dimatikan (`sound.playPop()`).

- [x] Modernisasi Viewport & Aksesibilitas WCAG, Eliminasi Total Dialog Browser Native, dan Optimasi Bundle Chunks:
  - **A11y & Viewport WCAG 1.4.4 (`index.html` & `index.css`)**: Menghapus `maximum-scale=1.0, user-scalable=no` dari meta viewport dan mengaktifkan pinch-to-zoom standar browser untuk siswa berkacamata/disabilitas visual. Menambahkan `touch-action: manipulation; -webkit-text-size-adjust: 100%;` di stylesheet dasar untuk mencegah delay double-tap zoom secara native tanpa merusak aksesibilitas.
  - **Responsive Category Switcher (`MentorDashboard.tsx`)**: Merampingkan label tab kategori portal mentor di layar smartphone 320px–360px (`🎒 A21 (Adik)` & `🛡️ A20 (Pengurus)`) sehingga tidak memicu horizontal scrolling canggung di layar kecil.
  - **Eliminasi 100% Dialog Browser Kuno (`window.alert` & `window.confirm`)**:
    - `MeetingControl.tsx`: Mengganti `alert()` saat gagal simpan dengan banner taktil merah cerah beranimasi (`errorMsg`) + audio `sound.playError()`. Mengganti `window.confirm` saat meliburkan sesi dengan Modal Konfirmasi Taktil 3D Duolingo yang ramah dan aman.
    - `LandingPage.tsx`: Mengganti `confirm()` saat hapus Agenda Besar dan Momen Galeri dengan Modal Konfirmasi Taktil 3D interaktif (`deleteTarget`).
    - `LiveMonitorA21.tsx`: Mengganti `alert()` saat salin daftar alpa ke WhatsApp dengan banner taktil hijau zamrud + `sound.playSuccess()`.
    - `HelperAttendanceA21.tsx`: Mengganti 4 titik `alert()` validasi/error absen manual dengan banner taktil merah mawar + `sound.playError()`.
    - `MentorDisciplineRadar.tsx`: Mengganti 2 titik `alert()` salin WA pengurus alpa dengan banner taktil + audio.
    - `ReportRecap.tsx`: Mengganti 2 titik `alert()` salin WA dan kegagalan status dengan banner taktil.
    - `RegistrationApprovals.tsx`: Mengganti `alert()` kegagalan approval pendaftaran dengan banner taktil.
  - **Lazy Loading & Code-Splitting Portal Mentor (`src/App.tsx`)**:
    - Mengisolasi modul besar `MentorDashboard` (yang memuat tabel rekap matriks bulanan, monitor real-time, radar kedisiplinan, dll) menggunakan `React.lazy()` dan `<React.Suspense>`. Siswa biasa yang membuka presensi atau pengunjung yang membuka landing page kini tidak perlu mengunduh kode pengurus sama sekali.
  - **Rollup Manual Chunks & Zero-Warning Production Build (`vite.config.ts`)**:
    - Mengonfigurasi `build.rollupOptions.output.manualChunks` untuk memisahkan `vendor-react` (4.2 kB), `vendor-confetti` (10.6 kB), `vendor-icons` (37.3 kB), `vendor-supabase` (227 kB), dan `MentorDashboard` (170 kB).
    - Menghilangkan 100% peringatan bundle size warning dari Rollup (> 500 kB), mempercepat waktu muat awal aplikasi (*First Contentful Paint*) secara signifikan di jaringan seluler sekolah.

- [x] Arsitektur Pengaman "Triple-Shield Reset" (Sinergi Opsi A, B, dan C) & Eksekusi Big Reset Pra-Eskul:
  - **Pencadangan Aman Pra-Reset (`arsip-data/`)**: Seluruh 48 data presensi uji coba dan 2 pendaftaran telah berhasil dicadangkan ke berkas JSON lokal sebelum dieksekusi, memastikan nol risiko kehilangan data historis.
  - **Eksekusi Big Reset Database Supabase**: Mengosongkan 48 data presensi uji coba di tabel `attendances` sehingga status presensi kini kembali bersih **0%** (*fresh start* 0 rekaman) siap pakai untuk hari Rabu perdana eskul. Master data 165 siswa (104 adik kelas & 59 pengurus) tetap utuh dan aman terlindungi oleh RLS policy.
  - **Komponen Pusat Reset Super Admin (`DataVault.tsx`)**:
    - Eksklusif hanya terbuka untuk Ketua di Super Admin (`isSuperAdmin`).
    - **GitHub Vault Protocol Safeguard**: Wajib mengetik frasa persis `RESET DATA UJI COBA` sebelum tombol merah destruktif terbuka dari kunci pengaman.
    - **Auto-Download JSON Snapshot**: Secara otomatis mengunduh berkas `backup_ec_data_[timestamp].json` ke perangkat saat tombol reset ditekan, menyediakan safety net pemulihan seketika.
    - **Granular Scope Selection**: Mendukung pilihan pembersihan Scoped Sesi (Opsi B) maupun Pembersihan Total (Opsi A).
  - **Tombol Reset Per-Sesi di Kontrol Pertemuan (`MeetingControl.tsx` - Opsi B)**:
    - Tombol taktil `[ 🗑️ Kosongkan Presensi Sesi ]` pada kartu sesi pertemuan aktif dengan Modal Konfirmasi Taktil 3D.
    - Mengisolasi pembersihan presensi hanya pada sesi tertentu tanpa memengaruhi sesi lain di masa lalu/depan.
  - **DDL Registrations Hardening (`setup_database.sql`)**: Menambahkan policy delete untuk tabel pendaftaran calon anggota baru.

- [x] Hardening Safe Storage Guardrail & Global Tactile Error Boundary (Anti-White Screen Defense):
  - **Modul Utilitas Terpusat (`src/lib/storage.ts`)**: Membungkus seluruh akses `localStorage` dan `sessionStorage` dengan `try ... catch` dan in-memory fallback. Mencegah 100% crash fatal `SecurityError` / `DOMException` saat website dibuka di browser ber-ekstensi iframe sandbox, mode privat ketat (*Strict Incognito*), atau in-app browser aplikasi (WhatsApp/Instagram).
  - **Refactor Akses Penyimpanan**: Mengganti 100% pemanggilan mentah `localStorage` dan `sessionStorage` di `App.tsx`, `MentorDashboard.tsx`, `MentorLogin.tsx`, dan `TalentScoutA21.tsx` menjadi `safeStorage.get()`, `safeStorage.set()`, dan `safeStorage.remove()`.
  - **Jaring Pengaman Global (`src/components/TactileErrorBoundary.tsx`)**: Membungkus root aplikasi di `main.tsx` dengan Error Boundary bertema taktil Duolingo. Jika ada runtime error tak terduga dari script eksternal atau ekstensi nakal, website tidak akan pernah menampilkan layar putih mati, melainkan menampilkan kartu taktil ramah dengan tombol *"Muat Ulang Halaman"*.

- [x] Fortress Security Hardening (Salted SHA-256 & Brute-Force Lockout Shield) & Modul Master Roster Manager:
  - **Salted Cryptographic Hash Super Admin (`SuperAdminModal.tsx`)**: Mengganti hash telanjang dengan kombinasi Salt rahasia (`SUPERADMIN_SALT`) + SHA-256 berstandar industri. Menghilangkan risiko tebak kamus *Rainbow Table* online secara total, serta menjamin nihil kebocoran plaintext di commit/source code.
  - **Perisai Anti-Brute Force (Cooldown Lockout 60s)**: Mencegah tebakan kata sandi bertubi-tubi. Jika terjadi kegagalan input 3 kali berturut-turut, kotak input dan tombol akses dikunci mati selama 60 detik disertai countdown timer, audio peringatan, dan persistensi di memori perangkat.
  - **Pusat Kendali Master Roster Anggota (`MemberRosterManager.tsx`)**:
    - Eksklusif hanya terbuka untuk Ketua (Super Admin) di bawah kategori `🌐 UMUM`.
    - **Form Tambah Anggota Manual**: Memungkinkan penambahan siswa susulan dengan validasi nama, kelas resmi SMKN 1 Purbalingga (X/XI/XII), dan angkatan (A21 / A20).
    - **Protokol Siswa Keluar Bertingkat (Soft Delete)**: Mengubah status siswa menjadi nonaktif (`status: 'inactive'`) yang otomatis melenyapkannya dari form presensi Rabu dan live monitor, namun tetap menjaga keutuhan 100% riwayat hadir masa lalu di buku besar rapor. Wajib mencentang kotak persetujuan pengunduran diri sebelum tombol aktif (*Zero Accidental Click*).
    - **GitHub Vault Safeguard Hapus Permanen (Hard Delete)**: Opsi khusus pembersihan salah ketik dobel dengan kewajiban mengetik frasa persis `HAPUS SISWA`.
  - **Sanitasi Data Uji Coba**: Melakukan pencadangan JSON dan pengosongan 2 data presensi uji coba sehingga tabel `attendances` kembali bersih 0% siap pakai untuk hari Rabu perdana.

- [x] EC Arena: In-House Interactive Live Quiz Engine Multi-Ruangan (Pekan Praktek Eskul):
  - **Arsitektur Self-Paced Multi-Ruangan (Quizizz/Blooket Style)**:
    - Memecahkan kendala logistik eskul yang terbagi di **2–3 ruangan kelas terpisah** tanpa proyektor tersinkronisasi.
    - Pertanyaan dan 4 tombol taktil 3D Duolingo muncul langsung di layar smartphone masing-masing adik kelas. Siswa menjawab sesuai kecepatan masing-masing dengan timer per-soal.
    - Seluruh skor dan klasemen dari ke-3 ruangan teragregasi secara real-time via Supabase Realtime WebSocket ke dalam satu papan peringkat gabungan.
  - **Skema Database Supabase Baru (`supabase/create_quiz_tables.sql`)**:
    - `quizzes`: Bank paket kuis (judul, deskripsi, array soal JSONB berisikan teks soal, 4 opsi warna, kunci jawaban, dan durasi detik per-soal).
    - `quiz_sessions`: Sesi kuis aktif dengan token ruangan kustom (misal: `SMEGA`) dan status (`active` / `closed`).
    - `quiz_submissions`: Rekam jejak hasil pengerjaan siswa (skor, jumlah benar, durasi pengerjaan, timestamp).
    - RLS aktif dengan policy publik aman.
  - **Keamanan Operasional 59 Mentor (Anti-Troll & Anti-Accidental Play)**:
    - Fitur EC Arena terbuka di portal untuk seluruh 59 mentor Angkatan 20 (kategori `🌐 UMUM`), sehingga mentor di kelas mana pun dapat memantau dan meluncurkan sesi.
    - Dilengkapi **Modal Verifikasi 2-Langkah**: Tombol "Mulai Sesi Live" terkunci hingga mentor mengetik token konfirmasi `SMEGA`, mencegah sesi terputar tidak sengaja.
  - **Client Pemain Siswa (`ArenaPlayer.tsx`)**:
    - Alur masuk mudah: Masukkan token ruangan + cari nama (autocomplete anggota A21).
    - Perhitungan skor Kahoot Formula ($1000 \times (1 - \text{elapsed}/(\text{limit} \times 2)) + \text{streakBonus}$).
    - 4 Tombol Taktil 3D Khas Duolingo: 🔺 Merah (A), 🔷 Biru (B), 🟡 Kuning (C), 🟩 Hijau (D) dengan haptik audio Web Audio API (`playTick`, `playCorrect`, `playWrong`).
    - Layar Akhir Selebrasi: Konfeti, skor akhir, jumlah benar, dan klasemen live seluruh ruangan.
  - **Podium Juara & Integrasi Talent Scout (`QuizManager.tsx`)**:
    - Podium 3D peraih Juara 1, 2, dan 3 dengan fanfare audio Web Audio API dan konfeti.
    - Tombol 1-klik "Simpan ke Radar Bakat": Otomatis memasukkan peraih juara kuis ke rekam jejak `talent_stars` (kategori `general_active`) untuk penilaian rapor.
  - **Integrasi Operasional A21 di Portal Mentor (`MentorDashboard.tsx`)**:
    - Tab `🎮 EC Arena (Kuis Live)` dipindahkan langsung ke dalam kategori utama **`🎒 Operasional A21 (Adik Kelas)`**, sehingga seluruh 59 mentor di kelas langsung melihat tombol kuis di jajaran depan tanpa perlu membuka tab "Semua".
  - **Eliminasi Stale Closure Skor & Klasemen (`ArenaPlayer.tsx`)**:
    - Memperbaiki bug asinkron React di mana `setTimeout` menutup (*closure capture*) snapshot nilai lama soal ke-4 saat soal terakhir diserahkan. Nilai terbaru kini dihitung seketika dan diteruskan langsung via parameter serta disinkronkan ke `scoreRef` & `correctCountRef`. Skor di kartu atas dan klasemen Supabase dijamin 100% konsisten sinkron.
  - **Penyelarasan Autocomplete Nama Siswa (`ArenaPlayer.tsx`)**:
    - Menghilangkan preview 10 nama awal berawalan huruf "A" saat input masih kosong.
    - Pencarian nama kini sama persis seperti form absensi: hanya aktif saat siswa mengetik minimal 2 huruf dengan ikon `Search` dan feedback ramah.
  - **Starter Pack Seed**: Paket kuis awal terpasang *"EC Practice Week #1: Slang & Daily Idioms"* (5 soal seru siap uji coba).

- [x] Hardening EC Arena: Kuota Dinamis A21, Tombol Home Beranda Mobile, Save Point Pemulihan Kuis, Reset Retake Mentor, & Visual Feedback Kartu Kuis Aktif:
  - **Kuota Peserta Kuis Dinamis (`QuizManager.tsx` & `MentorDashboard.tsx`)**:
    - Mengeliminasi angka statis `/ 70 Siswa`.
    - Menghubungkan penyebut ke data riil master anggota aktif Angkatan 21 (`totalA21Count = 104 siswa`). Tampilan menjadi `{submissions.length} / {totalA21Count || 104} Siswa` sehingga rasio tetap akurat dan tidak akan jebol meskipun seluruh 104 adik kelas hadir dan mengumpulkan kuis.
  - **Poles Tombol Mobile Beranda Lebih Jelas (`Navbar.tsx`)**:
    - Mengganti ikon bola dunia (`Globe`) menjadi ikon rumah (`Home`) yang universal.
    - Menampilkan label teks eksplisit **`[ 🏠 Beranda ]`** di mobile maupun desktop berdampingan dengan `[ 🎮 Arena ]`. Siswa langsung paham fungsinya untuk kembali ke website utama.
  - **Visual Feedback & Status Kartu Kuis Aktif (`QuizManager.tsx`)**:
    - Memberikan deteksi cerdas `activeSession?.quiz_id === q.id` pada kartu paket kuis di daftar bank kuis.
    - Menambahkan badge berkedip `[ 🟢 SEDANG AKTIF ]` dan aksen border hijau zamrud taktil (`border-emerald-500 bg-emerald-50/40 ring-2`).
    - Tombol `[ ▷ Luncurkan Kuis ]` otomatis berubah menjadi `[ ⚡ Sesi Berlangsung ]` yang saat diklik langsung melakukan *smooth scroll* ke panel kontrol live di atas, mencegah klik ganda yang membingungkan.
  - **Sistem Save Point Pemulihan Kuis Siswa (`ArenaPlayer.tsx`)**:
    - Setiap kali siswa menjawab atau melangkah ke soal berikutnya, progres soal (`currentIdx`), perolehan skor, streak, dan jumlah benar otomatis disimpan ke `safeStorage` lokal.
    - Jika smartphone siswa tiba-tiba mati, kehabisan kuota, atau halaman tidak sengaja ter-refresh, sistem mendeteksi save point yang belum tuntas dan menampilkan Modal Pemulihan Kuis Taktil: *"Save Point Ditemukan! Lanjutkan kuis dari Soal ke-X?"*.
    - Siswa memiliki kendali penuh untuk melanjutkan dari titik terakhir atau mengulang dari soal pertama. Cache otomatis dihapus saat kuis selesai disubmit.
  - **Akses Reset / Retake untuk Mentor & Super Admin (`QuizManager.tsx`)**:
    - Menambahkan tombol aksi taktil `[ 🔄 Reset ]` di setiap baris nama siswa pada tabel leaderboard live.
    - Jika seorang siswa kehabisan waktu akibat kendala sinyal atau HP drop dan mentor memberi izin retake, klik tombol ini akan menghapus riwayat kuis siswa tersebut dari tabel Supabase `quiz_submissions` secara realtime, mengizinkan siswa masuk dan mengerjakan kuis kembali dari awal.

- [x] Autentikasi Siswa Terpadu (Token + Nama sebagai "Login") & Perbaikan Akses Arena (`ArenaPlayer.tsx`):
  - **Perbaikan Bug Masuk Arena (State `quiz` Hydration)**:
    - Mengatasi bug kritis di mana tombol `[ 🎮 MASUK ARENA ]` tidak berpindah layar bagi siswa yang datanya sudah ada (`existingSub`).
    - Akar masalah: `quizData` sebelumnya diambil setelah pengecekan `existingSub`, sehingga `quiz` tetap bernilai `null` dan kondisi `!session || !quiz` terus merender ulang form lobi. Kini `quizData` di-fetch dan di-set lebih awal (`setQuiz(quizData)`), memastikan routing React langsung masuk ke layar hasil & leaderboard.
  - **Model Akses Terautentikasi (Token + Nama sebagai Kunci Masuk)**:
    - Mengeliminasi tab penonton publik tanpa login di beranda lobi arena sesuai arahan Chandra, menjaga ketertiban data dan privasi kelas.
    - Siswa wajib memasukkan Token Ruangan (misal: `SMEGA`) dan memilih nama mereka (A21) sebagai kredensial login.
  - **Dual Action Button Taktil**:
    - **`[ 🎮 MASUK ARENA ]`**: Jika siswa sudah pernah submit, langsung membuka Kartu Skor & Leaderboard. Jika belum, langsung memulai soal kuis pertama (atau memulihkan save point).
    - **`[ 🏆 Lihat Papan Skor Live Saja ]`**: Mengizinkan siswa yang belum mengerjakan kuis untuk login dan mengamati papan peringkat sementara sebagai penonton (*spectator*), lengkap dengan kartu mode penonton dan tombol taktil `[ 🎮 Mulai Kerjakan Kuis Sekarang ]`.
  - **Realtime WebSocket Sinkronisasi & Opsi Ganti Siswa**:
    - Langsung mendengarkan event perubahan tabel `quiz_submissions` secara realtime dengan highlight personal tebal `[ Kamu ]`.
- [x] Mode Uji Coba & Sandbox Online Terisolasi (Maintenance & Safe Simulation Mode):
  - **Arsitektur Sandbox Terisolasi Online Multi-Perangkat (`src/lib/sandbox.ts`)**:
    - Memungkinkan Super Admin (Chandra) melakukan pengujian penuh (presensi siswa A21, kuis EC Arena, penilaian bintang bakat) langsung di domain produksi `englishclub.site` tanpa mencemari atau merusak data riil.
    - Sinkronisasi realtime multi-perangkat via Supabase `app_settings` (key `sandbox_mode`) dan sesi pertemuan simulasi ber-token kustom `COBA` (`🧪 [UJI COBA] Simulasi Eskul`).
    - Laptop sebagai Super Admin/Mentor dan smartphone sebagai siswa A21 dapat saling terhubung dan menguji fitur live secara bersamaan.
  - **Banner Pengumuman Publik & Notifikasi Global (`src/components/SandboxBanner.tsx`)**:
    - Banner taktil mengambang di puncak aplikasi yang memberitahukan seluruh pengunjung bahwa sistem sedang berada dalam Mode Pemeliharaan / Uji Coba.
    - Tampilan khusus Super Admin dilengkapi Live Data Counter (jumlah presensi, kuis, dan bintang simulasi yang sedang tertampung) serta tombol cepat `[ 🧪 Selesaikan & Hapus Data Simulasi ]`.
  - **Auto-Bypass Jadwal Eskul**:
    - Ketika Mode Uji Coba aktif, form presensi dan arena kuis otomatis terbuka (bypass jadwal hari Rabu 15:40 - 17:30 WIB) sehingga Chandra dapat menguji sistem kapan saja (termasuk akhir pekan/malam hari) tanpa perlu menekan bypass manual berulang kali.
  - **Auto-Purge 100% Zero-Residue (`stopSandboxModeAndPurge`)**:
    - Saat Mode Uji Coba dinonaktifkan, sistem secara otomatis menghapus seluruh rekaman data simulasi dari Supabase (kehadiran uji coba, pengumpulan kuis uji coba, sesi kuis uji coba, bintang bakat uji coba, dan pertemuan uji coba) dalam satu siklus bersih tanpa menyisakan sampah data.
  - **Perisai Laporan Resmi (`MentorDashboard.tsx`)**:
    - Seluruh tab laporan resmi (`ReportRecap`, `MentorDisciplineRadar`, `TalentScoutA21`) secara otomatis menyaring (`officialMeetings`) dan mengecualikan sesi uji coba, menjamin kalkulasi nilai rapor dan radar disiplin tetap 100% steril dan akurat.
  - **Pusat Kendali di Brankas Data (`DataVault.tsx`)**:
    - Menghadirkan Sandbox Control Card di dalam menu Brankas Data & Master Reset dengan indikator status aktif/nonaktif, penjelasan alur uji coba, dan tombol taktil `[ 🧪 Masuk Mode Uji Coba ]` / `[ 🛑 Matikan & Bersihkan ]`.

- [x] Persistensi Super Admin (Anti-Logout F5), Global Kick All Mentor, & Pembersihan Total Pendaftaran & Kuis:
  - **Persistensi Super Admin via SHA-256 Signature (`App.tsx`)**:
    - Status Super Admin kini tersimpan aman di `localStorage` (`ec_superadmin_sig`) yang divalidasi dengan `SUPERADMIN_HASH`.
    - Chandra bebas me-refresh halaman (F5), membuka tab baru, atau berpindah menu tanpa terlempar keluar dari Super Admin.
    - Tetap dapat dikunci seketika kapan saja lewat tombol `[ 🔒 Kunci Super Admin ]`.
  - **Global Session Kick All Mentors (`App.tsx` & `MentorLogin.tsx`)**:
    - Memigrasikan sesi otentikasi mentor ke `ec_mentor_session_v2` yang divalidasi langsung ke PIN mentor aktif (`mentorPin`).
    - Seluruh sesi lama di perangkat mana pun (termasuk teman-teman yang pernah login sebelumnya) otomatis **ter-kick seketika**, mengembalikan portal seperti baru.
    - Jika PIN mentor diubah di kemudian hari, seluruh perangkat lain otomatis ter-kick keluar.
  - **Pembersihan Total Pendaftaran & Kuis (Zero Residue di `DataVault.tsx`)**:
    - Menghapus 2 data pendaftar sampah (`Khalil` & `TEST`) dan menambahkan policy public delete RLS pada tabel `registrations`.
    - Memperluas eksekusi *Big Reset Total* agar menghapus `attendances`, `registrations`, dan `quiz_submissions` secara serentak.
- [x] Penguatan Keamanan EC Arena (Safe Submission & Anti-Re-roll Save Point):
  - **Problem**: Jika sinyal smartphone siswa terputus di soal terakhir, `safeStorage.remove` yang dieksekusi lebih awal menyebabkan save point terhapus sebelum data masuk ke database, menghilangkan nilai siswa secara permanen. Selain itu, tombol "Ulangi dari Awal" di modal pemulihan dapat dieksploitasi siswa untuk re-roll soal demi mengejar skor sempurna.
  - **Solution / State**: Penghapusan save point dipindahkan ke dalam blok sukses setelah `supabase.upsert` terkonfirmasi. Jika jaringan gagal, save point tetap utuh di HP dan menampilkan banner error serta tombol taktil `[ 🔄 Kirim Ulang Nilai Sekarang ]`. Tombol re-roll "Ulangi dari Awal" dicabut dari siswa, mewajibkan kelanjutan soal atau meminta reset resmi ke mentor via tombol live reset dashboard.
- [x] Sinkronisasi Master Roster A21 (104 ➔ 103 Siswa Sesuai LB Agustus 2026):
  - **Problem**: Pada draf awal `LAPORAN DAFTAR ANGGOTA ENGLISH CLUB 2026.docx`, terdaftar 104 siswa A21 (termasuk Nabila Rizki Priauto di nomor urut 19 kelas X AKL 3). Namun pada Laporan Bulanan resmi `LB AGUSTUS 2026.docx` yang ditandatangani Pembina (Nanang Cahyana, S.Pd.Ing) dan Waka, Nabila tidak tercantum dan total anggota A21 resmi adalah 103 siswa.
  - **Solution / State**: Baris nomor 19 dihapus dari dokumen Word `LAPORAN DAFTAR ANGGOTA ENGLISH CLUB 2026.docx` dan nomor 20..104 di-renumbering menjadi 19..103 (total tepat 103). Data Nabila dihapus dari `members_parsed.json` dan Supabase `members`. Seluruh teks UI dan fallback di `App.tsx`, `LandingPage.tsx`, `MentorDashboard.tsx`, `QuizManager.tsx`, dan `DataVault.tsx` disinkronkan ke 103 siswa.
- [x] Generator Administrasi & Dokumen Resmi Word (.docx) Otomatis:
  - **Problem**: Sekretaris (Naila) dan Ketua (Chandra) setiap bulan dan setiap acara harus membuat Surat Peminjaman Ruang & Alat ke Sarpras dan Laporan Bulanan (LB) untuk Pembina dan Waka Kesiswaan secara manual di Microsoft Word. Mengetik ulang kop, format tabel, daftar ruangan, peralatan, dan 103 siswa sangat memakan waktu dan rentan salah ketik.
  - **Solution / State**: Dibangun modul `AdminDocGenerator.tsx` di tab Portal Pengurus `[ 📄 Administrasi & Surat (.docx) ]` menggunakan binary XML templating `docxtemplater` dan `pizzip`.
    - **Surat Peminjaman**: Menyediakan form interaktif untuk nomor surat, tanggal, waktu, tempat, ketua, sekretaris, tabel ruangan dinamis dengan preset (Ruang 4, Ruang 5, Ruang Kuliner, Aula Sudirman), dan tabel alat dinamis (Sound system, mic wireless, proyektor, kabel roll) yang langsung di-compile menjadi `.docx` resmi dengan kop SMKN 1 Purbalingga.
    - **Laporan Bulanan (LB)**: Format formulir ISO FO-002 s/d FO-008, rekapitulasi kehadiran dan evaluasi materi otomatis terhitung dari database (atau manual override), dan 103 anggota aktif Angkatan 21 otomatis tercetak presensinya dengan tanda centang (✓) ke Tabel 3 Word.
    - **Dokumentasi Foto**: Disertakan frame placeholder foto dokumentasi siap copy-paste langsung di Word tanpa merusak layout atau tabel.
- [x] Perbaikan Sinkronisasi Sesi Kuis & Indikator Navbar Arena:
  - **Problem**: Setelah sesi kuis ditutup di `QuizManager`, menu `[ 🎮 Arena ]` di navigasi atas masih terus berkedip (`animate-pulse` dan dot hijau `animate-ping`) karena `QuizManager` tidak memiliki callback ke `App.tsx` dan event realtime `postgres_changes` Supabase tidak memancarkan update ke klien anonim.
  - **Solution / State**: Dipasang callback langsung `onQuizSessionChanged` dari `QuizManager` $\rightarrow$ `MentorDashboard` $\rightarrow$ `App.tsx`, broadcast channel realtime `arena_global` untuk sinkronisasi instan lintas perangkat, dan self-healing ticker berkala pada `App.tsx`. Indikator kedip langsung padam seketika (0ms) saat kuis ditutup.
- [x] Paket Kuis Interaktif Sie Kurikulum (Agree & Disagree Mastery - 20 Soal):
  - **Problem**: Menjelang eskul Rabu, 23 September 2026, Sie Kurikulum menyusun silabus evaluasi materi *Expressing Agreement & Disagreement* dalam bentuk 20 butir soal percakapan situasional pada `soal games.docx` yang perlu dimasukkan ke bank soal EC Arena.
  - **Solution / State**: 20 butir soal beserta opsi pilihan ganda dan kunci jawaban terverifikasi diinjeksi ke tabel `quizzes` di Supabase dengan judul `EC Practice Week #2: Agree & Disagree Mastery`. Durasi 20 detik per soal, mendukung live scoring dan visual game display di EC Arena.
- [x] Stabilisasi Presensi Siswa, Sinkronisasi Portal Pengurus Mobile, Keamanan Token & Redesain Estetika EC Arena:
  - **Problem**:
    1. Membuka menu presensi siswa (`#absen`) membuat layar mental kembali ke landing page setelah 15 detik karena interval ticker jam di `App.tsx` mengeksekusi `setView('home')` jika di luar jam eskul resmi.
    2. Badge status di Navbar menampilkan "🟢 Sesi Dibuka" meskipun waktu eskul belum dimulai akibat properti `isMeetingActive` hanya membaca ada tidaknya baris pertemuan aktif di database tanpa mencocokkan jadwal jam riil.
    3. Menu kategori "🌐 Umum" tidak dapat diakses mentor biasa di smartphone, dan saat login mentor pertama kali membuka tab absensi A20, tombol kategori yang menyala keliru di `a21`.
    4. Saat sesi EC Arena dibuka, input token di smartphone adik kelas otomatis terisi sendiri sehingga siswa tidak perlu membaca token dari papan tulis.
    5. Kartu pilihan ganda A, B, C, D di smartphone tampak berantakan: ikon bentuk dan huruf (`🔺 A`) terhimpit di kotak 24px (`w-6 h-6`) sehingga bertumpuk, dan teks jawaban terlempar ke pojok kiri bawah. Perhitungan skor dan efek *streak* api juga tidak memiliki rincian transparan.
  - **Solution / State**:
    1. **Anti Auto-Kick Presensi**: Menghapus seluruh pemanggilan paksa `setView('home')` pada hash `#absen` / `#presensi` di inisialisasi awal, interval ticker 15 detik, dan `fetchData` di `App.tsx`. Siswa kini bebas membuka form presensi kapan saja tanpa pernah terlempar keluar.
    2. **Sinkronisasi Jadwal Riil Navbar**: Menghubungkan badge navbar langsung ke fungsi `isSessionActiveNow(isEffectiveBypass, 'student')`. Navbar kini 100% patuh pada jam resmi (Rabu 15:40–17:30 WIB) atau status saklar bypass pengurus.
    3. **Aksesibilitas & Sinkronisasi Kategori Mentor Mobile**: Menambahkan tombol `[ 👑 Akses Ketua ]` di header portal pengurus agar mentor biasa di ponsel dapat langsung membuka prompt kata sandi Super Admin. Mengaitkan kategori aktif dengan `activeTab` (`getTabCategory(activeTab)`) sehingga saat default ke tab `mentor_attendance`, kategori yang menyala tepat di `a20`.
    4. **Keamanan Token Arena Whiteboard**: Menghapus `setTokenInput(sData.room_code)` dari `checkActiveSession` di `ArenaPlayer.tsx`. Siswa kini wajib mengetikkan 4 digit kode token yang ditulis mentor di papan tulis.
    5. **Redesain Taktil 3D Pilihan Ganda & Efek Streak Api Transparan**:
       - Mengganti kotak sempit `w-6 h-6` dengan pill badge lega `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/20 text-xs font-black`.
       - Menyelaraskan teks jawaban ke posisi tengah vertikal dan horizontal (`my-auto w-full text-center`) dengan tipografi `text-sm sm:text-base font-extrabold line-clamp-3`.
       - Menghadirkan sistem api bertingkat (*Tiered Fire Aura*): Badge dinamis (*Streak x2*, *HOT STREAK x3! 🔥*, *SUPERNOVA x5! 🔥*), aura cincin menyala pada boks pertanyaan (`ring-4 ring-amber-400/30 animate-pulse`), dan rincian skor transparan saat menjawab benar: `✓ BENAR! +XXX Poin! 🔥` dengan breakdown `⚡ Kecepatan: +XXX` dan `🔥 Bonus Streak (Nx): +XXX`.

- [x] Validasi Hapus Universal (Safe Deletion Modals 3D) & Perombakan Mutu 20 Soal Agree & Disagree:
  - **Problem**:
    1. Aksi penghapusan di `QuizManager.tsx` terlalu rentan salah klik: tombol hapus paket kuis mengandalkan dialog native browser `confirm()` yang mudah kepencet di layar smartphone, tombol hapus butir soal di editor langsung melenyapkan soal tanpa konfirmasi apa pun, dan tombol reset skor siswa juga memakai popup kaku.
    2. Paket 20 soal kuis *Agree & Disagree* dari draf awal memiliki kelemahan pedagogis fatal: polanya 100% biner dan berpola murahan (selalu 3 opsi setuju vs 1 opsi sanggah, atau 3 sanggah vs 1 setuju), sehingga siswa dapat menebak kunci jawaban hanya dengan mencari satu-satunya opsi yang berbeda sendiri tanpa perlu membaca dan memahami isi teks bahasa Inggris.
  - **Solution / State**:
    1. **Universal Safe Deletion Protocol (`QuizManager.tsx`)**:
       - Mengganti seluruh dialog native browser dengan **Modal Konfirmasi Taktil 3D (Duolingo Style)**.
       - *Hapus Paket Kuis*: Menampilkan rincian judul kuis dan jumlah butir soal, badge peringatan permanen rose, tombol abu-abu `[ Batal ]`, dan tombol merah pushable 3D `[ Ya, Hapus 🗑️ ]`.
       - *Hapus Butir Soal Editor*: Soal kosong terhapus hening, sedangkan soal yang memiliki teks wajib melalui modal konfirmasi spesifik *"Hapus Soal Nomor X?"* dengan cuplikan teks soal.
       - *Reset Skor Siswa*: Menampilkan modal taktil amber dengan nama siswa, kelas, skor saat ini, dan tombol `[ Ya, Izinkan Mengulang 🔄 ]`.
    2. **Perombakan Total 20 Soal Kuis Kurikulum (Anti Pola 3 vs 1)**:
       - Memperbarui paket kuis `EC Practice Week #2: Agree & Disagree Mastery` di Supabase dengan 20 butir soal baru berstandar CEFR B1–B2.
       - Di setiap soal, 4 opsi dibuat **berimbang (2 bernada persetujuan, 2 bernada sanggahan)** sehingga siswa wajib membaca dan menganalisis konteks percakapan.
       - Menyematkan idiom jebakan umum berkualitas tinggi: *"I couldn't agree more"* (persetujuan kuat berkedok kata negatif), *"You can say that again!"* (persetujuan antusias), *"I beg to differ"* & *"That's not necessarily the case"* (sanggahan santun formal), *"I agree up to a point, but..."* (persetujuan parsial), *"No doubt about it"*, *"Tell me about it!"*, *"I second that"*, dan evaluasi stance/sikap pembicara.
       - Menjaga panjang percakapan tetap 2–3 baris agar nyaman terbaca dalam 5–6 detik di bawah timer 20 detik EC Arena.

- [x] Perbaikan Matriks Presensi Bulanan (Anti-Duplikasi Tanggal, Format LB FO-003, Bebas Rapor) & Manajemen Multi-Sesi:
  - **Problem**:
    1. Pada `ReportRecap.tsx`, tabel rekap bulanan menampilkan header tanggal berantakan: `23/09 (Pekan 1) | 09/09 (Pekan 2) | 16/09 (Pekan 3) | 23/09 (Pekan 4)`. Tanggal 23/09 muncul dua kali akibat fallback `|| existingMeetings[i]` membajak satu-satunya baris pertemuan di database (`2026-09-23`) dan memaksanya tampil di Pekan 1. Selain itu, bulan dengan 5 hari Rabu (seperti September 2026) terpotong kaku ke 4 pekan.
    2. Masih terdapat residu label `% Rapor` pada tabel bulanan dan tab navigasi `Rekap Rapor Semester`, bertentangan dengan arahan Chandra bahwa predikat rapor merupakan hak prerogatif guru/pembina sekolah, bukan mentor ekstrakurikuler.
    3. Pada menu `MeetingControl.tsx`, menekan tombol simpan dengan tanggal berbeda menimpa (*overwrite*) pertemuan lama di database melalui query `.update().eq('id', activeMeeting.id)`, sehingga sistem tidak dapat menyimpan riwayat sesi mingguan atau membuat sesi baru untuk pekan depan. Akibatnya dropdown Talent Scout hanya memuat 1 sesi.
  - **Solution / State**:
    1. **Matriks Kalender Dinamis & Anti-Bajak (`ReportRecap.tsx`)**: Menghapus fallback index `existingMeetings[i]`. Seluruh slot tanggal dihasilkan secara dinamis dan urut kronologis berdasarkan seluruh hari Rabu dalam bulan terpilih (4 atau 5 pekan: `02/09`, `09/09`, `16/09`, `23/09`, `30/09`) dan hanya memetakan pertemuan jika tanggalnya persis sama. Filter sesi efektif (`heldNonHolidayMeetings`) kini mewajibkan `isPastOrToday`, mencegah kalkulasi 0% keliru pada sesi masa depan.
    2. **Penyelarasan Format Baku Laporan Bulanan (LB FO-003) & Terminologi Keaktifan**: Mengganti `% Rapor` menjadi `% Keaktifan`, menyelaraskan ekspor CSV (`Rekap_Bulanan_EC_SMEGA_YYYY-MM.csv`), mengubah tab navigasi menjadi `Rekap Bulanan` dan `Rekap Keaktifan Semester`, serta membersihkan teks judul cetak PDF menjadi `Laporan Keaktifan Semester`.
    3. **Manajemen Multi-Sesi & Tombol Sesi Baru (`MeetingControl.tsx` & `MentorDashboard.tsx`)**: Meneruskan daftar seluruh `meetings` dari dashboard. Menghadirkan Session Selector dropdown di form kontrol pertemuan untuk memilih sesi lama atau beralih ke sesi aktif, serta tombol taktil `[ ➕ Buka Sesi Baru Pekan Depan ]` yang secara otomatis menghitung tanggal hari Rabu berikutnya, mengacak token baru dan idiom, serta mengeksekusi `INSERT` tanpa menimpa sesi lama. Seluruh sesi tersimpan utuh dan dapat dinilai di Talent Scout.

- [x] Sinkronisasi Kategori & Tab Portal Mentor, Anti-Mental Presensi Ditutup, & Keamanan Token Arena:
  - **Problem**:
    1. Desinkronisasi Kategori & Tampilan di Smartphone (`media_1789959844519.jpg`): Tombol kategori `🎒 A21 (Adik)` menyala hijau dan carousel menampilkan menu A21, namun kartu yang dirender di bawahnya adalah `Presensi & Curhat Sesi — Angkatan 20` (`<MentorAttendance />`). Hal ini terjadi karena inisialisasi awal `activeTab` mengarah ke `'mentor_attendance'` sementara `currentCategory` ke `'a21'`, tab kuis arena (`quiz`) sempat tercecer dari fungsi pengecekan kategori, dan tidak ada mekanisme auto-align.
    2. Layar Mental Saat Presensi Ditutup: Ketika saklar bypass dimatikan atau presensi ditutup, listener WebSocket Supabase di `App.tsx` mengeksekusi `setCurrentView('landing')`, membanting paksa siswa di `#absen` kembali ke beranda alih-alih menampilkan pengumuman jadwal resmi.
    3. Kebocoran Token Arena di Banner & Auto-Fill: Banner kuis live di landing page sempat menampilkan `Token: {room_code}` secara terbuka ke publik, input token di arena otomatis terisi kode, serta input token belum dilengkapi atribut pencegah browser autocomplete.
  - **Solution / State**:
    1. **Single Source of Truth Kategori Tab (`MentorDashboard.tsx`)**: Mendefinisikan konfigurasi tab statis `TAB_CONFIG` dan helper `getTabCategory(tabId)`. Menjadikan default `activeTab` bagi mentor biasa ke `'live_monitor'` (A21). Memasang guard sinkronisasi otomatis (`useEffect` dan onClick handler): saat kategori berganti (misal ke `a21`), sistem otomatis mengarahkan `activeTab` ke tab utama kategori tersebut (`live_monitor`), mengeliminasi 100% peluang terjadinya tampilan salah kamar.
    2. **Pencabutan Kode Pengusir Mental (`App.tsx`)**: Menghapus total baris pemaksaan redirect `setCurrentView('landing')` saat event bypass mati diterima. Siswa di `#absen` tetap tenang di halaman presensi dan otomatis melihat kartu jadwal resmi `⏰ Presensi Ditutup`.
    3. **Keamanan Token Whiteboard & Anti-Autocomplete (`ArenaPlayer.tsx` & `MemberAttendance.tsx`)**: Banner kuis hanya menampilkan instruksi netral, pengisian otomatis token dicabut, dan input token diproteksi dengan `autoComplete="off"`, `autoCapitalize="characters"`, dan `spellCheck={false}`. Siswa wajib membaca dan mengetik manual token fisik dari papan tulis.

- [x] Stealth Super Admin Access & Eliminasi Tombol Publik "Akses Ketua" (`MentorDashboard.tsx`):
  - **Problem**:
    Tombol kuning `[ 👑 Akses Ketua ]` yang terletak berdampingan dengan tombol logout di header portal mentor terlalu mencolok (`media_1789960720090.png`). Hal ini mengundang rasa penasaran siswa atau mentor lain yang melihat layar ponsel Chandra dan berpotensi memicu upaya tebak PIN yang tidak diinginkan.
  - **Solution / State**:
    Tombol publik `[ 👑 Akses Ketua ]` dihapus 100% dari antarmuka visual header sehingga hanya menyisakan tombol logout yang bersih bagi mentor biasa. Sebagai penggantinya, dipasang mekanisme **Stealth 3-Tap Trigger** pada area judul header *"Portal Pengurus EC SMEGA"*. Chandra cukup mengetuk judul header 3 kali berturut-turut secara cepat di halaman mana pun untuk memunculkan modal PIN Super Admin. Saat status Super Admin aktif, tombol `[ 🔒 Kunci Admin ]` tetap tersedia untuk mengunci kembali hak akses.

- [x] Sistem Proctoring Anti-Curang EC Arena (2-Strike Tab Switching & Save Point Purge):
  - **Problem**: Saat kuis live berlangsung di EC Arena, siswa dapat berpindah tab browser atau membuka aplikasi Google Terjemahan / browser lain untuk mencari jawaban tanpa terdeteksi oleh sistem.
  - **Solution / State**: Diimplementasikan sistem pengawasan integritas bertingkat (2-Strike Shield) di `ArenaPlayer.tsx` dan `audio.ts`:
    1. *Deteksi Visibilitas Realtime*: Memanfaatkan `document.visibilitychange` untuk mencatat detik siswa meninggalkan layar aktif.
    2. *Strike 1 (Teguran & Freeze)*: Begitu siswa kembali ke tab, sistem membunyikan sirine alarm darurat via Web Audio API murni (`sound.playWarningAlarm()`), membekukan hitung mundur timer soal kuis (`showWarningModalRef`), dan menampilkan Modal Peringatan Taktil 3D fullscreen (*Peringatan Berpindah Tab 1/2*) yang mewajibkan siswa menekan tombol konfirmasi untuk melanjutkan.
    3. *Strike 2 (Diskualifikasi & Hangus)*: Jika siswa melanggar untuk kedua kalinya, sesi kuis seketika dikunci dan dinyatakan gugur (`isDisqualified`). Skor yang didapat saat itu dibekukan dan dikirim ke Supabase, save point lokal langsung dimusnahkan (`safeStorage.remove`) agar tidak bisa direfresh/diakali, dan layar berganti ke Layar Diskualifikasi berdesain taktil 3D merah mawar dengan opsi melihat papan peringkat live atau kembali ke beranda. Mentor tetap memiliki wewenang untuk mereset sesi siswa jika pelanggaran terjadi akibat kendala perangkat darurat.
- [x] Generator Surat Peminjaman Ruang & Alat: Pembina Dinamis (1 vs 2 Pembina Sekaligus):
  - **Problem**: Data tanda tangan Pembina pada Surat Peminjaman Ruang dan Alat (`template_surat_peminjaman.docx`) tertulis permanen (*hardcoded*) sebagai Nanang Cahyana, S.Pd.Ing dengan NIP statis. Padahal English Club memiliki 2 Pembina resmi (Pak Nanang & Bu Rita Puspitasari, S.Pd), dan pihak sekolah terkadang memerlukan surat yang ditandatangani oleh salah satu pembina piket atau kedua pembina sekaligus.
  - **Solution / State**: Diimplementasikan modul konfigurasi pembina dinamis di `AdminDocGenerator.tsx` dan `template_surat_peminjaman.docx`:
    1. *Selector Mode Tanda Tangan*: Pilihan fleksibel antara **1 Pembina Bertugas** (tanda tangan tunggal di tengah bawah) atau **2 Pembina Sekaligus** (tanda tangan berdampingan 2 kolom horizontal via tabel tanpa bingkai).
    2. *Preset 1-Klik*: Tombol taktil `[ 👨‍🏫 Pak Nanang ]` dan `[ 👩‍🏫 Bu Rita ]` untuk pengisian instan nama, NIP/identitas, dan jabatan tanpa perlu mengetik ulang manual.
- [x] Eksekusi Big Reset Zero-Residue & Penguatan Live Ticker Otomatisasi Jam Eskul 15:40 WIB:
  - **Problem**: Menjelang pertemuan perdana eskul sore hari (Rabu, 23 September 2026), masih terdapat residu rekaman kuis uji coba (Doni Saputra), 1 sesi arena dummy (`ASW`), dan 1 galeri `test` di Supabase. Selain itu, form presensi siswa dan pengurus sebelumnya mengandalkan `useMemo` tanpa interval timer internal, sehingga siswa yang sudah standby di halaman `#absen` sejak 15:38 atau 15:39 WIB tidak akan otomatis melihat form terbuka saat jam 15:40:00 WIB tiba tanpa menekan refresh.
  - **Solution / State**:
    1. *Big Reset Database 100%*: Seluruh tabel transaksional (`attendances`, `registrations`, `quiz_submissions`, `quiz_sessions`) dikosongkan bersih ke 0 rekaman. Nilai `gallery_items` dummy dihapus, `talent_stars` bersih `[]`, dan seluruh mode bypass dinonaktifkan. Sesi resmi hari ini (`2026-09-23`, Token: `2112`, *"First Gathering & Speaking Icebreaker"*) dipertahankan aktif dan steril.
    2. *Zero-Bug Live Ticker (Auto-Unlock 0ms)*: Menambahkan interval ticker 10 detik di `MemberAttendance.tsx` dan `MentorAttendance.tsx`. Tepat saat jam menyentuh 15:40:00 WIB, tampilan di smartphone siswa yang sedang standby seketika berganti dari *"Presensi Ditutup"* menjadi **Formulir Presensi Terbuka** secara otomatis tanpa perlu me-refresh halaman (F5).
- [x] Kalibrasi 20 Soal EC Arena ke CEFR A2–B1 & Total Database Reset Steril:
  - **Problem**: 20 soal kuis situasi sebelumnya dinilai terlalu berbelit dan sulit bagi adik kelas X (A21) yang baru pertama kali bergabung ke English Club, dengan kosakata tingkat lanjut dan idiom asing yang sulit diproses dalam limit 20 detik. Selain itu, masih terdapat sesi kuis aktif menggantung (`ASW`), sisa submission uji coba, dan ketidakjelasan antara fitur "Bypass Jadwal" (butuh token resmi pertemuan) vs "Mode Sandbox" (butuh token `COBA`) saat uji coba mandiri.
  - **Solution / State**:
    1. *Kalibrasi 20 Soal Situasional A2–B1*: Seluruh 20 butir soal kuis dirombak total menggunakan konteks keseharian siswa SMK (kantin sekolah, PR sore hari, nonton film bersubtitle, membawa tumbler, cuaca Purbalingga). Kalimat dirancang ringkas, ramah batas waktu 20 detik, tanpa idiom aneh, dengan 4 opsi pilihan jelas dan proporsional. Berkas kurikulum resmi di [`docs/KURIKULUM_AGREE_DISAGREE_20_SOAL.md`](file:///c:/My%20Project/English%20Club/docs/KURIKULUM_AGREE_DISAGREE_20_SOAL.md) dan record `quizzes` di Supabase diperbarui serentak.
    2. *Total Database Reset Pra-Peluncuran*: Menjalankan sanitasi total data uji coba. Seluruh `quiz_submissions` (0), `quiz_sessions` (0), `attendances` (0), `registrations` (0), dan pertemuan dummy dibersihkan. Sesi resmi eskul hari ini (`2026-09-23`, Token: `2112`, *"First Gathering & Speaking Icebreaker"*) dipastikan berstatus aktif dan steril.
    3. *Panduan Uji Coba*: Mendokumentasikan perbedaan token secara tegas: Saklar "Bypass Jadwal" di Pengaturan Pertemuan membuka presensi di luar jam eskul dengan menggunakan token pertemuan resmi (`2112`), sedangkan "Mode Sandbox" di Pusat Data menggunakan token `COBA` dengan pertemuan simulasi.

- [x] Dynamic Meeting Day (Fleksibilitas Pindah Hari) & Rebranding Saklar Override Jadwal:
  - **Problem**:
    1. Logika jadwal lama di `schedule.ts` mengunci kaku hari pertemuan pada `weekday === 'Wed'`. Jika di masa depan English Club berganti hari eskul (misal Kamis/Jumat) atau mengadakan gladi bersih di hari Senin, sistem akan menolak presensi siswa meskipun pengurus sudah membuat pertemuan resmi untuk tanggal tersebut.
    2. Fitur `manual_bypass` sebelumnya berlabel *"Bypass Jadwal (Uji Coba)"*, memicu kerancuan mental seolah-olah fitur ini adalah alat testing seperti Sandbox. Padahal fungsinya adalah saklar darurat lapangan yang menyimpan data presensi secara riil dan permanen ke pertemuan aktif.
  - **Solution / State**:
    1. *Dynamic Meeting Day Recognition (`src/lib/schedule.ts`)*: Logika penentu hari eskul di-upgrade untuk mencocokkan tanggal hari ini (WIB) dengan atribut `meeting.meeting_date` pertemuan aktif (`isMeetingDay = meeting?.meeting_date ? meeting.meeting_date === todayWIBStr : isWednesday`). Jika pengurus menjadwalkan pertemuan di hari selain Rabu, sistem otomatis mengenali hari tersebut sebagai hari sesi eskul resmi tanpa terblokir aturan hari Rabu.
    2. *Rebranding Saklar Override Lapangan (`MeetingControl.tsx`)*: Label tombol diperbarui menjadi `[ ⚡ Buka Manual (Override Jadwal) ]` / `[ ⚡ Override Manual: AKTIF ]` disertai keterangan edukatif bahwa tombol ini digunakan jika jam eskul maju/mundur dari jadwal 15:40 WIB, dan presensi siswa tersimpan resmi ke buku besar rapor.
    3. *Sanitasi Banner Siswa (`MemberAttendance.tsx`)*: Teks banner peringatan saat bypass aktif diubah dari *"Mode Uji Coba / Bypass Manual Aktif..."* menjadi *"⚡ Pintu Presensi Dibuka Manual oleh Pengurus: Sesi pertemuan resmi dapat diisi saat ini."*, melenyapkan kata "simulasi/uji coba" agar siswa yakin presensinya sah.
    4. *Penegasan Role Separation*: Menetapkan Mode Sandbox di `DataVault.tsx` sebagai satu-satunya wahana simulasi terisolasi (Token: `COBA`) dengan jaminan penghapusan bersih data uji coba (*auto-purge*).

- [x] Gamifikasi "Ready to Fight" — Visibilitas Kondisional EC Arena Siswa & Navbar:
  - **Problem**: Saat tidak ada sesi kuis yang aktif, halaman presensi siswa (`App.tsx`) tetap menampilkan kartu putih statis `[ Buka Arena ➔ ]` dan tombol Navbar `[ 🎮 Arena ]` selalu muncul (`media_1790148189470.png`). Hal ini mendistraksi siswa yang baru hadir pukul 15:40 WIB, berpotensi memicu klik penasaran ke lobi kuis yang belum dibuka mentor, serta menghilangkan sensasi kejutan gamifikasi.
  - **Solution / State**:
    1. *Visibilitas Banner Presensi (`App.tsx`)*: Menghapus blok fallback statis. Kartu Hero Battle Arena (gradien biru-indigo elektrik dengan tombol emas 3D) kini **MURNI 100% hanya dirender saat `activeQuizSession !== null`**. Saat kuis ditutup, area presensi siswa bersih tanpa sisa.
    2. *Visibilitas Dinamis Navbar (`Navbar.tsx`)*: Tombol `[ 🎮 Arena ]` di navigasi atas disembunyikan saat kuis mati, dan otomatis meledak muncul (`hasActiveQuiz || currentView === 'arena'`) dengan animasi denyut (*animate-pulse*) dan titik hijau berkedip (*animate-ping*) seketika saat mentor menekan "Mulai Sesi Live" di portal kelas.

- [x] Perbaikan Bug Buat Sesi Baru (Holiday Schema Fallback) & Kalibrasi Ulang Matematika Skor EC Arena:
  - **Problem**:
    1. Galat Pembuatan Sesi Baru (`media_1790210180444.png`): Saat pengurus membuat sesi baru untuk pekan berikutnya, muncul error banner merah `Could not find the 'holiday_reason' column of 'meetings' in the schema cache`. Pengecekan retry lama hanya mencocokkan string `'is_holiday'`, sehingga pesan error PostgREST yang menyebutkan `'holiday_reason'` terlewat dan menggagalkan penyimpanan sesi.
    2. Skor Kuis Ekstrem Jomplang: Pada kuis perdana (23 September), skor Juara 1 (36.202) terlampau jauh dari Juara 2 (24.142) dengan defisit 12.060 poin. Akar masalah: rumus streak bonus kuadratik tanpa batas ($streak \times 100$) menghasilkan bonus kumulatif $\sum 100k = 19.000$ poin untuk 20 soal benar beruntun, sehingga kesalahan 1-2 soal saja meruntuhkan skor peserta secara drastis (*single-mistake cliff*).
  - **Solution / State**:
    1. *Catch-All Schema Error Fallback (`MeetingControl.tsx`)*: Menambahkan helper `isSchemaError` yang mendeteksi segala variasi pesan error kolom (`holiday`, `column`, `schema cache`). Jika terdeteksi kolom hilang, sistem secara otomatis melakukan retry instan dengan `basePayload` murni yang terbukti valid di tabel `meetings`. Status libur dicadangkan ke `app_settings.holiday_config` sebagai jaring pengaman, sehingga pembuatan sesi baru pekan depan sukses 100% tanpa error.
    2. *Anti-Blowout Progressive Capped Streak Engine (`ArenaPlayer.tsx`)*: Mengadopsi standar kompetitif Kahoot:
       - Poin Dasar Kecepatan: $1000 \times (0.5 + 0.5 \times (1 - \text{elapsed}/\text{limit}))$, menjamin jawaban benar selalu bernilai minimal 500 poin.
       - Bonus Streak Bertingkat Terbatas (*Capped*): $+50$ per streak dan **dikunci maksimal di $+250$ poin** ($\text{Math.min}(250, \text{streak} \times 50)$).
       - Hasil: Total bonus streak 20 soal teredam menjadi maksimal $\approx 4.250$ poin (bukan 19.000). Selisih poin antar-juara kini proporsional dan kompetitif (500 – 2.500 poin), melenyapkan blowout skor jomplang secara permanen.

- [x] Audit Forensik Source Code & Perbaikan Bug Presensi Pengurus A20:
  - **Problem**:
    1. Bug Badge Pengurus 85 Orang (media_1790212876190.png): Pada tab Presensi Mandiri A20, badge header tertulis "85 Orang" dan banner atas tertulis "Pengurus Hadir: 85 / 59", padahal jumlah pengurus hanya 59. Akar masalah: attendedMentorSet di MentorAttendance.tsx mengambil seluruh ID presensi sesi aktif tanpa memfilter angkatan, sehingga 55 presensi adik kelas A21 ikut terhitung.
    2. Tombol Arena Selalu Muncul di Landing Page: Tombol "KUIS EC ARENA" di header dan hero section LandingPage.tsx selalu dirender permanen meski kuis sedang tidak dinyalakan.
    3. Jembatan Status Libur Terputus: Cadangan holiday_config di app_settings tidak pernah disuntikkan ke meetings di App.tsx, sehingga jika mentor meliburkan eskul, portal siswa tidak mengenali status libur.
    4. Sesi Kuis Zombie Menggantung: Sesi kuis tanggal 23 September berstatus active tanpa batas waktu karena mentor lupa menekan tombol "Tutup Sesi".
    5. Query Phantom Table talent_stars: Query langsung ke tabel phantom memicu error HTTP 404 PGRST205 di console.
  - **Solution / State**:
    1. Strict Generation Filter (MentorAttendance.tsx & HelperAttendanceA21.tsx): attendedMentorSet disaring menggunakan a20MemberIds.has(a.member_id). Hasil: Badge dan banner kini menampilkan angka riil pengurus yang hadir (30 / 59 Orang).
    2. Kunci Visibilitas Arena Landing Page (LandingPage.tsx): Membungkus tombol di header dan hero section dengan hasActiveQuiz && onOpenArena agar 100% menghilang saat kuis mati, konsisten dengan konsep "Ready to Fight".
    3. Jembatan Libur holiday_config (App.tsx): Menyuntikkan konfigurasi libur dari app_settings langsung ke data meetings dan listener realtime, sehingga portal siswa dan countdown eskul otomatis mengenali status libur.
    4. Auto-Retire Zombie Quiz Session (App.tsx): Menambahkan helper sanitizeActiveQuizSession yang secara otomatis menutup sesi kuis yang berusia lebih dari 12 jam di background Supabase. Sesi kuis 23 September langsung ditutup secara resmi.
    5. Eliminasi Query Phantom (App.tsx & sandbox.ts): Menghapus seluruh query langsung ke tabel phantom talent_stars dan mengalihkannya 100% ke app_settings.talent_stars dengan nol HTTP 404 error.

### 3.2. Roadmap Selanjutnya
- [ ] Peluncuran perdana sistem presensi pada hari Rabu eskul (15:40 - 17:30 WIB).
- [ ] Pelaksanaan kuis live interaktif EC Arena bersama adik-adik kelas A21 di ruang kelas.
- [ ] Evaluasi kehadiran bulanan pengurus A20 bersama Sie Kedisiplinan via tab Radar Kedisiplinan.
- [ ] Monitoring radar bibit lomba A21 menjelang pendaftaran kompetisi bahasa Inggris tingkat kabupaten/provinsi.


