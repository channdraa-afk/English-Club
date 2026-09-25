# 📊 LAPORAN EVALUASI PASCA-PELAKSANAAN PERTEMUAN PERDANA
## Sesi #1: First Gathering & Speaking Icebreaker (Rabu, 23 September 2026)
**Disusun Oleh**: Pengurus Inti, Sie Kedisiplinan, & Sie Kurikulum Angkatan 20  
**Tanggal Evaluasi**: Jumat, 25 September 2026  
**Lokasi Kegiatan**: SMK Negeri 1 Purbalingga (SMEGA)  

---

## 📈 1. Ringkasan Metrik Kehadiran (Attendance Summary)

| Kategori Anggota | Total Terdaftar | Hadir (H) | Persentase Kehadiran | Catatan Lapangan |
| :--- | :---: | :---: | :---: | :--- |
| **Angkatan 21 (Adik Kelas X)** | 104 Siswa | **56 Siswa** | **53,8%** | Termasuk 1 siswi susulan (Nabila Rizki Priyanto - X AKL 3) |
| **Angkatan 20 (Pengurus XI)** | 59 Pengurus | **30 Pengurus** | **50,8%** | Tersebar memandu kelompok diskusi & meja presensi |
| **Total Keseluruhan** | **163 Anggota** | **86 Anggota** | **52,7%** | Pertemuan perdana berjalan kondusif & interaktif |

---

## 🎯 2. Evaluasi Jalannya Kegiatan & Kurikulum

### A. Sesi Icebreaker (*Speed Mingling & Two Truths and One Wish*)
- **Keberhasilan**:
  - Adik-adik kelas X dari berbagai jurusan (AKL, PPLG, DKV, MPLB, PM) mulai berani membuka suara dan berkenalan menggunakan kalimat bahasa Inggris sederhana.
  - Suasana cair dan tidak kaku berkat pendampingan langsung kakak kelas A20 di tiap kelompok kecil.
- **Catatan Perbaikan**:
  - Beberapa siswa masih cenderung berkumpul dengan teman sekelasnya sendiri pada 10 menit pertama; untuk pekan ke-2, pembagian kelompok akan diacak lintas jurusan sejak awal sesi.

### B. Pelaksanaan Kuis Interaktif Live (*EC Arena — Kode Ruangan: SMEGA*)
- **Keberhasilan**:
  - Antusiasme adik kelas sangat tinggi saat mengerjakan soal *Agree & Disagree* secara real-time di layar HP masing-masing.
  - Sistem leaderboard langsung memacu semangat kompetitif yang sehat di dalam ruangan.
- **Temuan Teknis & Solusi yang Telah Diterapkan**:
  1. **Disparitas Skor Streak**: Pada sesi perdana, bonus beruntun (*streak*) yang belum dibatasi membuat selisih skor Juara 1 dan Juara 2 terpaut cukup jauh. **Tindak Lanjut**: Rumus matematika skor telah dikalibrasi ulang menggunakan *Anti-Blowout Progressive Capped Streak* (maksimal $+250$ poin per streak).
  2. **Auto-Close Sesi Kuis**: Sesi kuis yang lupa ditutup manual oleh mentor kini dilengkapi *Auto-Retire Zombie Session Guard* (otomatis menutup kuis yang menggantung lebih dari 12 jam) serta tombol Arena di beranda otomatis bersembunyi saat tidak ada kuis aktif.

---

## 🛡️ 3. Evaluasi Operasional & Sistem Presensi

1. **Sinkronisasi Penghitung Presensi A20**:
   - Ditemukan bahwa indikator hadir pada tab *Presensi Mandiri Pengurus A20* sempat menjumlahkan ID lintas angkatan (menampilkan 85 orang).
   - **Resolusi**: Filter himpunan anggota (`a20MemberIds.has(a.member_id)`) telah dikunci ketat sehingga menampilkan angka akurat **30 / 59 Pengurus**.
2. **Penanganan Surat Izin Susulan (Retroactive Permit)**:
   - Bagi adik kelas yang berhalangan hadir dan menyerahkan surat izin fisik menyusul, pengurus dapat langsung mengubah status menjadi **`Izin (Surat)`** melalui tab **Rekap Rapor Bulanan** tanpa perlu mengubah sesi aktif di portal siswa.
3. **Proteksi Sesi Arsip**:
   - Menu **Atur Sesi** kini dilengkapi pemisahan tombol *Simpan Catatan Arsip Saja* dan *Jadikan Sesi Aktif* dengan konfirmasi ganda agar pengurus tidak salah pencet saat membuka data pertemuan lampau.

---

## 🚀 4. Rencana Tindak Lanjut Menuju Pekan #2 (Rabu, 30 September 2026)
- [x] Menyiapkan sesi pertemuan ke-2: **Weekly English Gathering #2** (Rabu, 30 September 2026).
- [x] Menyusun modul pegangan mentor A20 untuk topik *Expressing Opinions, Agreement & Polite Disagreement*.
- [ ] Mengingatkan adik kelas yang belum hadir pada pekan perdana melalui grup informasi masing-masing kelas.

---

*English Club SMEGA — Evaluasi Jujur untuk Kemajuan Bersama! 🌟*
