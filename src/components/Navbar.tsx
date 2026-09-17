import React, { useState } from 'react';
import { Shield, UserPlus } from 'lucide-react';
import { sound } from '../lib/audio';

interface NavbarProps {
  activeMeetingTitle?: string;
  isMeetingActive: boolean;
  onOpenMentor: () => void;
  onOpenRegister: () => void;
  isRegistrationOpen: boolean;
  isMentorLoggedIn: boolean;
  currentView: 'student' | 'mentor';
  onSwitchView: (view: 'student' | 'mentor') => void;
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
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div 
          onClick={handleLogoTap}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="English Club SMEGA"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 border-2 border-emerald-700 shadow-[0_3px_0_0_#15803d] flex items-center justify-center text-white font-black text-xl group-active:translate-y-0.5 transition-transform">
            EC
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-lg leading-tight tracking-tight">English Club</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-emerald-300">SMEGA</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold">SMK Negeri 1 Purbalingga</p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2">
          {/* Status Sesi Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
            <span className={`w-2 h-2 rounded-full ${isMeetingActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="truncate max-w-[140px]">{isMeetingActive ? (activeMeetingTitle || 'Sesi Aktif') : 'Sesi Ditutup'}</span>
          </div>

          {/* New Member Registration CTA */}
          {isRegistrationOpen && currentView === 'student' && (
            <button
              onClick={() => {
                sound.playPop();
                onOpenRegister();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black shadow-[0_2px_0_0_#d97706] active:translate-y-0.5 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
          )}

          {/* Mentor Portal Button (Hanya tampil jika sudah login) */}
          {isMentorLoggedIn && (
            <button
              onClick={() => {
                sound.playPop();
                onSwitchView(currentView === 'mentor' ? 'student' : 'mentor');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                currentView === 'mentor'
                  ? 'bg-slate-800 text-white border-slate-900 shadow-[0_2px_0_0_#0f172a]'
                  : 'bg-emerald-600 text-white border-emerald-800 shadow-[0_2px_0_0_#15803d]'
              } active:translate-y-0.5`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{currentView === 'mentor' ? 'Ke Presensi' : 'Dashboard Mentor'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
