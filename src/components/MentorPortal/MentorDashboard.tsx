import React, { useState } from 'react';
import { 
  Sliders, 
  FileSpreadsheet, 
  Users, 
  Sparkles, 
  UserPlus, 
  Award, 
  LogOut, 
  ArrowLeft 
} from 'lucide-react';
import { Member, Meeting, Attendance, Registration } from '../../types/database';
import { MeetingControl } from './MeetingControl';
import { ReportRecap } from './ReportRecap';
import { MentorAttendance } from './MentorAttendance';
import { AgendaVault } from './AgendaVault';
import { RegistrationApprovals } from './RegistrationApprovals';
import { StructureView } from './StructureView';
import { sound } from '../../lib/audio';

interface MentorDashboardProps {
  members: Member[];
  meetings: Meeting[];
  attendances: Attendance[];
  activeMeeting: Meeting | null;
  registrations: Registration[];
  isRegistrationOpen: boolean;
  currentPin: string;
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
  onMeetingUpdated,
  onToggleRegistration,
  onPinUpdated,
  onAttendanceChanged,
  onRefreshRegistrations,
  onMemberAdded,
  onLogout,
  onBackToStudent,
}) => {
  type TabId = 'session' | 'recap' | 'mentor_attendance' | 'agenda' | 'approvals' | 'structure';
  const [activeTab, setActiveTab] = useState<TabId>('session');

  const pendingRegsCount = registrations.filter((r) => r.status === 'pending').length;

  interface TabItem {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const tabs: TabItem[] = [
    { id: 'session', label: 'Kontrol Sesi', icon: Sliders },
    { id: 'recap', label: 'Rekap Rapor', icon: FileSpreadsheet },
    { id: 'mentor_attendance', label: 'Presensi Mentor', icon: Users },
    { id: 'agenda', label: 'Aspirasi & Saran', icon: Sparkles },
    { id: 'approvals', label: 'ACC Anggota', icon: UserPlus, badge: pendingRegsCount },
    { id: 'structure', label: 'Pengurus A20', icon: Award },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
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
            <h2 className="font-black text-slate-900 text-base leading-tight">Dashboard Mentor EC SMEGA</h2>
            <p className="text-[11px] font-bold text-slate-400">Pusat Kendali Pengurus Angkatan 20</p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playPop();
            onLogout();
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Kunci / Logout</span>
        </button>
      </div>

      {/* Tabs Menu (Duolingo Tactile Pill Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
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

      {/* Active Tab View */}
      {activeTab === 'session' && (
        <MeetingControl
          activeMeeting={activeMeeting}
          onMeetingUpdated={onMeetingUpdated}
          isRegistrationOpen={isRegistrationOpen}
          onToggleRegistration={onToggleRegistration}
          currentPin={currentPin}
          onPinUpdated={onPinUpdated}
        />
      )}

      {activeTab === 'recap' && (
        <ReportRecap
          members={members}
          meetings={meetings}
          attendances={attendances}
          activeMeeting={activeMeeting}
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

      {activeTab === 'agenda' && (
        <AgendaVault
          attendances={attendances}
          members={members}
          activeMeeting={activeMeeting}
        />
      )}

      {activeTab === 'approvals' && (
        <RegistrationApprovals
          registrations={registrations}
          onRefreshRegistrations={onRefreshRegistrations}
          onMemberAdded={onMemberAdded}
        />
      )}

      {activeTab === 'structure' && (
        <StructureView members={members} />
      )}
    </div>
  );
};
