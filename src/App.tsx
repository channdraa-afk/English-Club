import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { Member, Meeting, Attendance, Registration, TalentStar } from './types/database';
import { Navbar } from './components/Navbar';
import { MemberAttendance } from './components/MemberAttendance';
import { WordOfTheDayModal } from './components/WordOfTheDayModal';
import { RegistrationModal } from './components/RegistrationModal';
import { MentorLogin } from './components/MentorPortal/MentorLogin';
import { MentorDashboard } from './components/MentorPortal/MentorDashboard';
import { sound } from './lib/audio';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [talentStars, setTalentStars] = useState<TalentStar[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [mentorPin, setMentorPin] = useState('123321');
  const [mentorToken, setMentorToken] = useState('CREW20');
  const [isManualBypass, setIsManualBypass] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // View state
  const [currentView, setCurrentView] = useState<'student' | 'mentor'>('student');
  const [isMentorLoggedIn, setIsMentorLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Modals state
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [successMember, setSuccessMember] = useState<Member | null>(null);
  const [successMeeting, setSuccessMeeting] = useState<Meeting | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Check saved mentor login & superadmin in storage
  useEffect(() => {
    const savedAuth = localStorage.getItem('ec_mentor_auth');
    if (savedAuth === 'true') {
      setIsMentorLoggedIn(true);
    }
    const savedSuper = sessionStorage.getItem('ec_superadmin_auth');
    if (savedSuper === 'true') {
      setIsSuperAdmin(true);
    }
  }, []);

  // Fetch all data from Supabase
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setDbError(null);

    try {
      // 1. Fetch members
      const { data: memberData, error: memberErr } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (memberErr) throw memberErr;
      setMembers(memberData || []);

      // 2. Fetch meetings
      const { data: meetingData, error: meetingErr } = await supabase
        .from('meetings')
        .select('*')
        .order('meeting_date', { ascending: false });

      if (meetingErr) throw meetingErr;
      setMeetings(meetingData || []);

      // 3. Fetch attendances
      const { data: attendanceData, error: attErr } = await supabase
        .from('attendances')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (attErr) throw attErr;
      setAttendances(attendanceData || []);

      // 4. Fetch registrations
      const { data: regData, error: regErr } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (regErr) throw regErr;
      setRegistrations(regData || []);

      // 5. Fetch app_settings
      const { data: settingsData } = await supabase.from('app_settings').select('*');
      if (settingsData) {
        settingsData.forEach((s) => {
          if (s.key === 'registration_open') {
            setIsRegistrationOpen(Boolean(s.value));
          } else if (s.key === 'mentor_pin') {
            setMentorPin(typeof s.value === 'string' ? s.value : String(s.value));
          } else if (s.key === 'mentor_token') {
            setMentorToken(typeof s.value === 'string' ? s.value : String(s.value));
          } else if (s.key === 'manual_bypass') {
            setIsManualBypass(Boolean(s.value));
          } else if (s.key === 'talent_stars' && Array.isArray(s.value)) {
            setTalentStars(s.value);
          }
        });
      }

      // 6. Fetch talent_stars table if available
      try {
        const { data: starData, error: starErr } = await supabase.from('talent_stars').select('*');
        if (!starErr && starData && starData.length > 0) {
          setTalentStars(starData);
        }
      } catch {
        // Handled via app_settings fallback
      }
    } catch (err: any) {
      console.error('Error fetching Supabase data:', err);
      setDbError(err.message || 'Gagal memuat data dari Supabase.');
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Current active meeting
  const activeMeeting = meetings.find((m) => m.is_active) || meetings[0] || null;

  // Handlers
  const handleAttendanceSuccess = (member: Member, meeting: Meeting) => {
    setSuccessMember(member);
    setSuccessMeeting(meeting);
    setIsWordModalOpen(true);
    fetchData(true); // Silent refresh
  };

  const handleMentorLoginSuccess = () => {
    setIsMentorLoggedIn(true);
    setCurrentView('mentor');
  };

  const handleMentorLogout = () => {
    localStorage.removeItem('ec_mentor_auth');
    sessionStorage.removeItem('ec_superadmin_auth');
    setIsMentorLoggedIn(false);
    setIsSuperAdmin(false);
    setCurrentView('student');
  };

  const handleSuperAdminUnlock = () => {
    setIsSuperAdmin(true);
    sessionStorage.setItem('ec_superadmin_auth', 'true');
  };

  const handleSuperAdminLock = () => {
    setIsSuperAdmin(false);
    sessionStorage.removeItem('ec_superadmin_auth');
  };

  const handleToggleRegistration = async (state: boolean) => {
    setIsRegistrationOpen(state);
    await supabase
      .from('app_settings')
      .upsert({ key: 'registration_open', value: state });
  };

  const handleMentorTokenUpdated = async (tok: string) => {
    setMentorToken(tok);
    await supabase.from('app_settings').upsert({ key: 'mentor_token', value: tok });
  };

  const handleToggleManualBypass = async (state: boolean) => {
    setIsManualBypass(state);
    await supabase.from('app_settings').upsert({ key: 'manual_bypass', value: state });
  };

  const handleAddTalentStar = async (newStar: Omit<TalentStar, 'id' | 'created_at'>) => {
    const star: TalentStar = {
      ...newStar,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    const updated = [...talentStars, star];
    setTalentStars(updated);

    try {
      const { error } = await supabase.from('talent_stars').insert(star);
      if (error) {
        await supabase.from('app_settings').upsert({
          key: 'talent_stars',
          value: updated,
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      await supabase.from('app_settings').upsert({
        key: 'talent_stars',
        value: updated,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const handleRemoveTalentStar = async (starId: string) => {
    const updated = talentStars.filter((s) => s.id !== starId);
    setTalentStars(updated);

    try {
      const { error } = await supabase.from('talent_stars').delete().eq('id', starId);
      if (error) {
        await supabase.from('app_settings').upsert({
          key: 'talent_stars',
          value: updated,
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      await supabase.from('app_settings').upsert({
        key: 'talent_stars',
        value: updated,
        updated_at: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-200 selection:text-blue-900">
      {/* Navbar */}
      <Navbar
        activeMeetingTitle={activeMeeting?.title}
        isMeetingActive={Boolean(activeMeeting?.is_active)}
        onOpenMentor={() => {
          sound.playPop();
          setCurrentView('mentor');
        }}
        onOpenRegister={() => {
          sound.playPop();
          setIsRegisterModalOpen(true);
        }}
        isRegistrationOpen={isRegistrationOpen}
        isMentorLoggedIn={isMentorLoggedIn}
        currentView={currentView}
        onSwitchView={(v) => setCurrentView(v)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading && members.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-bold">Memuat Data English Club SMEGA...</p>
          </div>
        ) : dbError && members.length === 0 ? (
          <div className="max-w-md mx-auto px-4 py-12 text-center">
            <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-[0_4px_0_0_#fcd34d] space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="text-base font-black text-amber-950">Inisialisasi Database Supabase</h3>
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                Tabel database belum dibuat di Supabase project kamu. Silakan jalankan skrip <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300">supabase/schema.sql</code> dan <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300">supabase/seed.sql</code> di SQL Editor Supabase.
              </p>
              <button
                onClick={() => fetchData()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-black shadow-[0_2px_0_0_#b45309] active:translate-y-0.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Muat Ulang</span>
              </button>
            </div>
          </div>
        ) : currentView === 'student' ? (
          <MemberAttendance
            members={members}
            activeMeeting={activeMeeting}
            isManualBypass={isManualBypass}
            onAttendanceSuccess={handleAttendanceSuccess}
          />
        ) : isMentorLoggedIn ? (
          <MentorDashboard
            members={members}
            meetings={meetings}
            attendances={attendances}
            activeMeeting={activeMeeting}
            registrations={registrations}
            isRegistrationOpen={isRegistrationOpen}
            currentPin={mentorPin}
            mentorToken={mentorToken}
            onMentorTokenUpdated={handleMentorTokenUpdated}
            isManualBypass={isManualBypass}
            onToggleManualBypass={handleToggleManualBypass}
            isSuperAdmin={isSuperAdmin}
            onSuperAdminUnlock={handleSuperAdminUnlock}
            onSuperAdminLock={handleSuperAdminLock}
            onMeetingUpdated={() => fetchData(true)}
            onToggleRegistration={handleToggleRegistration}
            onPinUpdated={(pin) => setMentorPin(pin)}
            onAttendanceChanged={() => fetchData(true)}
            onRefreshRegistrations={() => fetchData(true)}
            onMemberAdded={() => fetchData(true)}
            talentStars={talentStars}
            onAddTalentStar={handleAddTalentStar}
            onRemoveTalentStar={handleRemoveTalentStar}
            onLogout={handleMentorLogout}
            onBackToStudent={() => setCurrentView('student')}
          />
        ) : (
          <MentorLogin
            currentPin={mentorPin}
            onLoginSuccess={handleMentorLoginSuccess}
            onBackToStudent={() => setCurrentView('student')}
          />
        )}
      </main>

      {/* Modals */}
      <WordOfTheDayModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        member={successMember}
        meeting={successMeeting}
      />

      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      {/* Clean Footer (Standard RPL Professional) */}
      <footer className="py-6 border-t-2 border-slate-200 bg-white text-center text-xs font-bold text-slate-400">
        <div className="max-w-xl mx-auto px-4 space-y-1">
          <p className="text-slate-600 font-extrabold flex items-center justify-center gap-1">
            English Club SMK Negeri 1 Purbalingga (SMEGA)
          </p>
          <p className="text-[11px] text-slate-400">
            Dikembangkan oleh Chandra (<a href="https://github.com/channdraa-afk" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">@channdraa-afk</a>).
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
