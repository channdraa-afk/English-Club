import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sliders, 
  FileSpreadsheet, 
  Users, 
  Sparkles, 
  UserPlus, 
  Award, 
  LogOut, 
  ArrowLeft, 
  Crown, 
  ShieldAlert, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Layers,
  HeartHandshake,
  Star,
  Database,
  UserCog,
  Gamepad2,
  FileText,
  KeyRound,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { Member, Meeting, Attendance, Registration, TalentStar } from '../../types/database';
import { MeetingControl } from './MeetingControl';
import { ReportRecap } from './ReportRecap';
import { MentorAttendance } from './MentorAttendance';
import { LiveMonitorA21 } from './LiveMonitorA21';
import { TalentScoutA21 } from './TalentScoutA21';
import { AgendaVault } from './AgendaVault';
import { RegistrationApprovals } from './RegistrationApprovals';
import { StructureView } from './StructureView';
import { MentorDisciplineRadar } from './MentorDisciplineRadar';
import { SuperAdminModal } from './SuperAdminModal';
import { DataVault } from './DataVault';
import { MemberRosterManager } from './MemberRosterManager';
import { QuizManager } from './QuizManager';
import { sound } from '../../lib/audio';
import { safeStorage } from '../../lib/storage';
import { supabase } from '../../lib/supabase';
import { TactileButton } from '../TactileButton';

const AdminDocGenerator = React.lazy(() =>
  import('./AdminDocGenerator').then((m) => ({ default: m.AdminDocGenerator }))
);

export type TabId = 
  | 'session'
  | 'quiz'
  | 'roster_manager'
  | 'approvals'
  | 'data_vault'
  | 'live_monitor'
  | 'talent_scout'
  | 'helper_a21'
  | 'recap'
  | 'agenda_a21'
  | 'mentor_attendance'
  | 'agenda_a20'
  | 'radar'
  | 'structure'
  | 'admin_docs';

export const TAB_CONFIG: Record<TabId, { category: 'general' | 'a21' | 'a20'; superOnly?: boolean }> = {
  // General (Super Admin)
  session: { category: 'general', superOnly: true },
  roster_manager: { category: 'general', superOnly: true },
  approvals: { category: 'general', superOnly: true },
  data_vault: { category: 'general', superOnly: true },

  // A21 (Adik Kelas)
  quiz: { category: 'a21', superOnly: false },
  live_monitor: { category: 'a21', superOnly: false },
  talent_scout: { category: 'a21', superOnly: false },
  helper_a21: { category: 'a21', superOnly: false },
  recap: { category: 'a21', superOnly: false },
  agenda_a21: { category: 'a21', superOnly: false },

  // A20 (Pengurus)
  admin_docs: { category: 'a20', superOnly: false },
  mentor_attendance: { category: 'a20', superOnly: false },
  radar: { category: 'a20', superOnly: false },
  structure: { category: 'a20', superOnly: false },
  agenda_a20: { category: 'a20', superOnly: true },
};

export const getTabCategory = (tab: TabId): 'general' | 'a21' | 'a20' => {
  return TAB_CONFIG[tab]?.category || 'a21';
};

