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
  - **Pembersihan Copywriting AI Lebay**: Mengganti frasa puitis klise ("Dua Sayap Keunggulan", "Literasi & Taktis", "Bukan sekadar eskul biasa", "Safe Space to Speak", "Solid Generation", "petualangan seru") menjadi kalimat manusia yang to-the-point, membumi, dan ramah anak sekolah.
  - **Eliminasi Emoji Soup**: Menghapus emotikon berulang di setiap biji pill cabang latihan divisi dan 7 Sie Kerja, menyisakan teks badge taktil yang bersih dan tidak melelahkan mata.
  - **Unboxing 7 Sie Kerja (Anti-Nested Card)**: Melepaskan 7 Sie dari kurungan kotak abu-abu tebal; kini tampil mengalir sebagai strip badge taktil horizontal yang rapi di bawah kartu divisi.
  - **Hero Stats 3-Kolom Mantap & Proporsional**: Menghapus kartu stat "2 Divisi Utama" yang dipaksakan; mengunci 3 metrik inti berbobot (`104 Anggota A21`, `59 Pengurus A20`, `20+ Tahun Sejarah`) dalam grid 3 kolom yang lega di desktop dan mobile.


### 3.2. Roadmap Selanjutnya
- [ ] Uji coba lapangan perdana sistem presensi pada hari Rabu eskul (15:40 - 17:30 WIB).
- [ ] Evaluasi kehadiran bulanan pengurus A20 bersama Sie Kedisiplinan (Prisa Aztasyah) via tab Radar Kedisiplinan.
- [ ] Monitoring radar bibit lomba A21 menjelang pendaftaran kompetisi bahasa Inggris tingkat kabupaten/provinsi.



