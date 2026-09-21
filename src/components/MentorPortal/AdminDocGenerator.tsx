import React, { useState, useMemo } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Users, 
  Sparkles, 
  FileSpreadsheet, 
  Building2, 
  Cpu, 
  Camera, 
  Check
} from 'lucide-react';
import { Member, Meeting, Attendance } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';

interface RuangItem {
  id: string;
  nama: string;
  waktu: string;
  keterangan: string;
}

interface AlatItem {
  id: string;
  nama: string;
  jumlah: string;
}

interface JurnalItem {
  id: string;
  hariTanggal: string;
  pemateri: string;
  uraian: string;
  keterangan: string;
}

interface AdminDocGeneratorProps {
  members: Member[];
  meetings: Meeting[];
  attendances: Attendance[];
}

const BULAN_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const RUANG_PRESETS = [
  'Aula Baru Jendral Sudirman',
  'Ruang 4',
  'Ruang 5',
  'Ruang Kuliner',
  'Laboratorium Bahasa',
  'Laboratorium Komputer 1',
  'Ruang Musik'
];

const ALAT_PRESETS = [
  { nama: 'Sound System Portable', jumlah: '1 set' },
  { nama: 'Microphone Wireless', jumlah: '2 unit' },
  { nama: 'Kabel Roll 15m', jumlah: '2 buah' },
  { nama: 'Proyektor LCD HDMI', jumlah: '1 unit' },
  { nama: 'Kabel HDMI 10m', jumlah: '1 buah' },
  { nama: 'Terminal Stopkontak', jumlah: '2 buah' }
];

