import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { safeStorage } from '../../lib/storage';
import { supabase } from '../../lib/supabase';

interface MentorLoginProps {
  onLoginSuccess: () => void;
  onBackToStudent: () => void;
  currentPin?: string;
}

export const MentorLogin: React.FC<MentorLoginProps> = ({
  onLoginSuccess,
  onBackToStudent,
  currentPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check lockout state on mount
  useEffect(() => {
    const checkLockout = () => {
      const until = Number(safeStorage.get('ec_mentor_lockout_until') || 0);
      const now = Date.now();
      if (until > now) {
        setLockoutSeconds(Math.ceil((until - now) / 1000));
      } else {
        setLockoutSeconds(0);
        safeStorage.remove('ec_mentor_lockout_until');
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0 || !pin.trim() || isVerifying) return;
    setError(null);
    setIsVerifying(true);

    try {
      const cleanInput = pin.trim();

      // 1. Prioritize Server-Side RPC (Zero client-side PIN exposure)
      const { data: isRpcValid, error: rpcError } = await supabase.rpc('verify_mentor_pin', {
        pin_input: cleanInput,
      });

      let isValid = false;

      if (!rpcError && typeof isRpcValid === 'boolean') {
        isValid = isRpcValid;
      } else {
        // Fallback if RPC migration hasn't been executed yet or currentPin prop is supplied
        if (currentPin && cleanInput === currentPin.trim()) {
          isValid = true;
        }
      }

      if (isValid) {
        sound.playSuccess();
        safeStorage.remove('ec_mentor_fail_count');
        safeStorage.remove('ec_mentor_lockout_until');
        safeStorage.set('ec_mentor_session_v2', 'ec_auth_' + Date.now());
        onLoginSuccess();
      } else {
        sound.playError();
        const failCount = Number(safeStorage.get('ec_mentor_fail_count') || 0) + 1;
        safeStorage.set('ec_mentor_fail_count', String(failCount));

        if (failCount >= 5) {
          const until = Date.now() + 300000; // 5 menit lockout
          safeStorage.set('ec_mentor_lockout_until', String(until));
          setLockoutSeconds(300);
          setError('Terlalu banyak percobaan salah! Akses dibekukan selama 5 menit.');
        } else if (failCount >= 3) {
          const until = Date.now() + 60000; // 60 detik lockout
          safeStorage.set('ec_mentor_lockout_until', String(until));
          setLockoutSeconds(60);
          setError('PIN Mentor salah 3 kali! Akses dibekukan selama 60 detik.');
        } else {
          setError(`PIN Mentor salah! Sisa kesempatan: ${3 - failCount}x.`);
        }
        setPin('');
      }
    } catch {
      sound.playError();
      setError('Gagal memverifikasi PIN. Silakan periksa koneksi internet.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800 text-emerald-400 border-2 border-slate-700 shadow-[0_6px_0_0_#0f172a] flex items-center justify-center mb-3">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portal Mentor & Pengurus</h2>
        <p className="text-xs font-bold text-slate-500 mt-1">
          Khusus Angkatan 20 English Club SMEGA
        </p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#e2e8f0] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 text-center">
              Masukkan 6 Digit PIN Akses
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={lockoutSeconds > 0 ? `Terkunci (${lockoutSeconds}s)` : "••••••"}
                disabled={lockoutSeconds > 0}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-xl font-black tracking-widest text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-none transition-colors disabled:opacity-50 disabled:bg-slate-100"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <TactileButton
            type="submit"
            variant="slate"
            size="lg"
            className="w-full py-3.5 text-base"
            disabled={pin.length < 4 || lockoutSeconds > 0}
          >
            <Lock className="w-4 h-4" />
            <span>{lockoutSeconds > 0 ? `Tunggu ${lockoutSeconds} Detik...` : "MASUK DASHBOARD"}</span>
          </TactileButton>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onBackToStudent();
            }}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-700 pt-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Presensi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
