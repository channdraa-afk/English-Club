import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Award, 
  Users, 
  Mic, 
  PenTool, 
  HeartHandshake, 
  ShieldCheck, 
  Flame, 
  Instagram, 
  Clock, 
  ExternalLink,
  BookOpen,
  Send,
  Loader2,
  Trophy,
  PartyPopper
} from 'lucide-react';
import { Meeting } from '../../types/database';
import { sound } from '../../lib/audio';
import { getScheduleStatus } from '../../lib/schedule';
import { supabase } from '../../lib/supabase';
import confetti from 'canvas-confetti';

interface LandingPageProps {
  activeMeeting: Meeting | null;
  isManualBypass?: boolean;
  onOpenAttendance: () => void;
  onOpenMentor: () => void;
  membersCount?: { a21: number; a20: number };
  isRegistrationOpen?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  activeMeeting,
  isManualBypass = false,
  onOpenAttendance,
  onOpenMentor,
  membersCount = { a21: 104, a20: 59 },
  isRegistrationOpen = true,
}) => {
  const scheduleStatus = getScheduleStatus(activeMeeting, isManualBypass, 'student');

  // Form Registration State
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !className.trim() || !whatsapp.trim() || !reason.trim()) {
      sound.playError();
      setSubmitError('Harap lengkapi semua kolom pendaftaran yaa!');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const { error } = await supabase.from('registrations').insert([
        {
          full_name: fullName.trim(),
          class_name: className.trim().toUpperCase(),
          whatsapp_number: whatsapp.trim(),
          reason: reason.trim(),
          status: 'pending',
        },
      ]);

      if (error) throw error;

      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#dc2626'],
      });

      setSubmitSuccess(true);
      setFullName('');
      setClassName('');
      setWhatsapp('');
      setReason('');
    } catch (err: any) {
      sound.playError();
      setSubmitError(err.message || 'Gagal mengirim pendaftaran. Coba lagi nanti yaa!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    sound.playPop();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900 font-sans">
      {/* ================= 1. TOP NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <a 
            href="#beranda"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('beranda');
            }}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-blue-600 shadow-[0_2px_0_0_#1d4ed8] p-1 flex items-center justify-center transition-transform group-hover:scale-105 active:translate-y-0.5">
              <img src="/logo.png" alt="EC SMEGA Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                  English Club
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  SMEGA
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 leading-tight">
                Est. 23 March 2006
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-black text-slate-600">
            <button 
              type="button"
              onClick={() => scrollToSection('tentang')} 
              className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              Tentang
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('divisi')} 
              className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              Divisi
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('agenda')} 
              className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              Agenda Besar
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('galeri')} 
              className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              Galeri
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('daftar')} 
              className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              Gabung
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Spotlight CTA: Presensi Eskul */}
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onOpenAttendance();
              }}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black border-2 border-emerald-800 shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Buka Form Presensi Eskul"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
              <span>Presensi Eskul</span>
            </button>

            {/* Subtle Mentor Portal */}
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onOpenMentor();
              }}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-0.5 transition-all cursor-pointer"
              title="Portal Pengurus & Mentor (PIN)"
            >
              <ShieldCheck className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= 2. LIVE ESKUL RADAR ALERT ================= */}
      {scheduleStatus.isActive ? (
        <div className="bg-emerald-600 text-white border-b-2 border-emerald-800 py-2.5 px-4 shadow-sm animate-fade-in">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping shrink-0" />
              <p className="text-xs font-black">
                🎙️ Sesi Pertemuan Sedang Dibuka! ({scheduleStatus.currentTimeWIB} WIB) — Token tersedia di papan tulis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onOpenAttendance();
              }}
              className="px-3 py-1 rounded-xl bg-white text-emerald-800 text-[11px] font-black shadow-sm hover:bg-emerald-50 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Langsung Absen Sekarang ➔
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 text-slate-300 border-b border-slate-800 py-2 px-4 text-center text-xs font-bold">
          <span>📅 Latihan Rutin: </span>
          <strong className="text-amber-400">Setiap Rabu, 15:40 – 17:30 WIB</strong>
          <span className="text-slate-400"> di Ruang Eskul / Lab Bahasa SMEGA.</span>
        </div>
      )}

      {/* ================= 3. HERO SECTION ================= */}
      <section id="beranda" className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        {/* Subtle Decorative Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent -z-10 pointer-events-none rounded-b-[4rem]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Badge Kebanggaan Sejak 2006 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 text-xs font-black shadow-[0_2px_0_0_#bfdbfe] animate-fade-in">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>EST. 23 MARCH 2006 • SMK NEGERI 1 PURBALINGGA</span>
          </div>

          {/* Main Slogan / Yel-Yel Ikonik */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Spirit of <span className="text-blue-600 underline decoration-amber-400 decoration-wavy decoration-2">English Club!</span>
            </h1>
            <p className="text-2xl sm:text-4xl md:text-5xl font-black text-emerald-600 tracking-tight">
              Improve Your English Skill!
            </p>
          </div>

          {/* Subtitle & Value Proposition */}
          <p className="max-w-2xl mx-auto text-xs sm:text-base font-bold text-slate-600 leading-relaxed">
            Wadah resmi eksplorasi kemampuan komunikasi bahasa Inggris, public speaking, debat kompetitif, 
            dan literasi kreatif bagi siswa-siswi SMK Negeri 1 Purbalingga. Lebih dari 20 tahun tradisi prestasi dan kebersamaan.
          </p>

          {/* Dual 3D Tactile CTA Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            {/* Primary Spotlight: Mulai Presensi */}
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onOpenAttendance();
              }}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>MULAI PRESENSI HARI INI</span>
            </button>

            {/* Secondary: Pendaftaran */}
            <button
              type="button"
              onClick={() => scrollToSection('daftar')}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black border-2 border-blue-800 shadow-[0_4px_0_0_#1e3a8a] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>DAFTAR ANGGOTA BARU</span>
            </button>
          </div>

          {/* Live Stats Tactile Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0] text-center">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">{membersCount.a21}</span>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">
                Adik Kelas A21
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0] text-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">{membersCount.a20}</span>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">
                Pengurus A20
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0] text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-500">2</span>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">
                Divisi Utama
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0] text-center">
              <span className="text-2xl sm:text-3xl font-black text-rose-500">20+</span>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">
                Tahun Berdiri
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. ABOUT SECTION ================= */}
      <section id="tentang" className="py-14 bg-white border-y-2 border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider border border-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Mengenal Lebih Dekat</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tentang English Club SMEGA
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl mx-auto">
              Bukan sekadar eskul biasa, EC SMEGA adalah keluarga tempat kamu berani bertumbuh dan percaya diri.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-blue-200 shadow-[0_4px_0_0_#bfdbfe] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Safe Space to Speak</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Di sini tidak ada yang bakal menghakimi atau menertawakan kesalahan grammar-mu. 
                Kami percaya keberanian bicara adalah langkah pertama menuju kefasihan!
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-emerald-200 shadow-[0_4px_0_0_#a7f3d0] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Championship Spirit</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Menjadi kawah candradimuka penempaan delegasi lomba bahasa Inggris SMK Negeri 1 Purbalingga, 
                mulai dari Debate, Speech, hingga Storytelling di tingkat kabupaten dan provinsi.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-amber-200 shadow-[0_4px_0_0_#fde68a] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Solid Generation</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Koneksi hangat antar-angkatan, dari 59 pengurus Angkatan 20 yang membimbing hingga 
                104 adik-adik Angkatan 21 yang antusias berkarya bersama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. DIVISIONS SHOWCASE ================= */}
      <section id="divisi" className="py-14 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Dua Sayap Keunggulan</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Divisi Spesialisasi EC SMEGA
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl mx-auto">
              Pilih panggung bakat yang sesuai dengan passion dan keunikan potensimu!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Speaking Division */}
            <div className="p-6 rounded-3xl bg-white border-2 border-blue-300 shadow-[0_6px_0_0_#2563eb] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Speaking Division</h3>
                    <p className="text-xs font-bold text-blue-600">Dipimpin: Hanan Aditya Zahid</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                  Vokal & Panggung
                </span>
              </div>

              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Fokus mengasah artikulasi, intonasi vokal, kepercayaan diri di depan umum, serta seni berargumen 
                kritis melalui latihan rutin interaktif.
              </p>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Cabang Pelatihan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['🎙️ Speech Contest', '⚔️ English Debate', '📖 Storytelling', '📺 Newscasting', '🗣️ Daily Conversation', '🎉 Ice Breaking'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Writing Division */}
            <div className="p-6 rounded-3xl bg-white border-2 border-emerald-300 shadow-[0_6px_0_0_#059669] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Writing Division</h3>
                    <p className="text-xs font-bold text-emerald-600">Dipimpin: Amirah Nur Fairuza</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Literasi & Taktis
                </span>
              </div>

              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Wadah eksplorasi kata, daya imajinasi narasi, perluasan kosakata bahasa Inggris, serta strategi 
                ketangkasan kata dalam permainan papan kompetitif.
              </p>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Cabang Pelatihan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['✍️ Creative Writing', '📝 Essay Writing', '🔠 Scrabble Tactics', '🐝 Spelling Bee', '📖 Pop Culture Article', '📚 English Literacy'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 7 Sie Kerja Pendukung */}
          <div className="p-5 rounded-3xl bg-slate-100/80 border-2 border-slate-200 text-center space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Didukung Penuh Oleh 7 Sie Kerja Pengurus A20:
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-black text-slate-700">
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm">👨‍🏫 Sie Pengajar</span>
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm">⚖️ Sie Kedisiplinan</span>
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm">📸 Sie PDD (Publikasi & Desain)</span>
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm">📢 Sie Humas</span>
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm">🏢 Sie Sarpras</span>
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm">📦 Sie Perlengkapan</span>
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm">🧹 Sie Kebersihan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. BIG EVENTS CALENDAR ================= */}
      <section id="agenda" className="py-14 bg-white border-y-2 border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-black uppercase tracking-wider border border-amber-200">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Agenda Besar Tahunan</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Program Kerja Ikonik EC SMEGA
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl mx-auto">
              Empat milestone terbesar yang selalu dinanti-nantikan oleh seluruh anggota dan pengurus.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Event 1: EE */}
            <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-blue-400 shadow-[0_4px_0_0_#e2e8f0] transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                  🎭 EE
                </div>
                <h3 className="font-black text-sm text-slate-900">English Expression</h3>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                  Ajang unjuk bakat akbar pentas seni drama, pidato monolog, dan performa panggung bahasa Inggris seluruh anggota.
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                Pentas Seni & Ekspresi
              </span>
            </div>

            {/* Event 2: EA */}
            <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-400 shadow-[0_4px_0_0_#e2e8f0] transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  🏕️ EA
                </div>
                <h3 className="font-black text-sm text-slate-900">English Adventure</h3>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                  Kegiatan camp alam terbuka, outbond seru, bonding keakraban antar-angkatan, dan team building di alam.
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                Camp & Outbond
              </span>
            </div>

            {/* Event 3: Pelantikan */}
            <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 shadow-[0_4px_0_0_#e2e8f0] transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                  🎓 PP
                </div>
                <h3 className="font-black text-sm text-slate-900">Pemantapan & Pelantikan</h3>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                  Masa pengukuhan sakral peserta baru Angkatan 21 menjadi anggota resmi EC SMEGA dan kaderisasi kepengurusan.
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 w-fit">
                Regenerasi & Pengukuhan
              </span>
            </div>

            {/* Event 4: Dies Natalis */}
            <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-amber-400 shadow-[0_4px_0_0_#e2e8f0] transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                  🎂 23M
                </div>
                <h3 className="font-black text-sm text-slate-900">Ulang Tahun EC SMEGA</h3>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                  Peringatan hari lahir English Club SMKN 1 Purbalingga setiap 23 Maret bersama alumni, guru pembina, dan anggota.
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                23 Maret (Sejak 2006)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. GALLERY & INSTAGRAM SHOWCASE ================= */}
      <section id="galeri" className="py-14 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider border border-rose-200">
                <Instagram className="w-3.5 h-3.5 text-rose-600" />
                <span>Dokumentasi Resmi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Momen Seru @englishclubsvhs1pbg
              </h2>
            </div>
            <a
              href="https://www.instagram.com/englishclubsvhs1pbg/"
              target="_blank"
              rel="noreferrer"
              onClick={() => sound.playPop()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-rose-600 text-white text-xs font-black border border-rose-700 shadow-[0_3px_0_0_#9f1239] active:translate-y-0.5 transition-all cursor-pointer w-fit"
            >
              <Instagram className="w-4 h-4" />
              <span>Kunjungi Instagram Resmi</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

          {/* Tactile Photo Highlights Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm space-y-2 text-center">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-inner">
                🎙️
              </div>
              <p className="text-xs font-black text-slate-800">Speaking & Speech</p>
              <span className="text-[10px] font-bold text-slate-400">Latihan Rutin Rabu</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm space-y-2 text-center">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-inner">
                🏕️
              </div>
              <p className="text-xs font-black text-slate-800">English Adventure</p>
              <span className="text-[10px] font-bold text-slate-400">Outdoor Camp & Games</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm space-y-2 text-center">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-inner">
                🎭
              </div>
              <p className="text-xs font-black text-slate-800">English Expression</p>
              <span className="text-[10px] font-bold text-slate-400">Panggung Seni Bakat</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm space-y-2 text-center">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-black text-2xl shadow-inner">
                🎂
              </div>
              <p className="text-xs font-black text-slate-800">Dies Natalis 2006</p>
              <span className="text-[10px] font-bold text-slate-400">Ulang Tahun 23 Maret</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. FORM PENDAFTARAN ONLINE ================= */}
      <section id="daftar" className="py-16 bg-white border-t-2 border-slate-200">
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Pendaftaran Online</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gabung Bersama Keluarga EC SMEGA!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              Buka potensi terbaikmu. Isi formulir singkat di bawah ini dan jadilah bagian dari petualangan seru kami!
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border-2 border-blue-300 shadow-[0_6px_0_0_#2563eb] space-y-4">
            {submitSuccess ? (
              <div className="text-center py-8 space-y-4 animate-scale-up">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 border-2 border-emerald-300 flex items-center justify-center shadow-md">
                  <PartyPopper className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Pendaftaran Berhasil Terkirim! 🎉</h3>
                  <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Terima kasih sudah mendaftar! Data kamu sudah masuk ke sistem dan akan segera di-ACC oleh Kak Chandra & Pengurus EC SMEGA.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setSubmitSuccess(false);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black border-2 border-blue-800 shadow-[0_3px_0_0_#1e3a8a] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Kirim Pendaftaran Lain
                </button>
              </div>
            ) : !isRegistrationOpen ? (
              <div className="text-center py-8 space-y-3">
                <Clock className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-black text-slate-800">Pendaftaran Saat Ini Ditutup</h3>
                <p className="text-xs font-bold text-slate-500">
                  Pantau terus Instagram <strong className="text-slate-800">@englishclubsvhs1pbg</strong> untuk informasi pembukaan pendaftaran gelombang berikutnya!
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Alvian Yusuf Herlangga"
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                      Kelas
                    </label>
                    <input
                      type="text"
                      required
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="Contoh: X PPLG 1"
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                    Alasan Ingin Bergabung
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ceritakan kenapa kamu tertarik gabung English Club..."
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black border-2 border-blue-800 shadow-[0_4px_0_0_#1e3a8a] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Formulir...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>KIRIM PENDAFTARAN SAYA</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ================= 9. FOOTER RESMI ================= */}
      <footer className="py-10 bg-slate-900 text-white border-t-2 border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-blue-600 p-1 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="EC SMEGA Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="font-black text-base text-white tracking-tight">
                  English Club SMK Negeri 1 Purbalingga
                </h4>
                <p className="text-xs font-bold text-slate-400">
                  Jl. Mayjen Sungkono, Selabaya, Kalimanah, Purbalingga 53371
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/englishclubsvhs1pbg/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 transition-colors"
                title="Instagram Resmi"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onOpenAttendance();
                }}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black border border-emerald-500 transition-colors cursor-pointer"
              >
                Presensi Eskul
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-bold text-slate-500">
            <p>© 2006 – 2026 English Club SMEGA. All Rights Reserved.</p>
            <p>
              Dikembangkan oleh{' '}
              <a 
                href="https://github.com/channdraa-afk" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-400 hover:underline font-extrabold"
              >
                Chandra (@channdraa-afk)
              </a>{' '}
              — Ketua EC SMEGA.
            </p>
          </div>
        </div>
      </footer>

      {/* ================= 10. STICKY MOBILE QUICK-ACTION BUTTON ================= */}
      <div className="fixed bottom-5 right-5 z-30 sm:hidden">
        <button
          type="button"
          onClick={() => {
            sound.playPop();
            onOpenAttendance();
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:translate-y-1 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
          <span>PRESENSI</span>
        </button>
      </div>
    </div>
  );
};
