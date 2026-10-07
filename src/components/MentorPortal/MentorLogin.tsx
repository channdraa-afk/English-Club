import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || isVerifying) return;
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
        safeStorage.set('ec_mentor_session_v2', 'ec_auth_' + Date.now());
        onLoginSuccess();
      } else {
        sound.playError();
        setError('PIN Mentor salah! Silakan coba lagi.');
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
                placeholder="••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-xl font-black tracking-widest text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-none transition-colors"
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
            disabled={pin.length < 4}
          >
            <Lock className="w-4 h-4" />
            <span>MASUK DASHBOARD</span>
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
