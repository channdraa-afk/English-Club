import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
import { Member, Meeting, Attendance, Registration } from '../../types/database';
import { MeetingControl } from './MeetingControl';
import { ReportRecap } from './ReportRecap';
import { MentorAttendance } from './MentorAttendance';
import { AgendaVault } from './AgendaVault';
import { RegistrationApprovals } from './RegistrationApprovals';
import { StructureView } from './StructureView';
import { MentorDisciplineRadar } from './MentorDisciplineRadar';
import { SuperAdminModal } from './SuperAdminModal';
import { sound } from '../../lib/audio';

interface MentorDashboardProps {
  members: Member[];
  meetings: Meeting[];
  attendances: Attendance[];
  activeMeeting: Meeting | null;
  registrations: Registration[];
  isRegistrationOpen: boolean;
  currentPin: string;
  isSuperAdmin: boolean;
  onSuperAdminUnlock: () => void;
  onSuperAdminLock: () => void;
  onMeetingUpdated: () => void;
  onToggleRegistration: (state: boolean) => void;
  onPinUpdated: (pin: string) => void;
  onAttendanceChanged: () => void;
  onRefreshRegistrations: () => void;
  onMemberAdded: () => void;
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
  isSuperAdmin,
  onSuperAdminUnlock,
  onSuperAdminLock,
  onMeetingUpdated,
  onToggleRegistration,
  onPinUpdated,
  onAttendanceChanged,
  onRefreshRegistrations,
  onMemberAdded,
  onLogout,
  onBackToStudent,
}) => {
  type TabId = 'radar' | 'session' | 'recap' | 'mentor_attendance' | 'agenda' | 'approvals' | 'structure';
  const [activeTab, setActiveTab] = useState<TabId>(isSuperAdmin ? 'radar' : 'mentor_attendance');
  const [isSuperModalOpen, setIsSuperModalOpen] = useState(false);

  // Safety fallback if regular mentor tries to stay on a super-admin tab
  useEffect(() => {
    if (!isSuperAdmin && activeTab !== 'mentor_attendance' && activeTab !== 'structure') {
      setActiveTab('mentor_attendance');
    }
  }, [isSuperAdmin, activeTab]);

  const pendingRegsCount = registrations.filter((r) => r.status === 'pending').length;

  interface TabItem {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    superOnly: boolean;
  }

  const allTabs: TabItem[] = [
    { id: 'radar', label: 'Radar Kedisiplinan A20', icon: ShieldAlert, superOnly: true },
    { id: 'session', label: 'Kontrol Sesi & Token', icon: Sliders, superOnly: true },
    { id: 'recap', label: 'Rekap Rapor Bulanan', icon: FileSpreadsheet, superOnly: true },
    { id: 'mentor_attendance', label: 'Presensi Pengurus', icon: Users, superOnly: false },
    { id: 'agenda', label: 'Aspirasi & Saran', icon: Sparkles, superOnly: true },
    { id: 'approvals', label: 'ACC Anggota Baru', icon: UserPlus, badge: pendingRegsCount, superOnly: true },
    { id: 'structure', label: 'Struktur Pengurus A20', icon: Award, superOnly: false },
  ];

  const visibleTabs = allTabs.filter((t) => isSuperAdmin || !t.superOnly);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Top Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playPop();
              onBackToStudent();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Kembali ke Presensi Siswa"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-slate-900 text-base leading-tight">
                {isSuperAdmin ? 'Pusat Komando Super Admin' : 'Portal Pengurus EC SMEGA'}
              </h2>
              {isSuperAdmin && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>Chandra</span>
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              {isSuperAdmin ? 'Kendali Penuh Ketua & Angkatan 20' : 'Hanya Presensi & Struktur Angkatan 20'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
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
          ) : (
            <button
              onClick={() => {
                sound.playPop();
                setIsSuperModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold transition-colors"
              title="Akses Ketua / Super Admin"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Akses Ketua</span>
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

      {/* Tabs Menu (Duolingo Tactile Pill Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                  ? 'bg-slate-900 text-white border-slate-950 shadow-[0_3px_0_0_#0f172a] translate-y-0'
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

      {/* Active Tab Views */}
      {activeTab === 'radar' && isSuperAdmin && (
        <MentorDisciplineRadar
          members={members}
          meetings={meetings}
          attendances={attendances}
        />
      )}

      {activeTab === 'session' && isSuperAdmin && (
        <MeetingControl
          activeMeeting={activeMeeting}
          onMeetingUpdated={onMeetingUpdated}
          isRegistrationOpen={isRegistrationOpen}
          onToggleRegistration={onToggleRegistration}
          currentPin={currentPin}
          onPinUpdated={onPinUpdated}
        />
      )}

      {activeTab === 'recap' && isSuperAdmin && (
        <ReportRecap
          members={members}
          meetings={meetings}
          attendances={attendances}
          activeMeeting={activeMeeting}
          onAttendanceChanged={onAttendanceChanged}
        />
      )}

      {activeTab === 'mentor_attendance' && (
        <MentorAttendance
          members={members}
          activeMeeting={activeMeeting}
          attendances={attendances}
          onAttendanceChanged={onAttendanceChanged}
        />
      )}

      {activeTab === 'agenda' && isSuperAdmin && (
        <AgendaVault
          attendances={attendances}
          members={members}
          activeMeeting={activeMeeting}
        />
      )}

      {activeTab === 'approvals' && isSuperAdmin && (
        <RegistrationApprovals
          registrations={registrations}
          onRefreshRegistrations={onRefreshRegistrations}
          onMemberAdded={onMemberAdded}
        />
      )}

      {activeTab === 'structure' && (
        <StructureView 
          members={members} 
          isSuperAdmin={isSuperAdmin}
          onRequestSuperAdmin={() => setIsSuperModalOpen(true)}
        />
      )}

      {/* Super Admin Modal */}
      <SuperAdminModal
        isOpen={isSuperModalOpen}
        onClose={() => setIsSuperModalOpen(false)}
        onSuccess={() => {
          onSuperAdminUnlock();
          setActiveTab('radar');
        }}
      />
    </div>
  );
};
