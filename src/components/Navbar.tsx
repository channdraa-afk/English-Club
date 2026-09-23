import React, { useState } from 'react';
import { Shield, UserPlus, Home } from 'lucide-react';
import { sound } from '../lib/audio';

interface NavbarProps {
  activeMeetingTitle?: string;
  isMeetingActive: boolean;
  onOpenMentor: () => void;
  onOpenRegister: () => void;
  isRegistrationOpen: boolean;
  isMentorLoggedIn: boolean;
  currentView: 'student' | 'mentor' | 'landing' | 'arena';
  onSwitchView: (view: 'student' | 'mentor' | 'landing' | 'arena') => void;
  onGoHome?: () => void;
  hasActiveQuiz?: boolean;
  onOpenArena?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeMeetingTitle,
  isMeetingActive,
  onOpenMentor,
  onOpenRegister,
  isRegistrationOpen,
  isMentorLoggedIn,
  currentView,
  onSwitchView,
  onGoHome,
  hasActiveQuiz,
  onOpenArena,
}) => {
  const [tapCount, setTapCount] = useState(0);

  // Secret 5-tap on the logo or direct button
  const handleLogoTap = () => {
    sound.playPop();
    const nextTap = tapCount + 1;
    if (nextTap >= 5) {
      setTapCount(0);
      onOpenMentor();
    } else {
      setTapCount(nextTap);
      setTimeout(() => setTapCount(0), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-slate-200">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div 
          onClick={handleLogoTap}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group min-w-0"
          title="English Club SMEGA"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border-2 border-blue-600 shadow-[0_2px_0_0_#1d4ed8] sm:shadow-[0_3px_0_0_#1d4ed8] flex items-center justify-center p-1 group-active:translate-y-0.5 transition-transform overflow-hidden shrink-0">
            <img src="/logo.png" alt="EC SMEGA Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-black text-slate-900 text-xs sm:text-base md:text-lg leading-tight tracking-tight whitespace-nowrap">English Club</span>
              <span className="hidden sm:inline bg-blue-100 text-blue-900 text-[9px] sm:text-[10px] font-black px-1 sm:px-1.5 py-0.5 rounded-md border border-blue-300 shrink-0">SMEGA</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold truncate hidden min-[440px]:block">SMK Negeri 1 Purbalingga</p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Status Sesi Badge (Desktop, concise & clean) */}
          <div 
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shrink-0"
            title={activeMeetingTitle ? `Sesi: ${activeMeetingTitle}` : 'Status Sesi English Club'}
          >
            <span className={`w-2 h-2 rounded-full ${isMeetingActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isMeetingActive ? 'Sesi Dibuka' : 'Sesi Ditutup'}</span>
          </div>

          {/* Back to Official Website */}
          {onGoHome && (
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onGoHome();
              }}
              title="Kembali ke Beranda Website Resmi EC SMEGA"
              className="flex items-center gap-1.5 p-1.5 px-2.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-black shadow-[0_2px_0_0_#cbd5e1] active:translate-y-0.5 transition-all shrink-0 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Beranda</span>
            </button>
          )}

          {/* Quiz Arena Button ("Ready to Fight" — Only visible when quiz is active or inside arena) */}
          {(hasActiveQuiz || currentView === 'arena') && onOpenArena && (
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                if (currentView === 'arena') {
                  onSwitchView('student');
                } else {
                  onOpenArena();
                }
              }}
              title={currentView === 'arena' ? 'Kembali ke Presensi' : 'Masuk Kuis EC Arena'}
              className={`flex items-center gap-1.5 p-1.5 px-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black border transition-all shrink-0 cursor-pointer ${
                currentView === 'arena'
                  ? 'bg-blue-600 text-white border-blue-800 shadow-[0_2px_0_0_#1e3a8a]'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-800 shadow-[0_2px_0_0_#1e3a8a] active:translate-y-0.5 animate-pulse'
              }`}
            >
              <span className="text-xs">🎮</span>
              <span className="hidden min-[400px]:inline">
                {currentView === 'arena' ? 'Presensi' : 'Arena'}
              </span>
              {hasActiveQuiz && currentView !== 'arena' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          )}

          {/* New Member Registration CTA */}
          {isRegistrationOpen && currentView === 'student' && (
            <button
              onClick={() => {
                sound.playPop();
                onOpenRegister();
              }}
              title="Pendaftaran Anggota Baru"
              className="flex items-center gap-1 p-1.5 px-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black shadow-[0_2px_0_0_#d97706] active:translate-y-0.5 transition-all shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden min-[480px]:inline">Daftar</span>
            </button>
          )}

          {/* Mentor Portal Button (Hanya tampil jika sudah login) */}
          {isMentorLoggedIn && (
            <button
              onClick={() => {
                sound.playPop();
                onSwitchView(currentView === 'mentor' ? 'student' : 'mentor');
              }}
              title={currentView === 'mentor' ? 'Pindah ke Presensi Siswa' : 'Masuk Dashboard Mentor'}
              className={`flex items-center gap-1 p-1.5 px-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black border transition-all shrink-0 cursor-pointer ${
                currentView === 'mentor'
                  ? 'bg-slate-800 text-white border-slate-900 shadow-[0_2px_0_0_#0f172a]'
                  : 'bg-blue-600 text-white border-blue-800 shadow-[0_2px_0_0_#1e3a8a]'
              } active:translate-y-0.5`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>
                <span className="hidden min-[450px]:inline sm:hidden">{currentView === 'mentor' ? 'Presensi' : 'Mentor'}</span>
                <span className="hidden sm:inline">{currentView === 'mentor' ? 'Ke Presensi' : 'Dashboard Mentor'}</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
