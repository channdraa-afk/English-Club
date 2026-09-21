import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { Member, Meeting, Attendance, Registration, TalentStar, BigEvent, GalleryItem, QuizSession } from './types/database';
import { Navbar } from './components/Navbar';
import { MemberAttendance } from './components/MemberAttendance';
import { WordOfTheDayModal } from './components/WordOfTheDayModal';
import { RegistrationModal } from './components/RegistrationModal';
import { MentorLogin } from './components/MentorPortal/MentorLogin';
import { LandingPage } from './components/LandingPage/LandingPage';
import { ArenaPlayer } from './components/Arena/ArenaPlayer';
import { SandboxBanner } from './components/SandboxBanner';
import { SandboxState } from './lib/sandbox';
import { SUPERADMIN_HASH } from './components/MentorPortal/SuperAdminModal';

const MentorDashboard = React.lazy(() =>
  import('./components/MentorPortal/MentorDashboard').then((m) => ({
    default: m.MentorDashboard,
  }))
);
import { sound } from './lib/audio';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { isSessionActiveNow } from './lib/schedule';
import { safeStorage } from './lib/storage';

export const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [talentStars, setTalentStars] = useState<TalentStar[]>([]);
  const [bigEvents, setBigEvents] = useState<BigEvent[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [mentorPin, setMentorPin] = useState('');
  const [mentorToken, setMentorToken] = useState('CREW20');
  const [activeQuizSession, setActiveQuizSession] = useState<QuizSession | null>(null);
  const [sandboxState, setSandboxState] = useState<SandboxState | null>(null);

  // Instant local cache read for zero-delay bypass detection
  const [isManualBypass, setIsManualBypass] = useState<boolean>(() => {
    return safeStorage.get('ec_manual_bypass') === 'true';
  });

  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // View state: 'landing' | 'student' | 'mentor' | 'arena' (Smart Time-Aware Auto-Route Engine)
  const [currentView, setCurrentView] = useState<'landing' | 'student' | 'mentor' | 'arena'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const cachedBypass = safeStorage.get('ec_manual_bypass') === 'true';
      const isSessionActive = isSessionActiveNow(cachedBypass, 'student');

      if (hash === '#mentor') return 'mentor';
      if (hash === '#beranda') return 'landing';
      if (hash === '#arena' || hash === '#kuis') return 'arena';

      // If URL contains #absen or #presensi:
      if (hash === '#absen' || hash === '#presensi') {
        return 'student';
      }

      // If opening root URL without hash:
      if (isSessionActive) {
        window.location.hash = '#absen';
        return 'student';
      }
    }
    return 'landing';
  });
  const [isMentorLoggedIn, setIsMentorLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    return safeStorage.get('ec_superadmin_sig') === SUPERADMIN_HASH;
  });

  // Modals state
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [successMember, setSuccessMember] = useState<Member | null>(null);
  const [successMeeting, setSuccessMeeting] = useState<Meeting | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Check saved mentor login & enforce session validity (kicking legacy sessions!)
  useEffect(() => {
    // 1. Kick legacy logins from all devices
    if (safeStorage.get('ec_mentor_auth')) {
      safeStorage.remove('ec_mentor_auth');
      setIsMentorLoggedIn(false);
    }

    // 2. Validate current session against active mentor PIN
    const savedSession = safeStorage.get('ec_mentor_session_v2');
    if (savedSession && mentorPin && savedSession === mentorPin.trim()) {
      setIsMentorLoggedIn(true);
    } else if (savedSession && mentorPin && savedSession !== mentorPin.trim()) {
      safeStorage.remove('ec_mentor_session_v2');
      setIsMentorLoggedIn(false);
    }
  }, [mentorPin]);

  // Listen for browser back/forward or hash change (#absen, #mentor, #beranda)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#absen' || hash === '#presensi') {
        setCurrentView('student');
      } else if (hash === '#mentor') {
        setCurrentView('mentor');
      } else if (hash === '#arena' || hash === '#kuis') {
        setCurrentView('arena');
      } else if (hash === '#beranda') {
        setCurrentView('landing');
      } else if (hash === '' || hash === '#') {
        if (isSessionActiveNow(isManualBypass, 'student')) {
          setCurrentView('student');
          window.location.hash = '#absen';
        } else {
          setCurrentView('landing');
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isManualBypass]);

  // Realtime subscription: sync bypass & settings instantly across all devices
  useEffect(() => {
    const channel = supabase
      .channel('realtime_app_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        (payload: any) => {
          const row = payload.new;
          if (!row || !row.key) return;

          if (row.key === 'manual_bypass') {
            const isBypass = Boolean(row.value);
            setIsManualBypass(isBypass);
            if (isBypass) {
              safeStorage.set('ec_manual_bypass', 'true');
              // If user is on root (empty hash), auto-open attendance
              const hash = window.location.hash.toLowerCase();
              if (hash === '' || hash === '#') {
                setCurrentView('student');
                window.location.hash = '#absen';
              }
            } else {
              safeStorage.remove('ec_manual_bypass');
            }
          } else if (row.key === 'registration_open') {
            setIsRegistrationOpen(Boolean(row.value));
          } else if (row.key === 'mentor_pin') {
            setMentorPin(typeof row.value === 'string' ? row.value : String(row.value));
          } else if (row.key === 'mentor_token') {
            setMentorToken(typeof row.value === 'string' ? row.value : String(row.value));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Realtime subscription: sync active quiz session instantly
  useEffect(() => {
    const quizChannel = supabase
      .channel('realtime_quiz_session_watcher')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_sessions' },
        () => {
          supabase
            .from('quiz_sessions')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
            .then(({ data }) => setActiveQuizSession(data || null));
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel('realtime_app_settings_watcher')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        () => {
          supabase
            .from('app_settings')
            .select('*')
            .eq('key', 'sandbox_mode')
            .maybeSingle()
            .then(({ data }) => {
              if (data && data.value) {
                setSandboxState(data.value as SandboxState);
              } else {
                setSandboxState(null);
              }
            });
        }
      )
      .subscribe();

    const arenaBroadcastChannel = supabase
      .channel('arena_global')
      .on('broadcast', { event: 'quiz_session_state' }, ({ payload }: any) => {
        setActiveQuizSession(payload?.session || null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(quizChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(arenaBroadcastChannel);
    };
  }, []);

  // Live Clock Ticker: checks every 15 seconds for Wednesday 15:40 WIB arrival, expiration, and quiz status sync
  useEffect(() => {
    const interval = setInterval(() => {
      const hash = window.location.hash.toLowerCase();
      const isActive = isSessionActiveNow(isManualBypass, 'student');

      // Re-verify active quiz session to guarantee zero stale indicator across tabs
      supabase
        .from('quiz_sessions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(
          ({ data }) => {
            setActiveQuizSession(data || null);
          },
          () => {}
        );

      // If user is visiting root (empty hash), check if session just started
      if (hash === '' || hash === '#') {
        if (isActive) {
          setCurrentView('student');
          window.location.hash = '#absen';
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isManualBypass]);

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
            const bypassVal = Boolean(s.value);
            setIsManualBypass(bypassVal);
            if (bypassVal) {
              safeStorage.set('ec_manual_bypass', 'true');
            } else {
              safeStorage.remove('ec_manual_bypass');
            }
            if (typeof window !== 'undefined') {
              const hash = window.location.hash.toLowerCase();
              const isSessionActive = isSessionActiveNow(bypassVal, 'student');
              if (hash === '' || hash === '#') {
                if (isSessionActive) {
                  setCurrentView('student');
                  window.location.hash = '#absen';
                }
              }
            }
          } else if (s.key === 'talent_stars' && Array.isArray(s.value)) {
            setTalentStars(s.value);
          } else if (s.key === 'big_events' && Array.isArray(s.value)) {
            setBigEvents(s.value);
          } else if (s.key === 'gallery_items' && Array.isArray(s.value)) {
            setGalleryItems(s.value);
          } else if (s.key === 'sandbox_mode' && s.value) {
            setSandboxState(s.value as SandboxState);
          }
        });
      }

      // 6. Fetch talent_stars table if available
      try {
        const { data: starData, error: starErr } = await supabase.from('talent_stars').select('*');
        if (!starErr && starData) {
          setTalentStars(starData);
        }
      } catch {
        // Handled via app_settings fallback
      }

      // 7. Fetch active quiz session if available
      try {
        const { data: qSession } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setActiveQuizSession(qSession || null);
      } catch {
        // Fallback null
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

  // Current active meeting (routed to Sandbox Meeting if Sandbox is ON)
  const isSandboxModeActive = Boolean(sandboxState?.is_active);
  const activeMeeting = isSandboxModeActive
    ? (meetings.find((m) => m.token === 'COBA' || m.id === sandboxState?.meeting_id) || meetings.find((m) => m.is_active) || null)
    : (meetings.find((m) => m.is_active && m.token !== 'COBA' && !m.title.includes('[UJI COBA]')) || meetings.find((m) => m.token !== 'COBA' && !m.title.includes('[UJI COBA]')) || null);

  const isEffectiveBypass = isManualBypass || isSandboxModeActive;

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
    safeStorage.remove('ec_mentor_auth');
    safeStorage.remove('ec_mentor_session_v2');
    safeStorage.remove('ec_superadmin_sig');
    safeStorage.remove('ec_superadmin_auth');
    setIsMentorLoggedIn(false);
    setIsSuperAdmin(false);
    setCurrentView('student');
  };

  const handleSuperAdminUnlock = (signature?: string) => {
    setIsSuperAdmin(true);
    if (signature === SUPERADMIN_HASH) {
      safeStorage.set('ec_superadmin_sig', signature);
    }
  };

  const handleSuperAdminLock = () => {
    setIsSuperAdmin(false);
    safeStorage.remove('ec_superadmin_sig');
    safeStorage.remove('ec_superadmin_auth');
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
    if (state) {
      safeStorage.set('ec_manual_bypass', 'true');
    } else {
      safeStorage.remove('ec_manual_bypass');
    }
    await supabase.from('app_settings').upsert({ key: 'manual_bypass', value: state });
  };

  const handleUpdateBigEvents = async (events: BigEvent[]) => {
    setBigEvents(events);
    try {
      await supabase.from('app_settings').upsert({ key: 'big_events', value: events });
    } catch (err) {
      console.error('Failed to save big_events:', err);
    }
  };

  const handleUpdateGalleryItems = async (items: GalleryItem[]) => {
    setGalleryItems(items);
    try {
      await supabase.from('app_settings').upsert({ key: 'gallery_items', value: items });
    } catch (err) {
      console.error('Failed to save gallery_items:', err);
    }
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
      await supabase.from('talent_stars').insert(star);
    } catch {
      // Handled via fallback below
    }

    try {
      await supabase.from('app_settings').upsert({
        key: 'talent_stars',
        value: updated,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  };

  const handleRemoveTalentStar = async (starId: string) => {
    const updated = talentStars.filter((s) => s.id !== starId);
    setTalentStars(updated);

    try {
      await supabase.from('talent_stars').delete().eq('id', starId);
    } catch {
      // Handled via fallback below
    }

    try {
      await supabase.from('app_settings').upsert({
        key: 'talent_stars',
        value: updated,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-200 selection:text-blue-900">
      {/* Broadcast Sandbox & Maintenance Banner for everyone when active */}
      {isSandboxModeActive && (
        <SandboxBanner
          isSuperAdmin={isSuperAdmin}
          onSandboxDeactivated={() => {
            setSandboxState({ is_active: false });
            fetchData(true);
          }}
        />
      )}

      {/* If Landing View: Tampilkan Official Flagship Website EC SMEGA */}
      {currentView === 'landing' ? (
        <LandingPage
          activeMeeting={activeMeeting}
          isManualBypass={isEffectiveBypass}
          onOpenAttendance={() => {
            setCurrentView('student');
            window.location.hash = '#absen';
          }}
          onOpenMentor={() => {
            setCurrentView('mentor');
            window.location.hash = '#mentor';
          }}
          hasActiveQuiz={Boolean(activeQuizSession)}
          onOpenArena={() => {
            sound.playPop();
            setCurrentView('arena');
            window.location.hash = '#arena';
          }}
          membersCount={{
            a21: members.filter((m) => m.generation === 21).length || 103,
            a20: members.filter((m) => m.generation === 20).length || 59,
          }}
          isRegistrationOpen={isRegistrationOpen}
          isSuperAdmin={isSuperAdmin}
          onGoToMentorPortal={() => {
            setCurrentView('mentor');
            window.location.hash = '#mentor';
          }}
          onSuperAdminLock={handleSuperAdminLock}
          bigEvents={bigEvents}
          galleryItems={galleryItems}
          onUpdateBigEvents={handleUpdateBigEvents}
          onUpdateGalleryItems={handleUpdateGalleryItems}
        />
      ) : (
        <>
          {/* Navbar untuk Mode Presensi & Portal Pengurus */}
          <Navbar
            activeMeetingTitle={activeMeeting?.title}
            isMeetingActive={isSessionActiveNow(isEffectiveBypass, 'student')}
            onOpenMentor={() => {
              sound.playPop();
              setCurrentView('mentor');
              window.location.hash = '#mentor';
            }}
            onOpenRegister={() => {
              sound.playPop();
              setIsRegisterModalOpen(true);
            }}
            isRegistrationOpen={isRegistrationOpen}
            isMentorLoggedIn={isMentorLoggedIn}
            currentView={currentView}
            hasActiveQuiz={Boolean(activeQuizSession)}
            onOpenArena={() => {
              sound.playPop();
              setCurrentView('arena');
              window.location.hash = '#arena';
            }}
            onSwitchView={(v) => {
              setCurrentView(v);
              window.location.hash = v === 'mentor' ? '#mentor' : v === 'student' ? '#absen' : v === 'arena' ? '#arena' : '#beranda';
            }}
            onGoHome={() => {
              setCurrentView('landing');
              window.location.hash = '#beranda';
            }}
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
                    Tabel database belum dibuat di Supabase project kamu. Silakan jalankan skrip <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300">supabase/setup_database.sql</code> di SQL Editor Supabase.
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
            ) : currentView === 'arena' ? (
              <ArenaPlayer
                members={members}
                onBackToHome={() => {
                  setCurrentView('student');
                  window.location.hash = '#absen';
                }}
              />
            ) : currentView === 'student' ? (
              <div className="space-y-6">
                <div className="max-w-md mx-auto px-4 pt-4">
                  {activeQuizSession ? (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 rounded-3xl border-2 border-blue-800 shadow-[0_6px_0_0_#1e3a8a] text-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl shrink-0 shadow-inner">
                          🎮
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-blue-100 inline-block mb-0.5">
                            Kuis Live Sedang Dibuka!
                          </span>
                          <h4 className="text-sm font-black tracking-tight leading-tight">
                            EC Arena — Pekan Praktek
                          </h4>
                          <p className="text-xs font-medium text-blue-100">
                            Cek kode token yang ditulis mentor di papan tulis kelasmu
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setCurrentView('arena');
                          window.location.hash = '#arena';
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-0.5 transition-all cursor-pointer text-center"
                      >
                        Masuk Kuis Arena ➔
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 px-4 rounded-3xl bg-white border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-xl shrink-0">
                          🎮
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-tight">
                            EC Arena (Kuis Interaktif)
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            Pekan praktek materi & kuis seru
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setCurrentView('arena');
                          window.location.hash = '#arena';
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black border border-blue-800 shadow-[0_2px_0_0_#1e3a8a] active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                      >
                        Buka Arena ➔
                      </button>
                    </div>
                  )}
                </div>

                <MemberAttendance
                  members={members}
                  activeMeeting={activeMeeting}
                  isManualBypass={isEffectiveBypass}
                  onAttendanceSuccess={handleAttendanceSuccess}
                />
              </div>
            ) : isMentorLoggedIn ? (
              <React.Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-8">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      Memuat Portal Mentor SMEGA...
                    </p>
                  </div>
                }
              >
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
                  isManualBypass={isEffectiveBypass}
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
                  onQuizSessionChanged={(session) => setActiveQuizSession(session)}
                  talentStars={talentStars}
                  onAddTalentStar={handleAddTalentStar}
                  onRemoveTalentStar={handleRemoveTalentStar}
                  isSandboxActive={isSandboxModeActive}
                  onLogout={handleMentorLogout}
                  onBackToStudent={() => {
                    setCurrentView('student');
                    window.location.hash = '#absen';
                  }}
                />
              </React.Suspense>
            ) : (
              <MentorLogin
                currentPin={mentorPin}
                onLoginSuccess={handleMentorLoginSuccess}
                onBackToStudent={() => {
                  setCurrentView('student');
                  window.location.hash = '#absen';
                }}
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
                Dikembangkan oleh Chandra (<a href="https://github.com/channdraa-afk" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-bold">@channdraa-afk</a>) — Ketua EC SMEGA.
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;
