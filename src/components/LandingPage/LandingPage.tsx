import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Mic, 
  PenTool, 
  HeartHandshake, 
  Flame, 
  Instagram, 
  Clock, 
  ExternalLink,
  Send,
  Loader2,
  Trophy,
  PartyPopper,
  Crown,
  Edit3,
  Plus,
  Trash2,
  Lock,
  X,
  Gamepad2,
  Image as ImageIcon,
  Volume2,
  Shuffle,
  ChevronDown,
  CheckCircle2,
  MapPin,
  Star,
  HelpCircle
} from 'lucide-react';
import { Meeting, BigEvent, GalleryItem } from '../../types/database';
import { sound } from '../../lib/audio';
import { getScheduleStatus } from '../../lib/schedule';
import { supabase } from '../../lib/supabase';
import { IDIOMS_BANK } from '../../data/idioms';
import confetti from 'canvas-confetti';

export const DEFAULT_BIG_EVENTS: BigEvent[] = [
  {
    id: 'ee',
    title: 'English Expression',
    description: 'Ajang unjuk bakat akbar pentas seni drama, pidato monolog, dan performa panggung bahasa Inggris seluruh anggota.',
    tag: 'Pentas Seni & Ekspresi',
    accentColor: 'blue',
  },
  {
    id: 'ea',
    title: 'English Adventure',
    description: 'Kegiatan camp alam terbuka, outbond seru, bonding keakraban antar-angkatan, dan team building di alam.',
    tag: 'Camp & Outbond',
    accentColor: 'emerald',
  },
  {
    id: 'pp',
    title: 'Pemantapan & Pelantikan',
    description: 'Masa pengukuhan sakral peserta baru Angkatan 21 menjadi anggota resmi EC SMEGA dan kaderisasi kepengurusan.',
    tag: 'Regenerasi & Pengukuhan',
    accentColor: 'indigo',
  },
  {
    id: 'ultah',
    title: 'Ulang Tahun EC SMEGA',
    description: 'Peringatan hari lahir English Club SMKN 1 Purbalingga setiap 23 Maret bersama alumni, guru pembina, dan anggota.',
    tag: '23 Maret (Sejak 2006)',
    accentColor: 'amber',
  },
];

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'First Gathering 2026',
    subtitle: 'Pertemuan perdana perkenalan dan fun icebreaker bersama 86+ adik kelas A21.',
    imageUrl: '/logo.png',
    postUrl: 'https://www.instagram.com/englishclubsvhs1pbg/',
    accentColor: 'blue',
  },
  {
    id: 'gal-2',
    title: 'Speaking & Roleplay Practice',
    subtitle: 'Latihan percakapan bahasa Inggris dan skenario roleplay santai di kelas.',
    imageUrl: '/logo.png',
    postUrl: 'https://www.instagram.com/englishclubsvhs1pbg/',
    accentColor: 'emerald',
  },
  {
    id: 'gal-3',
    title: 'English Adventure Camp',
    subtitle: 'Kegiatan luar ruangan, team building, dan bonding seru lintas angkatan.',
    imageUrl: '/logo.png',
    postUrl: 'https://www.instagram.com/englishclubsvhs1pbg/',
    accentColor: 'amber',
  },
  {
    id: 'gal-4',
    title: 'Dies Natalis EC SMEGA',
    subtitle: 'Peringatan hari lahir berdirinya English Club SMKN 1 Purbalingga sejak 2006.',
    imageUrl: '/logo.png',
    postUrl: 'https://www.instagram.com/englishclubsvhs1pbg/',
    accentColor: 'rose',
  },
];