interface MentorDashboardProps {
  members: Member[];
  meetings: Meeting[];
  attendances: Attendance[];
  activeMeeting: Meeting | null;
  registrations: Registration[];
  isRegistrationOpen: boolean;
  currentPin: string;
  mentorToken: string;
  onMentorTokenUpdated: (tok: string) => void;
  isManualBypass: boolean;
  onToggleManualBypass: (state: boolean) => void;
  isSuperAdmin: boolean;
  onSuperAdminUnlock: (sig?: string) => void;
  onSuperAdminLock: () => void;
  onMeetingUpdated: () => void;
  onToggleRegistration: (state: boolean) => void;
  onPinUpdated: (pin: string) => void;
  onAttendanceChanged: () => void;
  onRefreshRegistrations: () => void;
  onMemberAdded: () => void;
  onQuizSessionChanged?: (session: any) => void;
  talentStars?: TalentStar[];
  onAddTalentStar?: (star: Omit<TalentStar, 'id' | 'created_at'>) => Promise<void>;
  onRemoveTalentStar?: (starId: string) => Promise<void>;
  isSandboxActive?: boolean;
  onLogout: () => void;
  onBackToStudent: () => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({
  members,
  meetings,
  attendances,
  activeMeeting,
  registrations,
  isRegistrationOpen,
  currentPin,
  mentorToken,
  onMentorTokenUpdated,
  isManualBypass,
  onToggleManualBypass,
  isSuperAdmin,
  onSuperAdminUnlock,
  onSuperAdminLock,
  onMeetingUpdated,
  onToggleRegistration,
  onPinUpdated,
  onAttendanceChanged,
  onRefreshRegistrations,
  onMemberAdded,
  onQuizSessionChanged,
  talentStars,
  onAddTalentStar,
  onRemoveTalentStar,
  isSandboxActive = false,
  onLogout,
  onBackToStudent,
}) => {
  const [activeTab, setActiveTabState] = useState<TabId>(() => {
    const saved = safeStorage.get('ec_active_tab', 'session') as TabId | null;
    const allowedRegular: TabId[] = (Object.keys(TAB_CONFIG) as TabId[]).filter(
      (k) => !TAB_CONFIG[k].superOnly
    );
    if (saved) {
      if ((saved as any) === 'agenda') return 'agenda_a21';
      if ((saved as any) === 'helper_a21') return 'live_monitor';
      if (isSuperAdmin || allowedRegular.includes(saved)) {
        return saved;
      }
    }
    return isSuperAdmin ? 'session' : 'mentor_attendance';
  });

  const [currentCategory, setCurrentCategory] = useState<'general' | 'a21' | 'a20' | 'all'>(() => {
    return isSuperAdmin ? 'general' : 'a20';
  });

  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab);
    safeStorage.set('ec_active_tab', tab, 'session');
    const tabCat = getTabCategory(tab);
    if (currentCategory !== 'all' && currentCategory !== tabCat) {
      setCurrentCategory(tabCat);
    }
  };

  const [isSuperModalOpen, setIsSuperModalOpen] = useState(false);
  const [headerTapCount, setHeaderTapCount] = useState(0);
  const [copiedTokenNotice, setCopiedTokenNotice] = useState<string | null>(null);

  const isHananBugHunter = useMemo(() => {
    return (
      safeStorage.get('ec_is_bughunter') === 'true' ||
      safeStorage.get('ec_saved_mentor_id') === '4cb5bc39-23ac-4402-a389-a777842cd36f'
    );
  }, []);

  // Hanan Bug Hunter Change PIN State (Session-bound post-login)
  const [isHananChangePinOpen, setIsHananChangePinOpen] = useState(false);
  const [hananOldPin, setHananOldPin] = useState('');
  const [hananNewPin, setHananNewPin] = useState('');
  const [hananPinError, setHananPinError] = useState<string | null>(null);
  const [hananPinSuccess, setHananPinSuccess] = useState(false);
  const [isUpdatingHananPin, setIsUpdatingHananPin] = useState(false);

  const handleUpdateHananPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hananOldPin.trim() || !hananNewPin.trim() || isUpdatingHananPin) return;
    setHananPinError(null);
    setIsUpdatingHananPin(true);

    try {
      const { data: isUpdated, error: rpcErr } = await supabase.rpc('update_hanan_pin', {
        current_pin: hananOldPin.trim().toLowerCase(),
        new_pin: hananNewPin.trim().toLowerCase(),
      });

      if (rpcErr) throw rpcErr;

      if (isUpdated) {
        sound.playSuccess();
        setHananPinSuccess(true);
        setTimeout(() => {
          setIsHananChangePinOpen(false);
          setHananPinSuccess(false);
          setHananOldPin('');
          setHananNewPin('');
        }, 1500);
      } else {
        sound.playError();
        setHananPinError('PIN saat ini salah atau PIN baru terlalu pendek (min. 3 karakter)!');
      }
    } catch (err: any) {
      sound.playError();
      setHananPinError('Gagal mengubah PIN: ' + (err.message || 'Error'));
    } finally {
      setIsUpdatingHananPin(false);
    }
  };

  const handleSecretHeaderTap = () => {
    if (isSuperAdmin) return;
    sound.playPop();
    const next = headerTapCount + 1;
    if (next >= 3) {
      setHeaderTapCount(0);
      setIsSuperModalOpen(true);
    } else {
      setHeaderTapCount(next);
      setTimeout(() => setHeaderTapCount(0), 2500);
    }
  };

  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Coherence & safety guard: keep activeTab aligned with permissions and active category
  useEffect(() => {
    if (!isSuperAdmin && TAB_CONFIG[activeTab]?.superOnly) {
      setActiveTab('live_monitor');
      return;
    }
    if (currentCategory !== 'all') {
      const tabCat = getTabCategory(activeTab);
      if (tabCat !== currentCategory) {
        if (currentCategory === 'a21') setActiveTab('live_monitor');
        else if (currentCategory === 'a20') setActiveTab('mentor_attendance');
        else if (currentCategory === 'general') setActiveTab(isSuperAdmin ? 'session' : 'live_monitor');
      }
    }
  }, [isSuperAdmin, activeTab, currentCategory]);

  const pendingRegsCount = registrations.filter((r) => r.status === 'pending').length;

  const officialMeetings = useMemo(() => {
    return meetings.filter(
      (m) => m.token !== 'COBA' && !m.title?.includes('[UJI COBA]')
    );
  }, [meetings]);

  interface TabItem {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    category: 'general' | 'a21' | 'a20';
    superOnly: boolean;
  }

  const allTabs: TabItem[] = [
    // --- 🌐 UMUM (SISTEM & PUSAT) ---
    { id: 'session', label: 'Kontrol Sesi & Token', icon: Sliders, category: 'general', superOnly: true },
    { id: 'roster_manager', label: 'Kelola Master Siswa', icon: UserCog, category: 'general', superOnly: true },
    { id: 'approvals', label: 'Verifikasi Calon Anggota (ACC)', icon: UserPlus, badge: pendingRegsCount, category: 'general', superOnly: true },
    { id: 'data_vault', label: 'Brankas Reset & Backup', icon: Database, category: 'general', superOnly: true },

    // --- 🎒 OPERASIONAL A21 (ADIK KELAS) ---
    { id: 'live_monitor', label: 'Pantau & Bantu Absen Adik', icon: Radio, category: 'a21', superOnly: false },
    { id: 'quiz', label: 'Kuis EC Arena', icon: Gamepad2, category: 'a21', superOnly: false },
    { id: 'talent_scout', label: 'Penilaian Bakat Lomba', icon: Star, category: 'a21', superOnly: false },
    { id: 'recap', label: 'Buku Rapor (Sekretaris)', icon: FileSpreadsheet, category: 'a21', superOnly: false },
    { id: 'agenda_a21', label: 'Kotak Saran Adik', icon: Sparkles, category: 'a21', superOnly: false },

    // --- 🛡️ INTERNAL A20 (PENGURUS) ---
    { id: 'mentor_attendance', label: 'Presensi Pengurus', icon: Users, category: 'a20', superOnly: false },
    { id: 'admin_docs', label: 'Surat Peminjaman (.docx)', icon: FileText, category: 'a20', superOnly: false },
    { id: 'radar', label: 'Kehadiran Pengurus (Kedis)', icon: ShieldAlert, category: 'a20', superOnly: false },
    { id: 'structure', label: 'Struktur Pengurus A20', icon: Award, category: 'a20', superOnly: false },
    { id: 'agenda_a20', label: 'Curhat Internal A20', icon: HeartHandshake, category: 'a20', superOnly: true },
  ];

  // Filter tabs for display
  const visibleTabs = allTabs.filter((t) => {
    if (!isSuperAdmin && t.superOnly) {
      return false;
    }
    if (currentCategory === 'all') return true;
    return t.category === currentCategory;
  });

  const [hasOverflow, setHasOverflow] = useState(false);

  // Horizontal mouse-wheel scroll translation & overflow detector
  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setHasOverflow(el.scrollWidth > el.clientWidth + 4);
    };

    checkOverflow();

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', checkOverflow);

    return () => {
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [visibleTabs]);

  // Smooth scroll helper for tab navigation buttons
  const handleScrollTabs = (direction: 'left' | 'right') => {
    sound.playPop();
    if (tabsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
      {/* Top Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              sound.playPop();
              onBackToStudent();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
            title="Kembali ke Presensi Siswa"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div 
            onClick={handleSecretHeaderTap}
            className="min-w-0 cursor-pointer select-none"
            title={isSuperAdmin ? undefined : 'Portal Pengurus EC SMEGA'}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                {isSuperAdmin ? 'Pusat Komando Super Admin' : 'Portal Pengurus EC SMEGA'}
              </h2>
              {isSuperAdmin && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black shrink-0">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>Chandra</span>
                </span>
              )}
              {isHananBugHunter && !isSuperAdmin && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-black shrink-0">
                  <span>🐞</span>
                  <span>Hanan • Bug Hunter</span>
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">
              {isSuperAdmin
                ? 'Kendali Penuh Seluruh Angkatan & Sistem'
                : isHananBugHunter
                ? 'Hak Istimewa Chief of Speaking & Lead Bug Hunter'
                : 'Menu Khusus Angkatan 20 (Presensi & Struktur)'}
            </p>
          </div>
        </div>

        {/* Action Controls - Kunci Admin (khusus Super Admin) & Logout */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSuperAdmin && (
            <button
              onClick={() => {
                sound.playPop();
                onSuperAdminLock();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black transition-colors cursor-pointer"
              title="Kunci Akses Super Admin"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Kunci Admin</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playPop();
              onLogout();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 🐞 LIVE TOKEN INSPECTOR KHUSUS HANAN (READ-ONLY) */}
      {isHananBugHunter && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white border-2 border-indigo-500 shadow-[0_6px_0_0_#3730a3] space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-700/50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐞</span>
              <div>
                <h3 className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-1.5">
                  <span>Token Hari Ini (Bug Hunter Read-Only Inspector)</span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-500/40 border border-indigo-400/50 text-indigo-200">
                    Live SSOT
                  </span>
                </h3>
                <p className="text-[10px] text-indigo-200/80 font-bold">
                  Hak istimewa inspeksi token untuk Hanan Aditya Zahid (Ketua Divisi Speaking &amp; Lead Bug Hunter)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIsHananChangePinOpen(true);
                  setHananPinError(null);
                  setHananPinSuccess(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black border border-indigo-400 active:translate-y-0.5 transition-all cursor-pointer shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-200" />
                <span>Ganti PIN Bug Hunter</span>
              </button>
              <span className="text-[10px] font-black text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-xl w-fit">
                🔒 Read-Only (Non-Editable)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Token Adik Kelas */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">
                  1. Token Adik Kelas (A21)
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white">
                  {activeMeeting?.token || 'BELUM DIATUR'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  navigator.clipboard.writeText(activeMeeting?.token || '');
                  setCopiedTokenNotice('Token Adik Kelas berhasil disalin!');
                  setTimeout(() => setCopiedTokenNotice(null), 2500);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black border border-indigo-400 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
              >
                Salin 📋
              </button>
            </div>

            {/* Token Pengurus A20 */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                  2. Token Pengurus (A20)
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-amber-300">
                  {activeMeeting?.mentor_token || mentorToken || 'BELUM DIATUR'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  const tok = activeMeeting?.mentor_token || mentorToken || '';
                  navigator.clipboard.writeText(tok);
                  setCopiedTokenNotice('Token Pengurus A20 berhasil disalin!');
                  setTimeout(() => setCopiedTokenNotice(null), 2500);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black border border-amber-600 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
              >
                Salin 📋
              </button>
            </div>
          </div>

          {copiedTokenNotice && (
            <p className="text-[11px] font-black text-emerald-300 text-center animate-fade-in">
              ✓ {copiedTokenNotice}
            </p>
          )}
        </div>
      )}

      {/* 🚀 QUICK-ACTION HUB (3 AKSES UTAMA PENGURUS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Presensi Pengurus */}
        <button
          onClick={() => {
            sound.playPop();
            setCurrentCategory('a20');
            setActiveTab('mentor_attendance');
          }}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all active:translate-y-1 cursor-pointer ${
            activeTab === 'mentor_attendance'
              ? 'bg-indigo-50 border-indigo-500 shadow-[0_2px_0_0_#6366f1]'
              : 'bg-white border-indigo-100 hover:border-indigo-300 shadow-[0_4px_0_0_#e0e7ff] hover:bg-indigo-50/40'
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800">Presensi Pengurus</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-100 text-indigo-700">Wajib</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 truncate">Absen kehadiranmu tiap eskul</p>
          </div>
        </button>

        {/* 2. Pantau & Bantu Absen Adik */}
        <button
          onClick={() => {
            sound.playPop();
            setCurrentCategory('a21');
            setActiveTab('live_monitor');
          }}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all active:translate-y-1 cursor-pointer ${
            activeTab === 'live_monitor' || activeTab === 'helper_a21'
              ? 'bg-emerald-50 border-emerald-500 shadow-[0_2px_0_0_#10b981]'
              : 'bg-white border-emerald-100 hover:border-emerald-300 shadow-[0_4px_0_0_#d1fae5] hover:bg-emerald-50/40'
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Radio className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800">Pantau & Bantu Adik</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-700">Aktif</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 truncate">Live presensi & input surat izin</p>
          </div>
        </button>

        {/* 3. Kotak Saran Adik (Evaluasi) */}
        <button
          onClick={() => {
            sound.playPop();
            setCurrentCategory('a21');
            setActiveTab('agenda_a21');
          }}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all active:translate-y-1 cursor-pointer ${
            activeTab === 'agenda_a21'
              ? 'bg-amber-50 border-amber-500 shadow-[0_2px_0_0_#f59e0b]'
              : 'bg-white border-amber-100 hover:border-amber-300 shadow-[0_4px_0_0_#fef3c7] hover:bg-amber-50/40'
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800">Kotak Saran Adik</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800">Evaluasi</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 truncate">Cek respon & curhat materi eskul</p>
          </div>
        </button>
      </div>

      {/* Smart Category Switcher (Available to ALL Mentors & SuperAdmin) */}
      <div className="flex items-center justify-between gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 flex-1">
          {/* 1. UMUM (SISTEM & PUSAT - KHUSUS SUPER ADMIN) */}
          {isSuperAdmin && (
            <button
              onClick={() => {
                sound.playPop();
                setCurrentCategory('general');
                if (getTabCategory(activeTab) !== 'general') {
                  setActiveTab('session');
                }
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                currentCategory === 'general'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              🌐 Umum
            </button>
          )}

          {/* 2. OPERASIONAL A21 (ADIK KELAS) */}
          <button
            onClick={() => {
              sound.playPop();
              setCurrentCategory('a21');
              if (getTabCategory(activeTab) !== 'a21') {
                setActiveTab('live_monitor');
              }
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              currentCategory === 'a21'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span className="hidden sm:inline">🎒 Operasional A21 (Adik Kelas)</span>
            <span className="sm:hidden">🎒 A21 (Adik)</span>
          </button>

          {/* 3. INTERNAL A20 (PENGURUS) */}
          <button
            onClick={() => {
              sound.playPop();
              setCurrentCategory('a20');
              if (getTabCategory(activeTab) !== 'a20') {
                setActiveTab('mentor_attendance');
              }
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              currentCategory === 'a20'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span className="hidden sm:inline">🛡️ Internal A20 (Pengurus)</span>
            <span className="sm:hidden">🛡️ A20 (Pengurus)</span>
          </button>

          {/* 4. SEMUA */}
          <button
            onClick={() => {
              sound.playPop();
              setCurrentCategory('all');
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              currentCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
            }`}
            title="Tampilkan Semua Tab"
          >
            <Layers className="w-3.5 h-3.5 inline mr-1" />
            Semua
          </button>
        </div>
      </div>

      {/* Tabs Menu with Tactile Arrow Navigation Buttons */}
      <div className="relative flex items-center gap-1.5">
        {/* Left Arrow Button */}
        {hasOverflow && (
          <button
            onClick={() => handleScrollTabs('left')}
            className="p-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200 shadow-[0_2px_0_0_#cbd5e1] shrink-0 active:translate-y-0.5 transition-all"
            title="Geser Tab ke Kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable / Grid Tabs Container */}
        <div
          ref={tabsScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 justify-start px-0.5"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playPop();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-75 select-none cursor-pointer border-2 ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-800 shadow-[0_3px_0_0_#1e3a8a] translate-y-0'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-[0_3px_0_0_#e2e8f0] active:translate-y-0.5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {hasOverflow && (
          <button
            onClick={() => handleScrollTabs('right')}
            className="p-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200 shadow-[0_2px_0_0_#cbd5e1] shrink-0 active:translate-y-0.5 transition-all"
            title="Geser Tab ke Kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Tab Views */}
      {/* Live Monitor & Bantu Absen A21 (Unified Cockpit - Accessible by ALL Mentors & SuperAdmin) */}
      {(activeTab === 'live_monitor' || activeTab === 'helper_a21') && (
        <LiveMonitorA21
          members={members}
          activeMeeting={activeMeeting}
          attendances={attendances}
          talentStars={talentStars}
          meetings={officialMeetings}
          onAttendanceChanged={onAttendanceChanged}
        />
      )}

      {/* Radar Bibit Lomba A21 (Accessible by ALL Mentors & SuperAdmin) */}
      {activeTab === 'talent_scout' && onAddTalentStar && onRemoveTalentStar && (
        <TalentScoutA21
          members={members}
          meetings={officialMeetings}
          talentStars={talentStars || []}
          onAddStar={onAddTalentStar}
          onRemoveStar={onRemoveTalentStar}
          activeMeeting={activeMeeting}
        />
      )}

      {/* Sesi & Token Control */}
      {activeTab === 'session' && isSuperAdmin && (
        <MeetingControl
          activeMeeting={activeMeeting}
          meetings={meetings}
          mentorToken={mentorToken}
          onMentorTokenUpdated={onMentorTokenUpdated}
          isManualBypass={isManualBypass}
          onToggleManualBypass={onToggleManualBypass}
          onMeetingUpdated={onMeetingUpdated}
          isRegistrationOpen={isRegistrationOpen}
          onToggleRegistration={onToggleRegistration}
          currentPin={currentPin}
          onPinUpdated={onPinUpdated}
          onAttendanceChanged={onAttendanceChanged}
        />
      )}

      {/* EC Arena Kuis Live Multi-Ruangan (Accessible by ALL Mentors) */}
      {activeTab === 'quiz' && (
        <QuizManager
          activeMeetingId={activeMeeting?.id}
          onAwardTalentStar={onAddTalentStar}
          totalA21Count={members.filter((m) => m.generation === 21 && m.status === 'active').length || 99}
          onSessionChanged={onQuizSessionChanged}
        />
      )}

      {/* Rekap Rapor Bulanan (Accessible by ALL Mentors & SuperAdmin) */}
      {activeTab === 'recap' && (
        <ReportRecap
          members={members}
          meetings={officialMeetings}
          attendances={attendances}
          activeMeeting={activeMeeting}
          isSuperAdmin={isSuperAdmin}
          onAttendanceChanged={onAttendanceChanged}
          talentStars={talentStars}
        />
      )}

      {/* Radar & Rekap Presensi Pengurus A20 (Accessible by Kedis & ALL Mentors) */}
      {activeTab === 'radar' && (
        <MentorDisciplineRadar
          members={members}
          meetings={officialMeetings}
          attendances={attendances}
          isSuperAdmin={isSuperAdmin}
          onAttendanceChanged={onAttendanceChanged}
        />
      )}

      {/* Presensi Mandiri Pengurus A20 */}
      {activeTab === 'mentor_attendance' && (
        <MentorAttendance
          members={members}
          activeMeeting={activeMeeting}
          meetings={officialMeetings}
          attendances={attendances}
          isManualBypass={isManualBypass}
          isSuperAdmin={isSuperAdmin}
          onAttendanceChanged={onAttendanceChanged}
        />
      )}

      {/* Suara & Masukan Adik Kelas (Accessible by ALL Mentors & SuperAdmin) */}
      {activeTab === 'agenda_a21' && (
        <AgendaVault
          attendances={attendances}
          members={members}
          activeMeeting={activeMeeting}
          meetings={officialMeetings}
          isSuperAdmin={isSuperAdmin}
          initialGroup="a21"
          lockGroup={true}
        />
      )}

      {/* Curhat & Evaluasi Pengurus A20 (Strictly Super Admin Only) */}
      {activeTab === 'agenda_a20' && isSuperAdmin && (
        <AgendaVault
          attendances={attendances}
          members={members}
          activeMeeting={activeMeeting}
          meetings={officialMeetings}
          isSuperAdmin={isSuperAdmin}
          initialGroup="a20"
          lockGroup={true}
        />
      )}

      {/* Kelola Master Anggota & Mutasi Siswa (Strictly Super Admin Only) */}
      {activeTab === 'roster_manager' && isSuperAdmin && (
        <MemberRosterManager
          members={members}
          attendances={attendances}
          onMemberMutated={() => {
            onMemberAdded();
            onAttendanceChanged();
          }}
        />
      )}

      {/* ACC Anggota Baru */}
      {activeTab === 'approvals' && isSuperAdmin && (
        <RegistrationApprovals
          registrations={registrations}
          members={members}
          onRefreshRegistrations={onRefreshRegistrations}
          onMemberAdded={onMemberAdded}
        />
      )}

      {/* Brankas Reset & Keamanan Data (Strictly Super Admin Only) */}
      {activeTab === 'data_vault' && isSuperAdmin && (
        <DataVault
          activeMeeting={activeMeeting}
          attendances={attendances}
          registrations={registrations}
          members={members}
          isSandboxActive={isSandboxActive}
          onDataChanged={onAttendanceChanged}
        />
      )}

      {/* Struktur Pengurus A20 */}
      {activeTab === 'structure' && (
        <StructureView 
          members={members} 
          isSuperAdmin={isSuperAdmin}
          onRequestSuperAdmin={() => setIsSuperModalOpen(true)}
        />
      )}

      {/* Generator Administrasi & Dokumen Resmi (.docx) */}
      {activeTab === 'admin_docs' && (
        <React.Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-slate-200 shadow-tactile text-slate-500 font-bold space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Memuat modul generator dokumen...</p>
            </div>
          }
        >
          <AdminDocGenerator
            members={members}
            meetings={officialMeetings}
            attendances={attendances}
          />
        </React.Suspense>
      )}

      {/* Hanan Bug Hunter Change PIN Modal (Session-bound) */}
      {isHananChangePinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-indigo-500 shadow-[0_10px_0_0_#3730a3] p-6 space-y-4">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setIsHananChangePinOpen(false);
                setHananPinError(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleUpdateHananPin} className="space-y-4 pt-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-100 text-indigo-700 border-2 border-indigo-300 flex items-center justify-center shadow-md">
                  <KeyRound className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                    Pengaturan Keamanan • Bug Hunter
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Ganti PIN Bug Hunter
                  </h3>
                  <p className="text-xs font-extrabold text-indigo-600">
                    Hanan Aditya Zahid (Ketua Divisi Speaking)
                  </p>
                </div>
              </div>

              {hananPinError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{hananPinError}</span>
                </div>
              )}

              {hananPinSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PIN Bug Hunter berhasil diperbarui! 🎉</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    PIN Saat Ini:
                  </label>
                  <input
                    type="password"
                    value={hananOldPin}
                    onChange={(e) => setHananOldPin(e.target.value)}
                    placeholder="Masukkan PIN saat ini..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    PIN Baru:
                  </label>
                  <input
                    type="password"
                    value={hananNewPin}
                    onChange={(e) => setHananNewPin(e.target.value)}
                    placeholder="PIN baru (min. 3 karakter)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setIsHananChangePinOpen(false);
                    setHananPinError(null);
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors"
                >
                  Batal
                </button>
                <TactileButton
                  type="submit"
                  disabled={isUpdatingHananPin || !hananOldPin.trim() || !hananNewPin.trim()}
                  variant="brand"
                  className="flex-1 py-2.5 text-xs font-black"
                >
                  <span>{isUpdatingHananPin ? 'Menyimpan...' : 'Simpan PIN'}</span>
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Secret Modal */}
      <SuperAdminModal
        isOpen={isSuperModalOpen}
        onClose={() => setIsSuperModalOpen(false)}
        onSuccess={(sig) => {
          onSuperAdminUnlock(sig);
          setCurrentCategory('general');
          setActiveTab('session');
        }}
      />
    </div>
  );
};
