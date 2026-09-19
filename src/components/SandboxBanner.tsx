import React, { useState, useEffect } from 'react';
import { FlaskConical, Trash2, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { TactileButton } from './TactileButton';
import { sound } from '../lib/audio';
import { SandboxStats, getSandboxStats, stopSandboxModeAndPurge } from '../lib/sandbox';

interface SandboxBannerProps {
  isSuperAdmin: boolean;
  onSandboxDeactivated: () => void;
}

export const SandboxBanner: React.FC<SandboxBannerProps> = ({
  isSuperAdmin,
  onSandboxDeactivated,
}) => {
  const [stats, setStats] = useState<SandboxStats>({ testAttendances: 0, testQuizSubmissions: 0, testStars: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Poll stats every 5 seconds while sandbox is active
  useEffect(() => {
    let isMounted = true;
    const updateStats = async () => {
      const data = await getSandboxStats();
      if (isMounted) setStats(data);
    };

    updateStats();
    const timer = setInterval(updateStats, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const handleConfirmPurge = async () => {
    setIsPurging(true);
    try {
      await stopSandboxModeAndPurge();
      setShowConfirmModal(false);
      onSandboxDeactivated();
    } catch (err: any) {
      alert('Gagal membersihkan data sandbox: ' + (err.message || err));
    } finally {
      setIsPurging(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50 animate-bounce">
        <button
          type="button"
          onClick={() => {
            sound.playPop();
            setIsMinimized(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs border-2 border-amber-700 shadow-[0_4px_0_0_#b45309] active:translate-y-1 transition-all cursor-pointer"
        >
          <FlaskConical className="w-4 h-4 animate-spin" />
          <span>🧪 Mode Uji Coba Aktif</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 border-b-2 border-amber-600 shadow-md py-2.5 px-3 sm:px-6 relative z-40 animate-fade-in">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-center md:text-left">
          {/* Left: Icon & Description */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xs border border-amber-600">
              <FlaskConical className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md shadow-xs">
                  🧪 MODE UJI COBA & PEMELIHARAAN SISTEM
                </span>
                <span className="font-mono text-[10px] font-black bg-white/70 px-2 py-0.5 rounded-md border border-amber-600 text-slate-900">
                  Token: COBA
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                {isSuperAdmin
                  ? `Simulasi aman aktif. Tercatat: ${stats.testAttendances} Presensi • ${stats.testQuizSubmissions} Kuis • ${stats.testStars} Bintang.`
                  : 'Aplikasi sedang dalam tahap uji coba fitur baru oleh pengembang. Aktivitas saat ini bersifat simulasi dan tidak memengaruhi data resmi.'}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isSuperAdmin && (
              <TactileButton
                variant="crimson"
                size="sm"
                className="py-1.5 px-3 text-xs"
                onClick={() => {
                  sound.playPop();
                  setShowConfirmModal(true);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Matikan & Bersihkan</span>
              </TactileButton>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setIsMinimized(true);
              }}
              className="p-1 rounded-xl hover:bg-black/10 text-slate-800 transition-colors"
              title="Kecilkan banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-rose-500 shadow-[0_8px_0_0_#e11d48] max-w-md w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-200">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Bersihkan & Matikan Mode Uji Coba?
              </h3>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Tindakan ini akan <strong>menghapus permanen</strong> seluruh data simulasi yang dibuat selama masa uji coba:
              </p>
            </div>

            {/* Stats summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Presensi Uji Coba:</span>
                <span className="font-black text-rose-600">{stats.testAttendances} Siswa</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Submission Kuis Arena:</span>
                <span className="font-black text-rose-600">{stats.testQuizSubmissions} Siswa</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Bintang Bibit Lomba:</span>
                <span className="font-black text-rose-600">{stats.testStars} Bintang</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] font-bold text-emerald-800 text-center">
              🛡️ Master data 165 siswa dan rekap rapor resmi tetap 100% aman dan utuh.
            </div>

            <div className="space-y-2 pt-1">
              <TactileButton
                variant="crimson"
                size="md"
                className="w-full"
                disabled={isPurging}
                onClick={handleConfirmPurge}
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Membersihkan 100%...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Bersihkan & Matikan Mode Uji Coba</span>
                  </>
                )}
              </TactileButton>

              <TactileButton
                variant="white"
                size="sm"
                className="w-full text-slate-600"
                disabled={isPurging}
                onClick={() => {
                  sound.playPop();
                  setShowConfirmModal(false);
                }}
              >
                <span>Batal (Tetap di Mode Uji Coba)</span>
              </TactileButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
