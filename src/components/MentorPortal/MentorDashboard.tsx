import React, { useState, useEffect, useRef } from 'react';
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
  HandHeart, 
  Radio, 
  Layers,
  HeartHandshake,
  Star
} from 'lucide-react';
import { Member, Meeting, Attendance, Registration, TalentStar } from '../../types/database';
import { MeetingControl } from './MeetingControl';
import { ReportRecap } from './ReportRecap';
import { MentorAttendance } from './MentorAttendance';
import { HelperAttendanceA21 } from './HelperAttendanceA21';
import { LiveMonitorA21 } from './LiveMonitorA21';
import { TalentScoutA21 } from './TalentScoutA21';
import { AgendaVault } from './AgendaVault';
import { RegistrationApprovals } from './RegistrationApprovals';
import { StructureView } from './StructureView';
import { MentorDisciplineRadar } from './MentorDisciplineRadar';
import { SuperAdminModal } from './SuperAdminModal';
import { sound } from '../../lib/audio';

export type TabId = 
  | 'session'
  | 'approvals'
  | 'live_monitor'
  | 'talent_scout'
  | 'helper_a21'
  | 'recap'
  | 'agenda_a21'
  | 'mentor_attendance'
  | 'agenda_a20'
  | 'radar'
  | 'structure';

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
  talentStars?: TalentStar[];
  onAddTalentStar?: (star: Omit<TalentStar, 'id' | 'created_at'>) => Promise<void>;
  onRemoveTalentStar?: (starId: string) => Promise<void>;
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
  talentStars = [],
  onAddTalentStar,
  onRemoveTalentStar,
  onLogout,
  onBackToStudent,
}) => {
  const [activeTab, setActiveTabState] = useState<TabId>(() => {
    const saved = sessionStorage.getItem('ec_active_tab') as TabId | null;
    const allowedRegular: TabId[] = [
      'mentor_attendance',
      'radar',
      'live_monitor',
      'talent_scout',
      'helper_a21',
      'recap',
      'agenda_a21',
      'structure'
    ];
    if (saved) {
      if ((saved as any) === 'agenda') return 'agenda_a21';
      if (isSuperAdmin || allowedRegular.includes(saved)) {
        return saved;
      }
    }
    return isSuperAdmin ? 'session' : 'mentor_attendance';
  });

  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab);
    sessionStorage.setItem('ec_active_tab', tab);
  };

  const [currentCategory, setCurrentCategory] = useState<'general' | 'a21' | 'a20' | 'all'>(
    isSuperAdmin ? 'general' : 'a21'
  );
  const [isSuperModalOpen, setIsSuperModalOpen] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Safety fallback if regular mentor tries to stay on a super-admin tab
  useEffect(() => {
    const allowedRegular: TabId[] = [
      'mentor_attendance',
      'radar',
      'live_monitor',
      'talent_scout',
      'helper_a21',
      'recap',
      'agenda_a21',
      'structure'
    ];
    if (!isSuperAdmin && !allowedRegular.includes(activeTab)) {
      setActiveTab('mentor_attendance');
    }
  }, [isSuperAdmin, activeTab]);

  const pendingRegsCount = registrations.filter((r) => r.status === 'pending').length;

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
    { id: 'approvals', label: 'ACC Anggota Baru', icon: UserPlus, badge: pendingRegsCount, category: 'general', superOnly: true },

    // --- 🎒 OPERASIONAL A21 (ADIK KELAS) ---
    { id: 'live_monitor', label: 'Monitor Live A21', icon: Radio, category: 'a21', superOnly: false },
    { id: 'talent_scout', label: 'Radar Bibit Lomba', icon: Star, category: 'a21', superOnly: false },
    { id: 'helper_a21', label: 'Bantu Absen A21', icon: HandHeart, category: 'a21', superOnly: false },
    { id: 'recap', label: 'Rekap Rapor Bulanan', icon: FileSpreadsheet, category: 'a21', superOnly: false },
    { id: 'agenda_a21', label: 'Suara & Masukan Adik', icon: Sparkles, category: 'a21', superOnly: false },

    // --- 🛡️ INTERNAL A20 (PENGURUS) ---
    { id: 'mentor_attendance', label: 'Presensi Mandiri A20', icon: Users, category: 'a20', superOnly: false },
    { id: 'radar', label: 'Radar & Rekap Presensi A20', icon: ShieldAlert, category: 'a20', superOnly: false },
    { id: 'structure', label: 'Struktur Pengurus A20', icon: Award, category: 'a20', superOnly: false },
    { id: 'agenda_a20', label: 'Curhat & Evaluasi A20', icon: HeartHandshake, category: 'a20', superOnly: true },
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
          <div className="min-w-0">
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
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">
              {isSuperAdmin ? 'Kendali Penuh Seluruh Angkatan & Sistem' : 'Menu Khusus Angkatan 20 (Presensi & Struktur)'}
            </p>
          </div>
        </div>

        {/* Action Controls - Note: Akses Ketua button completely hidden for regular mentors */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSuperAdmin && (
            <button
              onClick={() => {
                sound.playPop();
                onSuperAdminLock();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black transition-colors"
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
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
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
                if (activeTab !== 'session' && activeTab !== 'approvals') {
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
              const a21TabIds: TabId[] = ['live_monitor', 'talent_scout', 'helper_a21', 'recap', 'agenda_a21'];
              if (!a21TabIds.includes(activeTab)) {
                setActiveTab('live_monitor');
              }
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              currentCategory === 'a21'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            🎒 Operasional A21 (Adik Kelas)
          </button>

          {/* 3. INTERNAL A20 (PENGURUS) */}
          <button
            onClick={() => {
              sound.playPop();
              setCurrentCategory('a20');
              const a20TabIds: TabId[] = ['mentor_attendance', 'radar', 'structure', 'agenda_a20'];
              if (!a20TabIds.includes(activeTab)) {
                setActiveTab('mentor_attendance');
              }
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              currentCategory === 'a20'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            🛡️ Internal A20 (Pengurus)
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
      {/* Live Monitor A21 (Accessible by ALL Mentors & SuperAdmin) */}
      {activeTab === 'live_monitor' && (
        <LiveMonitorA21
          members={members}
          activeMeeting={activeMeeting}
          attendances={attendances}
          talentStars={talentStars}
        />
      )}

      {/* Radar Bibit Lomba A21 (Accessible by ALL Mentors & SuperAdmin) */}
      {activeTab === 'talent_scout' && onAddTalentStar && onRemoveTalentStar && (
        <TalentScoutA21
          members={members}
          meetings={meetings}
          talentStars={talentStars}
          onAddStar={onAddTalentStar}
          onRemoveStar={onRemoveTalentStar}
          activeMeeting={activeMeeting}
        />
      )}

      {/* Bantu Absen Adik Kelas (Accessible by ALL Mentors & SuperAdmin) */}
      {activeTab === 'helper_a21' && (
        <HelperAttendanceA21
          members={members}
          activeMeeting={activeMeeting}
          attendances={attendances}
          onAttendanceChanged={onAttendanceChanged}
        />
      )}

      {/* Sesi & Token Control */}
      {activeTab === 'session' && isSuperAdmin && (
        <MeetingControl
          activeMeeting={activeMeeting}
          mentorToken={mentorToken}
          onMentorTokenUpdated={onMentorTokenUpdated}
          isManualBypass={isManualBypass}
          onToggleManualBypass={onToggleManualBypass}
          onMeetingUpdated={onMeetingUpdated}
          isRegistrationOpen={isRegistrationOpen}
          onToggleRegistration={onToggleRegistration}
          currentPin={currentPin}
          onPinUpdated={onPinUpdated}
        />
      )}

      {/* Rekap Rapor Bulanan (Accessible by ALL Mentors & SuperAdmin) */}
      {activeTab === 'recap' && (
        <ReportRecap
          members={members}
          meetings={meetings}
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
          meetings={meetings}
          attendances={attendances}
        />
      )}

      {/* Presensi Mandiri Pengurus A20 */}
      {activeTab === 'mentor_attendance' && (
        <MentorAttendance
          members={members}
          activeMeeting={activeMeeting}
          attendances={attendances}
          mentorToken={mentorToken}
          isManualBypass={isManualBypass}
          onAttendanceChanged={onAttendanceChanged}
        />
      )}

      {/* Suara & Masukan Adik Kelas (Accessible by ALL Mentors & SuperAdmin) */}
      {activeTab === 'agenda_a21' && (
        <AgendaVault
          attendances={attendances}
          members={members}
          activeMeeting={activeMeeting}
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
          isSuperAdmin={isSuperAdmin}
          initialGroup="a20"
          lockGroup={true}
        />
      )}

      {/* ACC Anggota Baru */}
      {activeTab === 'approvals' && isSuperAdmin && (
        <RegistrationApprovals
          registrations={registrations}
          onRefreshRegistrations={onRefreshRegistrations}
          onMemberAdded={onMemberAdded}
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

      {/* Super Admin Secret Modal */}
      <SuperAdminModal
        isOpen={isSuperModalOpen}
        onClose={() => setIsSuperModalOpen(false)}
        onSuccess={(sig) => {
          onSuperAdminUnlock(sig);
          setActiveTab('live_monitor');
        }}
      />
    </div>
  );
};