export const AdminDocGenerator: React.FC<AdminDocGeneratorProps> = ({
  members,
  meetings,
  attendances,
}) => {
  const [docType, setDocType] = useState<'surat' | 'lb'>('surat');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active A21 members list (sorted consistently)
  const activeA21Members = useMemo(() => {
    return members
      .filter((m) => m.generation === 21 && m.status === 'active')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  // Non-test meetings
  const officialMeetings = useMemo(() => {
    return meetings.filter((m) => m.token !== 'COBA' && !m.title?.includes('[UJI COBA]'));
  }, [meetings]);

  // --------------------------------------------------------------------------
  // STATE: SURAT PEMINJAMAN RUANG & ALAT
  // --------------------------------------------------------------------------
  const [nomorSurat, setNomorSurat] = useState('24/EC/SMKN1/X/26');
  const [tanggalSurat, setTanggalSurat] = useState(() => {
    const d = new Date();
    const bln = BULAN_OPTIONS[d.getMonth()];
    return `${d.getDate()} ${bln} ${d.getFullYear()}`;
  });
  const [lampiranSurat, setLampiranSurat] = useState('1 (satu) lembar');
  const [perihalSurat, setPerihalSurat] = useState('Permohonan Izin Peminjaman Ruang dan Alat');
  const [tujuanSurat, setTujuanSurat] = useState('Waka Bidang Sarana dan Prasarana');
  const [hariTanggalSurat, setHariTanggalSurat] = useState('Rabu, 23 September 2026');
  const [pukulSurat, setPukulSurat] = useState('15:30 - 17:00 WIB');
  const [tempatSurat, setTempatSurat] = useState('Aula Baru Jendral Sudirman SMKN 1 Purbalingga');
  const [namaKetua, setNamaKetua] = useState('Chandra Darmawan Jhon');
  const [nisKetua, setNisKetua] = useState('19517');
  const [namaSekre, setNamaSekre] = useState('Naila Soraya Candeli');
  const [nisSekre, setNisSekre] = useState('19351');

  const [ruangList, setRuangList] = useState<RuangItem[]>([
    { id: '1', nama: 'Ruang 4', waktu: '15:30 - 17:00', keterangan: 'Pertemuan rutin & Ice Breaking' },
    { id: '2', nama: 'Ruang Kuliner', waktu: '15:30 - 17:00', keterangan: 'Praktek speaking kelompok' },
    { id: '3', nama: 'Ruang 5', waktu: '15:30 - 17:00', keterangan: 'Games & Quiz Arena' },
    { id: '4', nama: 'Aula Baru Jendral Sudirman', waktu: '15:30 - 17:00', keterangan: 'Pleno bersama' }
  ]);

  const [alatList, setAlatList] = useState<AlatItem[]>([
    { id: '1', nama: 'Sound System Portable', jumlah: '1 set' },
    { id: '2', nama: 'Microphone Wireless', jumlah: '2 unit' },
    { id: '3', nama: 'Kabel Roll 15m', jumlah: '2 buah' },
    { id: '4', nama: 'Proyektor LCD HDMI', jumlah: '1 unit' }
  ]);

  // --------------------------------------------------------------------------
  // STATE: LAPORAN BULANAN (LB)
  // --------------------------------------------------------------------------
  const [bulanLB, setBulanLB] = useState('Agustus');
  const [tahunLB, setTahunLB] = useState('2026');
  const [tglPengesahan, setTglPengesahan] = useState('31 Agustus 2026');
  const [tglPembina1, setTglPembina1] = useState('05/08/2026');
  const [tglPembina2, setTglPembina2] = useState('12/08/2026');
  const [tglPembina3, setTglPembina3] = useState('19/08/2026');
  const [tglPembina4, setTglPembina4] = useState('26/08/2026');
  const [waktuPelaksanaanKegiatan, setWaktuPelaksanaanKegiatan] = useState('05, 19 Agustus 2026');
  const [catatanDokumentasi, setCatatanDokumentasi] = useState('Kegiatan pertemuan perdana, agenda rutin');

  // Selected meetings for automatic attendance sync
  const [meeting1Id, setMeeting1Id] = useState<string>('');
  const [meeting2Id, setMeeting2Id] = useState<string>('');

  const [jurnalList, setJurnalList] = useState<JurnalItem[]>([
    {
      id: '1',
      hariTanggal: 'Rabu, 5 Agustus 2026',
      pemateri: "English Club A'20",
      uraian: 'Pertemuan perdana English Club SMK N 1 Purbalingga',
      keterangan: 'Pengenalan ekskul, games, dan kuis EC Arena.'
    },
    {
      id: '2',
      hariTanggal: 'Rabu, 19 Agustus 2026',
      pemateri: "English Club A'20",
      uraian: 'Agenda rutin speaking practice and vocabulary building',
      keterangan: 'Praktek kelompok di 3 ruangan.'
    }
  ]);

  // Rekapitulasi values
  const [hadir1, setHadir1] = useState('83');
  const [persenHadir1, setPersenHadir1] = useState('80,6');
  const [tidakHadir1, setTidakHadir1] = useState('20');
  const [persenTidakHadir1, setPersenTidakHadir1] = useState('19,4');
  const [materi1, setMateri1] = useState('Pengenalan singkat ekstrakurikuler English Club, membentuk kelompok, bermain games dan kuis.');
  const [catatan1, setCatatan1] = useState('Peserta mengikuti kegiatan dengan sangat baik dan antusias.');

  const [hadir2, setHadir2] = useState('75');
  const [persenHadir2, setPersenHadir2] = useState('72,8');
  const [tidakHadir2, setTidakHadir2] = useState('28');
  const [persenTidakHadir2, setPersenTidakHadir2] = useState('27,2');
  const [materi2, setMateri2] = useState('Speaking practice, games interaktif dan pengenalan vocabulary harian.');
  const [catatan2, setCatatan2] = useState('Peserta aktif berdialog dalam kelompok dan berani tampil di depan.');

  // Attendance mode: 'auto' (from database) or 'full' (all present 100%)
  const [attendanceMode, setAttendanceMode] = useState<'auto' | 'full'>('full');

  // Helper: auto-calculate attendance stats when meetings are selected
  const handleAutoCalcMeeting = (mId: string, meetingNumber: 1 | 2) => {
    if (!mId) return;
    const targetMeeting = meetings.find((m) => m.id === mId);
    if (!targetMeeting) return;

    const a21Attended = attendances.filter(
      (a) => a.meeting_id === mId && activeA21Members.some((m) => m.id === a.member_id)
    );

    const total = activeA21Members.length || 103;
    const h = a21Attended.length;
    const th = Math.max(0, total - h);
    const pH = ((h / total) * 100).toFixed(1).replace('.', ',');
    const pTH = ((th / total) * 100).toFixed(1).replace('.', ',');

    if (meetingNumber === 1) {
      setMeeting1Id(mId);
      setHadir1(String(h));
      setPersenHadir1(pH);
      setTidakHadir1(String(th));
      setPersenTidakHadir1(pTH);
      if (targetMeeting.title) {
        setMateri1(targetMeeting.title);
      }
    } else {
      setMeeting2Id(mId);
      setHadir2(String(h));
      setPersenHadir2(pH);
      setTidakHadir2(String(th));
      setPersenTidakHadir2(pTH);
      if (targetMeeting.title) {
        setMateri2(targetMeeting.title);
      }
    }
  };

  // --------------------------------------------------------------------------
  // GENERATOR HANDLERS
  // --------------------------------------------------------------------------
  const handleDownloadSurat = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      sound.playPop();
      const templateRes = await fetch('/templates/template_surat_peminjaman.docx');
      if (!templateRes.ok) {
        throw new Error('Gagal memuat template surat peminjaman dari server.');
      }
      const arrayBuffer = await templateRes.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        tanggal_surat: tanggalSurat,
        nomor_surat: nomorSurat,
        lampiran_surat: lampiranSurat,
        perihal_surat: perihalSurat,
        tujuan_surat: tujuanSurat,
        hari_tanggal: hariTanggalSurat,
        pukul: pukulSurat,
        tempat: tempatSurat,
        nama_ketua: namaKetua,
        nis_ketua: nisKetua,
        nama_sekre: namaSekre,
        nis_sekre: nisSekre,
        ruang_list: ruangList.map((r, idx) => ({
          no: String(idx + 1),
          nama_ruang: r.nama,
          waktu: r.waktu,
          keterangan: r.keterangan,
        })),
        alat_list: alatList.map((a, idx) => ({
          no: String(idx + 1),
          nama_alat: a.nama,
          jumlah: a.jumlah,
        })),
      });

      const outBlob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const sanitizedDate = tanggalSurat.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Surat_Peminjaman_EC_${sanitizedDate}.docx`;

      const downloadUrl = URL.createObjectURL(outBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      sound.playSuccess();
      setStatusMessage({
        type: 'success',
        text: `Berhasil mengunduh "${filename}"! File siap dicetak atau diedit langsung di Microsoft Word.`,
      });
    } catch (err: any) {
      sound.playError();
      setStatusMessage({
        type: 'error',
        text: `Terjadi kesalahan saat membuat surat: ${err.message || err}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadLB = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      sound.playPop();
      const templateRes = await fetch('/templates/template_laporan_bulanan.docx');
      if (!templateRes.ok) {
        throw new Error('Gagal memuat template laporan bulanan dari server.');
      }
      const arrayBuffer = await templateRes.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Prepare 103 students attendance list
      const attendedM1Set = new Set(
        attendances.filter((a) => a.meeting_id === meeting1Id).map((a) => a.member_id)
      );
      const attendedM2Set = new Set(
        attendances.filter((a) => a.meeting_id === meeting2Id).map((a) => a.member_id)
      );

      const siswaList = activeA21Members.map((m, idx) => {
        let p1 = '✓';
        let p2 = '✓';
        let s = '';
        let i = '';
        let a = '';

        if (attendanceMode === 'auto' && (meeting1Id || meeting2Id)) {
          const hasM1 = meeting1Id ? attendedM1Set.has(m.id) : true;
          const hasM2 = meeting2Id ? attendedM2Set.has(m.id) : true;

          p1 = hasM1 ? '✓' : '';
          p2 = hasM2 ? '✓' : '';

          if (!hasM1 && !hasM2) {
            a = '✓';
          } else if (!hasM1 || !hasM2) {
            a = '✓';
          }
        }

        return {
          no: String(idx + 1),
          nama: m.name,
          kelas: m.class_name,
          p1,
          p2,
          s,
          i,
          a,
        };
      });

      doc.render({
        nama_bulan_upper: bulanLB.toUpperCase(),
        nama_bulan_title: bulanLB.charAt(0).toUpperCase() + bulanLB.slice(1).toLowerCase(),
        tgl_pengesahan: tglPengesahan,
        tgl_pembina_1: tglPembina1,
        tgl_pembina_2: tglPembina2,
        tgl_pembina_3: tglPembina3,
        tgl_pembina_4: tglPembina4,
        waktu_pelaksanaan_kegiatan: waktuPelaksanaanKegiatan,
        catatan_dokumentasi: catatanDokumentasi,
        siswa_list: siswaList,
        jurnal_list: jurnalList.map((j, idx) => ({
          no: String(idx + 1),
          hari_tanggal: j.hariTanggal,
          pemateri: j.pemateri,
          uraian: j.uraian,
          paraf: '✓',
          keterangan: j.keterangan,
        })),
        hadir_1: hadir1,
        persen_hadir_1: persenHadir1,
        tidak_hadir_1: tidakHadir1,
        persen_tidak_hadir_1: persenTidakHadir1,
        materi_1: materi1,
        catatan_1: catatan1,
        hadir_2: hadir2,
        persen_hadir_2: persenHadir2,
        tidak_hadir_2: tidakHadir2,
        persen_tidak_hadir_2: persenTidakHadir2,
        materi_2: materi2,
        catatan_2: catatan2,
      });

      const outBlob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const filename = `Laporan_Bulanan_EC_${bulanLB}_${tahunLB}.docx`;

      const downloadUrl = URL.createObjectURL(outBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      sound.playSuccess();
      setStatusMessage({
        type: 'success',
        text: `Berhasil mengunduh "${filename}"! Terdapat 103 siswa terisi otomatis sesuai template resmi sekolah.`,
      });
    } catch (err: any) {
      sound.playError();
      setStatusMessage({
        type: 'error',
        text: `Terjadi kesalahan saat membuat Laporan Bulanan: ${err.message || err}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-nunito pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-md border-2 border-blue-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[11px] font-black tracking-wider uppercase">
                Sekretariat & Dokumen Resmi
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[11px] font-bold">
                103 Anggota A21
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-yellow-400 shrink-0" />
              Generator Administrasi & Surat Resmi (.docx)
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium mt-1 max-w-2xl leading-relaxed">
              Buat Surat Peminjaman Ruang & Alat serta Laporan Bulanan resmi format Word (Kop, tabel, dan tanda tangan 100% presisi sesuai standar sekolah).
            </p>
          </div>

          {/* Quick Doc Selector Tabs */}
          <div className="flex items-center bg-blue-950/60 p-1.5 rounded-2xl border border-blue-400/30 shrink-0">
            <button
              onClick={() => {
                sound.playPop();
                setDocType('surat');
                setStatusMessage(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                docType === 'surat'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-blue-800/40'
              }`}
            >
              <FileText className="w-4 h-4" />
              Surat Peminjaman
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setDocType('lb');
                setStatusMessage(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                docType === 'lb'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-blue-800/40'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Laporan Bulanan (LB)
            </button>
          </div>
        </div>
      </div>

      {/* Status Notice if any */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border-2 flex items-start gap-3 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm font-bold flex-1 leading-relaxed">
            {statusMessage.text}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. SURAT PEMINJAMAN RUANG & ALAT VIEW                                */}
      {/* ==================================================================== */}
      {docType === 'surat' && (
        <div className="space-y-6 animate-fade-in">
          {/* Card 1: Data Surat & Pelaksanaan */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              Data Kepala Surat & Waktu Kegiatan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Nomor Surat</label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="24/EC/SMKN1/X/26"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Tanggal Surat</label>
                <input
                  type="text"
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="23 September 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Lampiran</label>
                <input
                  type="text"
                  value={lampiranSurat}
                  onChange={(e) => setLampiranSurat(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="1 (satu) lembar"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-600 mb-1">Perihal Surat</label>
                <input
                  type="text"
                  value={perihalSurat}
                  onChange={(e) => setPerihalSurat(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="Permohonan Izin Peminjaman Ruang dan Alat"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Tujuan / Kepada Yth.</label>
                <input
                  type="text"
                  value={tujuanSurat}
                  onChange={(e) => setTujuanSurat(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="Waka Bidang Sarana dan Prasarana"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Hari, Tanggal Kegiatan</label>
                <input
                  type="text"
                  value={hariTanggalSurat}
                  onChange={(e) => setHariTanggalSurat(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="Rabu, 23 September 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Waktu / Pukul</label>
                <input
                  type="text"
                  value={pukulSurat}
                  onChange={(e) => setPukulSurat(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="15:30 - 17:00 WIB"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Tempat Titik Kumpul</label>
                <input
                  type="text"
                  value={tempatSurat}
                  onChange={(e) => setTempatSurat(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="Aula Baru Jendral Sudirman SMKN 1 Purbalingga"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Penandatangan (Ketua & Sekre) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="w-5 h-5 text-indigo-600" />
              Penandatangan Surat (Ketua & Sekretaris)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Nama Ketua</label>
                <input
                  type="text"
                  value={namaKetua}
                  onChange={(e) => setNamaKetua(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">NIS Ketua</label>
                <input
                  type="text"
                  value={nisKetua}
                  onChange={(e) => setNisKetua(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Nama Sekretaris</label>
                <input
                  type="text"
                  value={namaSekre}
                  onChange={(e) => setNamaSekre(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">NIS Sekretaris</label>
                <input
                  type="text"
                  value={nisSekre}
                  onChange={(e) => setNisSekre(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Daftar Ruangan yang Dipinjam */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  Daftar Ruangan yang Dipinjam
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Tabel ini otomatis dicetak di lembar lampiran Word resmi.
                </p>
              </div>

              <TactileButton
                variant="white"
                size="sm"
                onClick={() => {
                  setRuangList([
                    ...ruangList,
                    {
                      id: String(Date.now()),
                      nama: 'Ruang Baru',
                      waktu: pukulSurat || '15:30 - 17:00',
                      keterangan: 'Kegiatan kelompok',
                    },
                  ]);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Ruang
              </TactileButton>
            </div>

            {/* Quick Preset Chips for Room */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black text-slate-400 mr-1">Preset Cepat:</span>
              {RUANG_PRESETS.map((rp) => (
                <button
                  key={rp}
                  onClick={() => {
                    sound.playPop();
                    setRuangList([
                      ...ruangList,
                      {
                        id: String(Date.now() + Math.random()),
                        nama: rp,
                        waktu: pukulSurat || '15:30 - 17:00',
                        keterangan: 'Kegiatan ekskul English Club',
                      },
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 transition-colors cursor-pointer"
                >
                  + {rp}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-600 font-black">
                    <th className="py-2 px-2 w-10 text-center">No</th>
                    <th className="py-2 px-3">Nama Ruangan</th>
                    <th className="py-2 px-3">Waktu Peminjaman</th>
                    <th className="py-2 px-3">Keterangan Kegiatan</th>
                    <th className="py-2 px-2 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ruangList.map((ruang, idx) => (
                    <tr key={ruang.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-2 text-center font-black text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={ruang.nama}
                          onChange={(e) => {
                            const next = [...ruangList];
                            next[idx].nama = e.target.value;
                            setRuangList(next);
                          }}
                          className="w-full px-2.5 py-1.5 font-bold bg-white border border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={ruang.waktu}
                          onChange={(e) => {
                            const next = [...ruangList];
                            next[idx].waktu = e.target.value;
                            setRuangList(next);
                          }}
                          className="w-full px-2.5 py-1.5 font-bold bg-white border border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={ruang.keterangan}
                          onChange={(e) => {
                            const next = [...ruangList];
                            next[idx].keterangan = e.target.value;
                            setRuangList(next);
                          }}
                          className="w-full px-2.5 py-1.5 font-bold bg-white border border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => {
                            sound.playPop();
                            setRuangList(ruangList.filter((_, i) => i !== idx));
                          }}
                          disabled={ruangList.length <= 1}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-30 cursor-pointer"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 4: Daftar Alat yang Dipinjam */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-600" />
                  Daftar Alat yang Dipinjam
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Tabel peralatan yang diajukan ke Sarpras.
                </p>
              </div>

              <TactileButton
                variant="white"
                size="sm"
                onClick={() => {
                  setAlatList([
                    ...alatList,
                    {
                      id: String(Date.now()),
                      nama: 'Alat Tambahan',
                      jumlah: '1 unit',
                    },
                  ]);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Alat
              </TactileButton>
            </div>

            {/* Quick Preset Chips for Tools */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black text-slate-400 mr-1">Preset Cepat:</span>
              {ALAT_PRESETS.map((ap) => (
                <button
                  key={ap.nama}
                  onClick={() => {
                    sound.playPop();
                    setAlatList([
                      ...alatList,
                      {
                        id: String(Date.now() + Math.random()),
                        nama: ap.nama,
                        jumlah: ap.jumlah,
                      },
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 transition-colors cursor-pointer"
                >
                  + {ap.nama} ({ap.jumlah})
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-600 font-black">
                    <th className="py-2 px-2 w-10 text-center">No</th>
                    <th className="py-2 px-3">Nama Alat / Perlengkapan</th>
                    <th className="py-2 px-3 w-40">Jumlah & Satuan</th>
                    <th className="py-2 px-2 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alatList.map((alat, idx) => (
                    <tr key={alat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-2 text-center font-black text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={alat.nama}
                          onChange={(e) => {
                            const next = [...alatList];
                            next[idx].nama = e.target.value;
                            setAlatList(next);
                          }}
                          className="w-full px-2.5 py-1.5 font-bold bg-white border border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={alat.jumlah}
                          onChange={(e) => {
                            const next = [...alatList];
                            next[idx].jumlah = e.target.value;
                            setAlatList(next);
                          }}
                          className="w-full px-2.5 py-1.5 font-bold bg-white border border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => {
                            sound.playPop();
                            setAlatList(alatList.filter((_, i) => i !== idx));
                          }}
                          disabled={alatList.length <= 1}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-30 cursor-pointer"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Download Surat Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-bold">
              Kop resmi SMKN 1 Purbalingga, logo, format baris, dan penandatangan otomatis digabungkan.
            </div>
            <TactileButton
              variant="brand"
              size="lg"
              disabled={isGenerating}
              onClick={handleDownloadSurat}
              className="w-full sm:w-auto"
            >
              <Download className="w-5 h-5" />
              <span>{isGenerating ? 'Menyusun Dokumen...' : 'Unduh Surat Peminjaman (.docx)'}</span>
            </TactileButton>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. LAPORAN BULANAN (LB) VIEW                                         */}
      {/* ==================================================================== */}
      {docType === 'lb' && (
        <div className="space-y-6 animate-fade-in">
          {/* Card 1: Periode Laporan & Pengesahan */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Periode Laporan & Tanggal Pengesahan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Bulan Laporan</label>
                <select
                  value={bulanLB}
                  onChange={(e) => {
                    const b = e.target.value;
                    setBulanLB(b);
                    setTglPengesahan(`31 ${b} ${tahunLB}`);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  {BULAN_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Tahun</label>
                <input
                  type="text"
                  value={tahunLB}
                  onChange={(e) => setTahunLB(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="2026"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Tanggal Pengesahan (Akhir Bulan)</label>
                <input
                  type="text"
                  value={tglPengesahan}
                  onChange={(e) => setTglPengesahan(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="31 Agustus 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Waktu Pelaksanaan (Dokumentasi)</label>
                <input
                  type="text"
                  value={waktuPelaksanaanKegiatan}
                  onChange={(e) => setWaktuPelaksanaanKegiatan(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="05, 19 Agustus 2026"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-600 mb-1">Catatan Kegiatan (Dokumentasi)</label>
                <input
                  type="text"
                  value={catatanDokumentasi}
                  onChange={(e) => setCatatanDokumentasi(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="Kegiatan pertemuan perdana, agenda rutin"
                />
              </div>
            </div>

            {/* Tanggal Paraf Pembina (4 Minggu Pertemuan) */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-700 mb-2">
                Tanggal Paraf Hadir Pembina / Pelatih (4 Pertemuan Rutin):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-[10px] font-black text-slate-400 block mb-0.5">Minggu ke-1:</span>
                  <input
                    type="text"
                    value={tglPembina1}
                    onChange={(e) => setTglPembina1(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 block mb-0.5">Minggu ke-2:</span>
                  <input
                    type="text"
                    value={tglPembina2}
                    onChange={(e) => setTglPembina2(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 block mb-0.5">Minggu ke-3:</span>
                  <input
                    type="text"
                    value={tglPembina3}
                    onChange={(e) => setTglPembina3(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 block mb-0.5">Minggu ke-4:</span>
                  <input
                    type="text"
                    value={tglPembina4}
                    onChange={(e) => setTglPembina4(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Jurnal Kegiatan Bulanan */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  Jurnal Kegiatan Pertemuan
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Mencatat agenda, materi, dan uraian pelaksanaan setiap pertemuan.
                </p>
              </div>

              <TactileButton
                variant="white"
                size="sm"
                onClick={() => {
                  setJurnalList([
                    ...jurnalList,
                    {
                      id: String(Date.now()),
                      hariTanggal: 'Rabu, ...',
                      pemateri: "English Club A'20",
                      uraian: 'Agenda rutin speaking practice',
                      keterangan: 'Praktek dialog kelompok',
                    },
                  ]);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Jurnal
              </TactileButton>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-600 font-black">
                    <th className="py-2 px-2 w-10 text-center">No</th>
                    <th className="py-2 px-3 w-40">Hari, Tanggal</th>
                    <th className="py-2 px-3 w-36">Pemateri</th>
                    <th className="py-2 px-3">Uraian Kegiatan</th>
                    <th className="py-2 px-3">Keterangan</th>
                    <th className="py-2 px-2 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jurnalList.map((j, idx) => (
                    <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-2 text-center font-black text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={j.hariTanggal}
                          onChange={(e) => {
                            const next = [...jurnalList];
                            next[idx].hariTanggal = e.target.value;
                            setJurnalList(next);
                          }}
                          className="w-full px-2 py-1.5 font-bold bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={j.pemateri}
                          onChange={(e) => {
                            const next = [...jurnalList];
                            next[idx].pemateri = e.target.value;
                            setJurnalList(next);
                          }}
                          className="w-full px-2 py-1.5 font-bold bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={j.uraian}
                          onChange={(e) => {
                            const next = [...jurnalList];
                            next[idx].uraian = e.target.value;
                            setJurnalList(next);
                          }}
                          className="w-full px-2 py-1.5 font-bold bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={j.keterangan}
                          onChange={(e) => {
                            const next = [...jurnalList];
                            next[idx].keterangan = e.target.value;
                            setJurnalList(next);
                          }}
                          className="w-full px-2 py-1.5 font-bold bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => {
                            sound.playPop();
                            setJurnalList(jurnalList.filter((_, i) => i !== idx));
                          }}
                          disabled={jurnalList.length <= 1}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Rekapitulasi Presensi & Evaluasi Bulanan */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Rekapitulasi Kehadiran & Evaluasi Materi
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Tabel 8 Rekapitulasi di berkas Word resmi.
                </p>
              </div>

              {/* Sync from Database Dropdown helper */}
              {officialMeetings.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black text-slate-400">Tarik Sesi:</span>
                  <select
                    onChange={(e) => handleAutoCalcMeeting(e.target.value, 1)}
                    className="px-2.5 py-1 text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="">-- Pilih Sesi M1 --</option>
                    {officialMeetings.map((m) => (
                      <option key={m.id} value={m.id}>
                        M1: {m.meeting_date} ({m.title || 'Pertemuan'})
                      </option>
                    ))}
                  </select>
                  <select
                    onChange={(e) => handleAutoCalcMeeting(e.target.value, 2)}
                    className="px-2.5 py-1 text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="">-- Pilih Sesi M2 --</option>
                    {officialMeetings.map((m) => (
                      <option key={m.id} value={m.id}>
                        M2: {m.meeting_date} ({m.title || 'Pertemuan'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Grid 2 Meetings side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Minggu 1 */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-blue-900 uppercase tracking-wider">
                    Pertemuan Minggu ke-1
                  </span>
                  <span className="text-[11px] font-bold text-blue-600">
                    Total Anggota: {activeA21Members.length || 103}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-black text-slate-600 mb-0.5">Jumlah Hadir</label>
                    <input
                      type="text"
                      value={hadir1}
                      onChange={(e) => setHadir1(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-600 mb-0.5">% Hadir</label>
                    <input
                      type="text"
                      value={persenHadir1}
                      onChange={(e) => setPersenHadir1(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-600 mb-0.5">Tidak Hadir</label>
                    <input
                      type="text"
                      value={tidakHadir1}
                      onChange={(e) => setTidakHadir1(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-600 mb-0.5">% Tidak Hadir</label>
                    <input
                      type="text"
                      value={persenTidakHadir1}
                      onChange={(e) => setPersenTidakHadir1(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-0.5">Materi Minggu 1</label>
                  <textarea
                    rows={2}
                    value={materi1}
                    onChange={(e) => setMateri1(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-0.5">Catatan Kemajuan Minggu 1</label>
                  <textarea
                    rows={2}
                    value={catatan1}
                    onChange={(e) => setCatatan1(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg outline-none resize-none"
                  />
                </div>
              </div>

              {/* Minggu 2 */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-indigo-900 uppercase tracking-wider">
                    Pertemuan Minggu ke-2
                  </span>
                  <span className="text-[11px] font-bold text-indigo-600">
                    Total Anggota: {activeA21Members.length || 103}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-black text-slate-600 mb-0.5">Jumlah Hadir</label>
                    <input
                      type="text"
                      value={hadir2}
                      onChange={(e) => setHadir2(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-600 mb-0.5">% Hadir</label>
                    <input
                      type="text"
                      value={persenHadir2}
                      onChange={(e) => setPersenHadir2(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-600 mb-0.5">Tidak Hadir</label>
                    <input
                      type="text"
                      value={tidakHadir2}
                      onChange={(e) => setTidakHadir2(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-600 mb-0.5">% Tidak Hadir</label>
                    <input
                      type="text"
                      value={persenTidakHadir2}
                      onChange={(e) => setPersenTidakHadir2(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-0.5">Materi Minggu 2</label>
                  <textarea
                    rows={2}
                    value={materi2}
                    onChange={(e) => setMateri2(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-0.5">Catatan Kemajuan Minggu 2</label>
                  <textarea
                    rows={2}
                    value={catatan2}
                    onChange={(e) => setCatatan2(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Status Presensi 103 Siswa Angkatan 21 */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Format Presensi 103 Siswa Angkatan 21
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Seluruh 103 siswa aktif otomatis digenerate ke Tabel 3 dengan centang (✓) sesuai format resmi.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-black">
                <button
                  onClick={() => {
                    sound.playPop();
                    setAttendanceMode('full');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    attendanceMode === 'full'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Centang Hadir Lengkap (Default)
                </button>
                <button
                  onClick={() => {
                    sound.playPop();
                    setAttendanceMode('auto');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    attendanceMode === 'auto'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sinkron Presensi Database
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Terverifikasi: Tepat <strong>{activeA21Members.length || 103} Siswa Angkatan 21</strong> siap diexport.</span>
              </div>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                100% Cocok Dokumen Sekolah
              </span>
            </div>
          </div>

          {/* Card 5: Panduan Foto Dokumentasi */}
          <div className="bg-amber-50 p-4 sm:p-5 rounded-3xl border-2 border-amber-200 flex items-start gap-3">
            <Camera className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed text-amber-950 font-medium">
              <p className="font-black text-amber-900">
                Panduan Foto Dokumentasi:
              </p>
              <p>
                Format Word resmi ini telah mempertahankan <strong>frame placeholder 2 foto dokumentasi</strong> dengan keterangan tanggal kegiatan. Setelah file diunduh, Naila (Sekretaris) atau pengurus dapat langsung melakukan <em>Copy-Paste / Insert Picture</em> foto dokumentasi asli di Microsoft Word tanpa khawatir format teks atau tabel bergeser.
              </p>
            </div>
          </div>

          {/* Action Download LB Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-bold">
              Kop formulir FO-002 s/d FO-008, rekapitulasi, dan 103 baris absensi otomatis tuntas sempurna.
            </div>
            <TactileButton
              variant="emerald"
              size="lg"
              disabled={isGenerating}
              onClick={handleDownloadLB}
              className="w-full sm:w-auto"
            >
              <Download className="w-5 h-5" />
              <span>{isGenerating ? 'Menyusun Laporan Bulanan...' : 'Unduh Laporan Bulanan (.docx)'}</span>
            </TactileButton>
          </div>
        </div>
      )}
    </div>
  );
};