interface LandingPageProps {
  activeMeeting: Meeting | null;
  isManualBypass?: boolean;
  onOpenAttendance: () => void;
  onOpenMentor: () => void;
  onOpenArena?: () => void;
  hasActiveQuiz?: boolean;
  membersCount?: { a21: number; a20: number };
  isRegistrationOpen?: boolean;
  isSuperAdmin?: boolean;
  onGoToMentorPortal?: () => void;
  onSuperAdminLock?: () => void;
  bigEvents?: BigEvent[];
  galleryItems?: GalleryItem[];
  onUpdateBigEvents?: (events: BigEvent[]) => Promise<void> | void;
  onUpdateGalleryItems?: (items: GalleryItem[]) => Promise<void> | void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  activeMeeting,
  isManualBypass = false,
  onOpenAttendance,
  onOpenMentor,
  onOpenArena,
  hasActiveQuiz = false,
  membersCount = { a21: 103, a20: 59 },
  isRegistrationOpen = true,
  isSuperAdmin = false,
  onGoToMentorPortal,
  onSuperAdminLock,
  bigEvents,
  galleryItems,
  onUpdateBigEvents,
  onUpdateGalleryItems,
}) => {
  const scheduleStatus = getScheduleStatus(activeMeeting, isManualBypass, 'student');

  // Secret 5-tap on the logo to open Mentor Portal (Matching Navbar.tsx)
  const [logoTapCount, setLogoTapCount] = useState(0);

  const handleLogoTap = () => {
    sound.playPop();
    const nextTap = logoTapCount + 1;
    if (nextTap >= 5) {
      setLogoTapCount(0);
      onOpenMentor();
    } else {
      setLogoTapCount(nextTap);
      setTimeout(() => setLogoTapCount(0), 3000);
    }
  };

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

  // Dynamic Events & Gallery State
  const [eventsList, setEventsList] = useState<BigEvent[]>(bigEvents || DEFAULT_BIG_EVENTS);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(galleryItems || DEFAULT_GALLERY_ITEMS);

  useEffect(() => {
    if (bigEvents && bigEvents.length > 0) setEventsList(bigEvents);
  }, [bigEvents]);

  useEffect(() => {
    if (galleryItems && galleryItems.length > 0) setGalleryList(galleryItems);
  }, [galleryItems]);

  // Event Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BigEvent | null>(null);
  const [eventForm, setEventForm] = useState<{
    title: string;
    description: string;
    tag: string;
    accentColor: NonNullable<BigEvent['accentColor']>;
  }>({
    title: '',
    description: '',
    tag: '',
    accentColor: 'blue',
  });

  // Gallery Modal State
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [galleryForm, setGalleryForm] = useState<{
    title: string;
    subtitle: string;
    imageUrl: string;
    postUrl: string;
    accentColor: NonNullable<GalleryItem['accentColor']>;
  }>({
    title: '',
    subtitle: '',
    imageUrl: '',
    postUrl: '',
    accentColor: 'blue',
  });

  // Tactile Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'event' | 'gallery';
    id: string;
    title: string;
  } | null>(null);

  // Daily Idiom State (Defaults to calendar-based idiom, with shuffle support)
  const initialIdiomIndex = React.useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return Math.abs(dayOfYear) % IDIOMS_BANK.length;
  }, []);

  const [currentIdiomIndex, setCurrentIdiomIndex] = useState(initialIdiomIndex);
  const currentIdiom = IDIOMS_BANK[currentIdiomIndex] || IDIOMS_BANK[0];
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Web Speech API Native Pronunciation
  const handleSpeakIdiom = () => {
    sound.playPop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentIdiom.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShuffleIdiom = () => {
    sound.playPop();
    let nextIdx = Math.floor(Math.random() * IDIOMS_BANK.length);
    if (nextIdx === currentIdiomIndex) {
      nextIdx = (nextIdx + 1) % IDIOMS_BANK.length;
    }
    setCurrentIdiomIndex(nextIdx);
  };

  // FAQ Accordion State (open question index, first item open by default)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const FAQ_ITEMS = [
    {
      q: 'Kak, kalau bahasa Inggriskuku masih belepotan / pemula banget boleh ikut?',
      a: 'Boleh banget dan sangat dipersilakan! Di English Club SMEGA tidak ada yang bakal menghakimi atau menertawakan kesalahan grammar. Prinsip utama kami: keberanian bicara adalah langkah pertama menuju kefasihan. Kakak-kakak mentor Angkatan 20 akan membimbingmu dengan santai dan ramah!',
    },
    {
      q: 'Apakah ada seleksi masuk atau tes wawancara untuk bergabung?',
      a: 'Sama sekali tidak ada seleksi! Siapa pun siswa SMKN 1 Purbalingga (dari jurusan apa pun) yang memiliki niat dan kemauan untuk belajar bahasa Inggris langsung diterima menjadi keluarga besar EC SMEGA dengan tangan terbuka.',
    },
    {
      q: 'Eskulnya bayar uang kas mingguan nggak kak?',
      a: 'Ada uang kas santai sebesar Rp2.000 per minggu yang dikelola oleh Bendahara. Uang kas ini digunakan sepenuhnya untuk operasional belajar kita bersama—seperti fotokopi lembar materi/modul latihan, hadiah seru untuk pemenang fun games & kuis EC Arena, serta kebutuhan sarana belajar eskul lainnya secara transparan!',
    },
    {
      q: 'Gimana kalau pas hari Rabu ada jam tambahan pelajaran atau remedial sekolah?',
      a: 'Tenang saja, pembelajaran akademik sekolah tetap menjadi prioritas nomor satu. Kamu cukup mengabari mentor pendamping kelompokmu atau menyerahkan surat keterangan izin/remedial ke Kak Chandra dan pengurus A20.',
    },
  ];

  const toggleFaq = (idx: number) => {
    sound.playPop();
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  // Event Handlers
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      tag: '',
      accentColor: 'blue',
    });
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (ev: BigEvent) => {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title,
      description: ev.description,
      tag: ev.tag,
      accentColor: ev.accentColor || 'blue',
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.tag.trim()) return;

    let updated: BigEvent[];
    if (editingEvent) {
      updated = eventsList.map((item) => 
        item.id === editingEvent.id 
          ? { ...item, ...eventForm } 
          : item
      );
    } else {
      const newEvent: BigEvent = {
        id: 'ev-' + Date.now(),
        ...eventForm,
      };
      updated = [...eventsList, newEvent];
    }

    setEventsList(updated);
    setIsEventModalOpen(false);
    sound.playSuccess();
    await onUpdateBigEvents?.(updated);
  };

  const handleDeleteEvent = (id: string) => {
    const item = eventsList.find((ev) => ev.id === id);
    sound.playPop();
    setDeleteTarget({
      type: 'event',
      id,
      title: item?.title || 'Agenda ini',
    });
  };

  // Gallery Handlers
  const handleOpenAddGallery = () => {
    setEditingGallery(null);
    setGalleryForm({
      title: '',
      subtitle: '',
      imageUrl: '',
      postUrl: 'https://www.instagram.com/englishclubsvhs1pbg/',
      accentColor: 'blue',
    });
    setIsGalleryModalOpen(true);
  };

  const handleEditGallery = (item: GalleryItem) => {
    setEditingGallery(item);
    setGalleryForm({
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: item.imageUrl || '',
      postUrl: item.postUrl || 'https://www.instagram.com/englishclubsvhs1pbg/',
      accentColor: item.accentColor || 'blue',
    });
    setIsGalleryModalOpen(true);
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title.trim() || !galleryForm.subtitle.trim()) return;

    let updated: GalleryItem[];
    if (editingGallery) {
      updated = galleryList.map((item) => 
        item.id === editingGallery.id 
          ? { ...item, ...galleryForm } 
          : item
      );
    } else {
      const newItem: GalleryItem = {
        id: 'gal-' + Date.now(),
        ...galleryForm,
      };
      updated = [...galleryList, newItem];
    }

    setGalleryList(updated);
    setIsGalleryModalOpen(false);
    sound.playSuccess();
    await onUpdateGalleryItems?.(updated);
  };

  const handleDeleteGallery = (id: string) => {
    const item = galleryList.find((g) => g.id === id);
    sound.playPop();
    setDeleteTarget({
      type: 'gallery',
      id,
      title: item?.title || 'Momen/foto ini',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteTarget(null);
    sound.playPop();

    if (type === 'event') {
      const updated = eventsList.filter((item) => item.id !== id);
      setEventsList(updated);
      await onUpdateBigEvents?.(updated);
    } else {
      const updated = galleryList.filter((item) => item.id !== id);
      setGalleryList(updated);
      await onUpdateGalleryItems?.(updated);
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
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Brand (Secret 5-Tap to Mentor Portal) */}
          <div 
            onClick={() => {
              scrollToSection('beranda');
              handleLogoTap();
            }}
            className="flex items-center gap-2 sm:gap-3 group shrink-0 cursor-pointer select-none min-w-0"
            title="English Club SMEGA"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border-2 border-blue-600 shadow-[0_2px_0_0_#1d4ed8] p-1 flex items-center justify-center transition-transform group-hover:scale-105 active:translate-y-0.5 shrink-0">
              <img src="/logo.png" alt="EC SMEGA Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-black text-xs sm:text-base text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors whitespace-nowrap">
                  English Club
                </span>
                <span className="hidden sm:inline text-[9px] sm:text-[10px] font-black uppercase px-1 sm:px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                  SMEGA
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 leading-tight hidden min-[380px]:inline">
                Est. 23 March 2006
              </span>
            </div>
          </div>

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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Super Admin Status Badge (Inside Navbar - Sleek, Tactile, Non-intrusive) */}
            {isSuperAdmin && (
              <>
                {/* Mobile Super Admin Crown Quick-Access (Compact 34px) */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    onGoToMentorPortal?.();
                  }}
                  className="sm:hidden p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-xs active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                  title="Pusat Komando Super Admin"
                >
                  <Crown className="w-4 h-4 text-amber-600" />
                </button>

                {/* Desktop Full Super Admin Badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-[0_2px_0_0_#fcd34d] animate-fade-in">
                  <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-black text-amber-950">Chandra</span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      onGoToMentorPortal?.();
                    }}
                    className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black cursor-pointer shadow-xs active:translate-y-0.5 transition-all"
                    title="Masuk ke Pusat Komando Admin"
                  >
                    Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      onSuperAdminLock?.();
                    }}
                    className="p-1 rounded-lg text-amber-700 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Kunci / Keluar Super Admin"
                  >
                    <Lock className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}

            {/* Spotlight CTA: Presensi Eskul */}
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onOpenAttendance();
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black border-2 border-emerald-800 shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
              title="Buka Form Presensi Eskul"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse shrink-0" />
              <span>
                <span className="min-[440px]:hidden">Presensi</span>
                <span className="hidden min-[440px]:inline">Presensi Eskul</span>
              </span>
            </button>

            {/* EC Arena Live Quiz Button ("Ready to Fight" — Only visible when arena is active) */}
            {hasActiveQuiz && onOpenArena && (
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onOpenArena();
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-black border-2 transition-all cursor-pointer shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-800 shadow-[0_3px_0_0_#1e3a8a] animate-pulse active:translate-y-0.5"
                title="Buka Kuis Live EC Arena"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                <span>
                  <span className="min-[440px]:hidden">Arena</span>
                  <span className="hidden min-[440px]:inline">EC Arena</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </button>
            )}
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
                🎙️ Sesi Pertemuan Sedang Dibuka! ({scheduleStatus.currentTimeWIB}) — Token tersedia di papan tulis.
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
          <span>📅 Agenda Rutin: </span>
          <strong className="text-amber-400">Setiap Rabu, 15:40 – 17:30 WIB</strong>
          <span className="text-slate-400"> di SMKN 1 Purbalingga.</span>
        </div>
      )}

      {/* ================= 3. HERO SECTION ================= */}
      <section id="beranda" className="relative pt-6 pb-12 md:pt-16 md:pb-24 overflow-hidden">
        {/* Subtle Decorative Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent -z-10 pointer-events-none rounded-b-[4rem]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
          {/* Badge Kebanggaan Sejak 2006 */}
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 text-[11px] sm:text-xs font-black shadow-[0_2px_0_0_#bfdbfe] animate-fade-in whitespace-nowrap">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span>EST. 2006 • SMKN 1 PURBALINGGA</span>
          </div>

          {/* Main Slogan / Yel-Yel Ikonik */}
          <div className="space-y-1.5 sm:space-y-2 max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Spirit of{' '}
              <span className="inline-block text-blue-600 underline decoration-amber-400 decoration-wavy decoration-2 underline-offset-4 sm:underline-offset-8">
                English Club!
              </span>
            </h1>
            <p className="text-xl sm:text-4xl md:text-5xl font-black text-emerald-600 tracking-tight pt-0.5">
              Improve Your English Skill!
            </p>
          </div>

          {/* Subtitle & Value Proposition */}
          <p className="max-w-2xl mx-auto text-xs sm:text-base font-bold text-slate-600 leading-relaxed">
            Ekstrakurikuler resmi SMK Negeri 1 Purbalingga untuk mengembangkan kemampuan komunikasi bahasa Inggris, public speaking, debat kompetitif, 
            dan literasi kreatif. Lebih dari 20 tahun tradisi prestasi dan kebersamaan.
          </p>

          {/* 3D Tactile CTA Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            {/* Primary Spotlight: Mulai Presensi */}
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onOpenAttendance();
              }}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 shrink-0" />
              <span>PRESENSI ESKUL</span>
            </button>

            {/* EC Arena Live Quiz ("Ready to Fight" — Only visible when arena is active) */}
            {hasActiveQuiz && onOpenArena && (
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onOpenArena();
                }}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-black border-2 transition-all cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-800 shadow-[0_4px_0_0_#1e3a8a] active:translate-y-1 animate-pulse"
              >
                <Gamepad2 className="w-4 h-4 shrink-0 text-blue-200" />
                <span>KUIS EC ARENA (LIVE)</span>
              </button>
            )}

            {/* Secondary: Pendaftaran */}
            <button
              type="button"
              onClick={() => scrollToSection('daftar')}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-black border-2 border-slate-300 shadow-[0_4px_0_0_#cbd5e1] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 shrink-0 text-slate-600" />
              <span>GABUNG EC</span>
            </button>
          </div>

          {/* Live Stats Tactile Bar (3 Kolom Mantap & Proporsional) */}
          <div className="pt-8 grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto">
            <div className="p-2 sm:p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0] text-center">
              <span className="text-xl sm:text-3xl font-black text-blue-600">{membersCount.a21}</span>
              <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">
                Anggota A21
              </p>
            </div>
            <div className="p-2 sm:p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0] text-center">
              <span className="text-xl sm:text-3xl font-black text-emerald-600">{membersCount.a20}</span>
              <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">
                Pengurus A20
              </p>
            </div>
            <div className="p-2 sm:p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0] text-center">
              <span className="text-xl sm:text-3xl font-black text-amber-500">20+</span>
              <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">
                Tahun Sejarah
              </p>
            </div>
          </div>

          {/* ================= 3B. DYNAMIC TWIN SPOTLIGHT: UPCOMING GATHERING & WORD OF THE DAY ================= */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
            {/* Card 1: Upcoming Gathering Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-indigo-200 hover:border-indigo-300 shadow-[0_4px_0_0_#c7d2fe] space-y-4 flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black uppercase">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Jadwal Pertemuan Eskul</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                    Rabu • 15:40 - 17:30 WIB
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {activeMeeting?.title || 'Speaking & Communicative Practice'}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>SMK Negeri 1 Purbalingga (Ruang Kelas &amp; Teori)</span>
                  </p>
                </div>

                {/* Checklist Persiapan */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Yang Perlu Disiapkan Adik Kelas:</p>
                  <ul className="text-xs font-bold text-slate-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Bawa smartphone untuk presensi online &amp; kuis live</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Buku catatan &amp; alat tulis pendukung</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Keberanian bicara tanpa rasa takut salah grammar!</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onOpenAttendance();
                }}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black border-2 border-indigo-800 shadow-[0_3px_0_0_#3730a3] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Buka Petunjuk &amp; Presensi Sesi</span>
              </button>
            </div>

            {/* Card 2: Word & Idiom of the Day */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-amber-100/50 border-2 border-amber-300 hover:border-amber-400 shadow-[0_4px_0_0_#fcd34d] space-y-4 flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 border border-amber-400 text-amber-950 text-[10px] font-black uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Word &amp; Idiom of the Day</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleShuffleIdiom}
                    className="p-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-xs transition-all active:translate-y-0.5 cursor-pointer flex items-center gap-1 text-[10px] font-black"
                    title="Acak kata lain"
                  >
                    <Shuffle className="w-3 h-3 text-amber-700" />
                    <span>Acak</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950 italic tracking-tight">
                      "{currentIdiom.word}"
                    </h3>
                    <button
                      type="button"
                      onClick={handleSpeakIdiom}
                      className={`p-1.5 rounded-xl border transition-all active:translate-y-0.5 cursor-pointer flex items-center gap-1 ${
                        isPlayingAudio
                          ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse'
                          : 'bg-white hover:bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                      }`}
                      title="Dengarkan pengucapan native speaker"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="text-[10px] font-black">Pronounce</span>
                    </button>
                  </div>

                  <p className="text-xs font-bold text-amber-900 leading-relaxed">
                    {currentIdiom.meaning}
                  </p>
                </div>

                {/* Example sentence */}
                <div className="p-3 rounded-2xl bg-white/80 border border-amber-200/80 space-y-1">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Contoh Kalimat:</span>
                  <p className="text-xs font-bold italic text-slate-800 leading-relaxed">
                    "{currentIdiom.example}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-amber-800/80 pt-1">
                <span>Kategori: <strong className="capitalize text-amber-950">{currentIdiom.category}</strong></span>
                <span className="text-[10px] font-extrabold text-amber-700">Otomatis Berganti Tiap Hari ☀️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. ABOUT SECTION ================= */}
      <section id="tentang" className="py-14 bg-white border-y-2 border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tentang English Club SMEGA
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl mx-auto">
              Tempat belajar bahasa Inggris santai di SMKN 1 Purbalingga. Nggak ada senioritas, nggak usah takut salah grammar.
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
                Mempersiapkan dan melatih delegasi lomba bahasa Inggris SMK Negeri 1 Purbalingga, 
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
                103 adik-adik Angkatan 21 yang antusias berkarya bersama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. DIVISIONS SHOWCASE ================= */}
      <section id="divisi" className="py-14 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Divisi di English Club SMEGA
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl mx-auto">
              Pilih bidang yang paling kamu minati: vokal panggung atau karya tulis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Speaking Division */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-blue-300 shadow-[0_6px_0_0_#2563eb] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Speaking Division</h3>
                    <p className="text-xs font-bold text-blue-600">Dipimpin: Hanan Aditya Zahid</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 text-[10px] font-black uppercase w-fit">
                  Public Speaking & Debat
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
                  {['Speech Contest', 'English Debate', 'Storytelling', 'Newscasting', 'Daily Conversation', 'Ice Breaking'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Writing Division */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-emerald-300 shadow-[0_6px_0_0_#059669] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Writing Division</h3>
                    <p className="text-xs font-bold text-emerald-600">Dipimpin: Amirah Nur Fairuza</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase w-fit">
                  Literasi & Word Games
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
                  {['Creative Writing', 'Essay Writing', 'Scrabble Tactics', 'Spelling Bee', 'Pop Culture Article', 'English Literacy'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 7 Sie Kerja Pendukung (Frameless Tactile Strip) */}
          <div className="pt-2 text-center space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Didukung Penuh Oleh 7 Sie Kerja Pengurus A20:
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-black text-slate-700">
              <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white border-2 border-slate-200 shadow-sm">Sie Pengajar & Pendamping</span>
              <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white border-2 border-slate-200 shadow-sm">Sie Kedisiplinan</span>
              <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white border-2 border-slate-200 shadow-sm">Sie PDD (Publikasi & Desain)</span>
              <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white border-2 border-slate-200 shadow-sm">Sie Humas</span>
              <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white border-2 border-slate-200 shadow-sm">Sie Sarpras</span>
              <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white border-2 border-slate-200 shadow-sm">Sie Operasional</span>
              <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white border-2 border-slate-200 shadow-sm">Sie Kurikulum</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5B. HALL OF FAME: BINTANG KEAKTIFAN A21 ================= */}
      <section className="py-14 bg-gradient-to-b from-slate-50 to-white border-t-2 border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Hall of Fame &amp; Apresiasi Angkatan 21</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Bintang Prestasi &amp; Keaktifan Pekan Ini
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl mx-auto">
              Apresiasi untuk adik-adik kelas Angkatan 21 yang paling berani bicara, aktif di kelompok, dan konsisten hadir mengasah kemampuan bahasa Inggris.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Top Speaking Star',
                role: 'Paling Aktif Berbicara',
                desc: 'Selalu berani menyuarakan opini dan percaya diri dalam sesi conversation.',
                badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
                icon: '🎙️',
                accent: 'border-blue-300 shadow-[0_4px_0_0_#93c5fd]',
              },
              {
                title: 'Word Quiz Master',
                role: 'Ketangkasan Kuis Tertinggi',
                desc: 'Peraih skor tertinggi dan ketelitian vocabulary terbaik di kuis EC Arena.',
                badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                icon: '⚡',
                accent: 'border-amber-300 shadow-[0_4px_0_0_#fde68a]',
              },
              {
                title: 'Full Attendance Hero',
                role: '100% Kehadiran Konsisten',
                desc: 'Selalu hadir tepat waktu dan tidak pernah melewatkan satu sesi eskul pun.',
                badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                icon: '🛡️',
                accent: 'border-emerald-300 shadow-[0_4px_0_0_#a7f3d0]',
              },
              {
                title: 'Best Team Player',
                role: 'Kolaborasi & Icebreaker',
                desc: 'Mencairkan suasana kelompok dan membantu teman sekelas lebih percaya diri.',
                badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
                icon: '🤝',
                accent: 'border-purple-300 shadow-[0_4px_0_0_#d8b4fe]',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl bg-white border-2 ${card.accent} space-y-3 flex flex-col justify-between transition-all`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{card.icon}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${card.badgeColor}`}>
                      A21 Star
                    </span>
                  </div>
                  <h4 className="font-black text-base text-slate-900 leading-snug">{card.title}</h4>
                  <p className="text-[11px] font-black text-slate-600">{card.role}</p>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400">
                  <span>Dinilai Oleh: Kakak Mentor A20</span>
                  <span className="text-amber-500 font-extrabold">⭐ Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 6. BIG EVENTS CALENDAR ================= */}
      <section id="agenda" className="py-14 bg-white border-y-2 border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Program Kerja Ikonik EC SMEGA
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl">
                Kegiatan rutin tahunan English Club SMEGA di dalam dan luar sekolah.
              </p>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  handleOpenAddEvent();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-0.5 transition-all cursor-pointer w-fit shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Agenda Baru</span>
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {eventsList.map((ev) => {
              const theme = ev.accentColor === 'emerald'
                ? { hoverBorder: 'hover:border-emerald-400', tagBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                : ev.accentColor === 'indigo'
                ? { hoverBorder: 'hover:border-indigo-400', tagBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
                : ev.accentColor === 'amber'
                ? { hoverBorder: 'hover:border-amber-400', tagBadge: 'bg-amber-50 text-amber-700 border-amber-200' }
                : ev.accentColor === 'rose'
                ? { hoverBorder: 'hover:border-rose-400', tagBadge: 'bg-rose-50 text-rose-700 border-rose-200' }
                : ev.accentColor === 'purple'
                ? { hoverBorder: 'hover:border-purple-400', tagBadge: 'bg-purple-50 text-purple-700 border-purple-200' }
                : { hoverBorder: 'hover:border-blue-400', tagBadge: 'bg-blue-50 text-blue-700 border-blue-200' };

              return (
                <div 
                  key={ev.id} 
                  className={`relative p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 ${theme.hoverBorder} shadow-[0_4px_0_0_#e2e8f0] transition-all flex flex-col justify-between space-y-4 group`}
                >
                  {/* Super Admin Control Buttons */}
                  {isSuperAdmin && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur p-1 rounded-xl shadow-xs border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          handleEditEvent(ev);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Agenda"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          handleDeleteEvent(ev.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Agenda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <h3 className={`font-black text-base text-slate-900 leading-snug ${isSuperAdmin ? 'pr-14' : ''}`}>
                      {ev.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border w-fit ${theme.tagBadge}`}>
                    {ev.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 7. GALLERY & INSTAGRAM SHOWCASE ================= */}
      <section id="galeri" className="py-14 bg-slate-50 border-t-2 border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 via-pink-100 to-amber-100 border border-pink-200 text-pink-900 text-xs font-black">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Feed @englishclubsvhs1pbg</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Dokumentasi &amp; Momen Kegiatan
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl">
                Keseruan latihan speaking, fun games, outbond, dan agenda akbar English Club SMKN 1 Purbalingga. Klik postingan untuk melihat keseruan di aplikasi Instagram!
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    handleOpenAddGallery();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black border-2 border-blue-800 shadow-[0_3px_0_0_#1d4ed8] active:translate-y-0.5 transition-all cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Postingan / Momen</span>
                </button>
              )}

              <a
                href="https://www.instagram.com/englishclubsvhs1pbg/"
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playPop()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-black border-2 border-rose-800 shadow-[0_3px_0_0_#9f1239] active:translate-y-0.5 transition-all cursor-pointer min-h-[44px]"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow @englishclubsvhs1pbg</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Instagram Feed Grid (2 Cols on Mobile, 4 Cols on Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryList.map((item) => {
              const targetPostUrl = item.postUrl?.trim() || 'https://www.instagram.com/englishclubsvhs1pbg/';
              return (
                <div 
                  key={item.id} 
                  className="relative flex flex-col bg-white rounded-3xl border-2 border-slate-200 hover:border-slate-300 shadow-[0_4px_0_0_#e2e8f0] overflow-hidden group transition-all"
                >
                  {/* Super Admin Edit Controls */}
                  {isSuperAdmin && (
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          handleEditGallery(item);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Foto & Link IG"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          handleDeleteGallery(item.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Momen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Instagram-Style Post Header */}
                  <div className="p-3 flex items-center gap-2 border-b border-slate-100 bg-slate-50/50">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[1.5px] shrink-0">
                      <div className="w-full h-full rounded-full bg-white p-[1px] overflow-hidden">
                        <img src="/logo.png" alt="EC Logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <a 
                        href="https://www.instagram.com/englishclubsvhs1pbg/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[11px] font-black text-slate-800 hover:text-blue-600 truncate block leading-tight"
                      >
                        englishclubsvhs1pbg
                      </a>
                      <span className="text-[9px] font-bold text-slate-400 block truncate leading-tight">
                        SMK Negeri 1 Purbalingga
                      </span>
                    </div>
                    <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  </div>

                  {/* Photo Canvas */}
                  <a
                    href={targetPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => sound.playPop()}
                    className="block aspect-square w-full bg-slate-100 overflow-hidden relative group/img cursor-pointer"
                    title={`Buka postingan ${item.title} di Instagram`}
                  >
                    <img
                      src={item.imageUrl || '/logo.png'}
                      alt={item.title}
                      className={`w-full h-full ${(!item.imageUrl || item.imageUrl === '/logo.png') ? 'object-contain p-6' : 'object-cover'} transition-transform duration-500 group-hover/img:scale-105`}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/logo.png';
                        img.className = 'w-full h-full object-contain p-6 transition-transform duration-500 group-hover/img:scale-105';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-black/75 text-white text-[10px] font-black backdrop-blur-sm flex items-center gap-1">
                        <Instagram className="w-3 h-3 text-pink-400" />
                        <span>Lihat di IG ↗</span>
                      </span>
                    </div>
                  </a>

                  {/* Caption & Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2">
                        {item.subtitle}
                      </p>
                      <span className="text-[10px] font-black text-blue-600 block pt-0.5">
                        #ECSMEGA #EnglishClub
                      </span>
                    </div>

                    {/* Direct Instagram Action Button */}
                    <a
                      href={targetPostUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => sound.playPop()}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-pink-700 text-slate-700 border-2 border-slate-200 hover:border-pink-300 text-[11px] font-black transition-all active:translate-y-0.5 cursor-pointer"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-600" />
                      <span>Buka di Instagram</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-pink-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 7B. FAQ ACCORDION TAKTIL ================= */}
      <section id="faq" className="py-14 bg-white border-t-2 border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-black">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Tanya Jawab Santai Seputar Eskul</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Pertanyaan yang Sering Ditanyakan
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-lg mx-auto">
              Jawaban lengkap dan transparan untuk pertanyaan-pertanyaan yang paling sering dipikirkan adik kelas.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border-2 transition-all overflow-hidden ${
                    isOpen
                      ? 'bg-slate-50 border-blue-400 shadow-[0_3px_0_0_#93c5fd]'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                      {item.q}
                    </span>
                    <div
                      className={`p-1.5 rounded-xl border transition-transform duration-300 shrink-0 ${
                        isOpen
                          ? 'bg-blue-600 text-white border-blue-700 rotate-180'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm font-bold text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 8. FORM PENDAFTARAN ONLINE ================= */}
      <section id="daftar" className="py-16 bg-white border-t-2 border-slate-200">
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pendaftaran Anggota Baru
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              Isi formulir singkat di bawah ini untuk bergabung dengan English Club SMEGA!
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
                    placeholder="Contoh: Chandra Darmawan Jhon"
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
                      placeholder="Contoh: XI RPL 2"
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

      {/* ================= MODAL EDIT/TAMBAH AGENDA BESAR ================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-300 shadow-[0_8px_0_0_#94a3b8] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">
                  {editingEvent ? 'Edit Agenda Besar' : 'Tambah Agenda Besar'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Nama Agenda / Acara</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Contoh: English Camp & Outbond"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 font-bold text-xs outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Kategori / Tag Singkat</label>
                <input
                  type="text"
                  required
                  value={eventForm.tag}
                  onChange={(e) => setEventForm({ ...eventForm, tag: e.target.value })}
                  placeholder="Contoh: Outbond & Keakraban Alam"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 font-bold text-xs outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Deskripsi Singkat</label>
                <textarea
                  required
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Contoh: Kemah seru di alam terbuka untuk melatih kepemimpinan, team building, dan praktik percakapan bahasa Inggris dalam suasana santai."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 font-bold text-xs outline-hidden transition-all resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Warna Aksen Kartu</label>
                <select
                  value={eventForm.accentColor}
                  onChange={(e) => setEventForm({ ...eventForm, accentColor: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-xs outline-hidden"
                >
                  <option value="blue">Biru (Utama)</option>
                  <option value="emerald">Hijau (Alam / Camp)</option>
                  <option value="indigo">Indigo (Resmi / Sakral)</option>
                  <option value="amber">Kuning / Emas (Ulang Tahun)</option>
                  <option value="rose">Merah Muda (Kreatif)</option>
                  <option value="purple">Ungu (Prestisius)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-[0_2px_0_0_#b45309] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT/TAMBAH FOTO GALERI ================= */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-300 shadow-[0_8px_0_0_#94a3b8] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">
                  {editingGallery ? 'Edit Momen / Foto' : 'Tambah Momen / Foto'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Judul Momen</label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="Contoh: Speaking & Speech"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 font-bold text-xs outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Keterangan / Subteks</label>
                <input
                  type="text"
                  required
                  value={galleryForm.subtitle}
                  onChange={(e) => setGalleryForm({ ...galleryForm, subtitle: e.target.value })}
                  placeholder="Contoh: Agenda Rutin Rabu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 font-bold text-xs outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">URL Foto (Link Gambar Nyata)</label>
                <input
                  type="url"
                  value={galleryForm.imageUrl}
                  onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                  placeholder="https://... (Link foto Google Drive / Imgur / Supabase)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 font-bold text-xs outline-hidden transition-all"
                />
                <p className="text-[10px] font-bold text-slate-400">
                  Kosongkan jika ingin menggunakan ikon placeholder gradien.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Link Postingan Instagram (URL)</label>
                <input
                  type="url"
                  value={galleryForm.postUrl || ''}
                  onChange={(e) => setGalleryForm({ ...galleryForm, postUrl: e.target.value })}
                  placeholder="https://www.instagram.com/p/... (Opsional)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 font-bold text-xs outline-hidden transition-all"
                />
                <p className="text-[10px] font-bold text-slate-400">
                  Pengunjung yang mengklik tombol akan langsung diarahkan ke postingan Instagram ini.
                </p>
              </div>

              {galleryForm.imageUrl && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500">Pratinjau Gambar:</span>
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img 
                      src={galleryForm.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-[0_2px_0_0_#1d4ed8] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tactile Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-2xl max-w-sm w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🗑️</span>
                <h3 className="font-black text-slate-900 text-base">
                  {deleteTarget.type === 'event' ? 'Hapus Agenda' : 'Hapus Momen Foto'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <p className="font-bold">
                Apakah kamu yakin ingin menghapus <span className="font-black">"{deleteTarget.title}"</span>?
              </p>
              <p className="text-[11px] text-rose-800/80">
                Tindakan ini permanen dan akan langsung diperbarui di portal publik.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-[0_3px_0_0_#9f1239] active:translate-y-0.5 transition-all cursor-pointer"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
