import React, { useState, useEffect } from 'react';
import { Crown, KeyRound, Lock, X, AlertCircle, Eye, EyeOff, ShieldAlert, Timer } from 'lucide-react';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { safeStorage } from '../../lib/storage';

// Cryptographic Private Salt & SHA-256 hash of Super Admin master key (Rainbow-Table Proof)
export const SUPERADMIN_SALT = 'ec_smega_vault_2026_';
export const SUPERADMIN_HASH = '053f97e4abd78437a5ede0393ac0e47411463d4943a127527c59d49eda3b85ba';

export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(SUPERADMIN_SALT + str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (signature?: string) => void;
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check lockout state on mount or open
  useEffect(() => {
    if (!isOpen) return;

    const checkLockout = () => {
      const until = Number(safeStorage.get('ec_super_lockout_until') || 0);
      const now = Date.now();
      if (until > now) {
        setLockoutSeconds(Math.ceil((until - now) / 1000));
      } else {
        setLockoutSeconds(0);
        safeStorage.remove('ec_super_lockout_until');
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError(null);
    setIsVerifying(true);

    try {
      const inputHash = await hashString(password.trim());
      if (inputHash === SUPERADMIN_HASH) {
        sound.playSuccess();
        // Reset failed attempt counter on success
        safeStorage.remove('ec_super_fail_count');
        safeStorage.remove('ec_super_lockout_until');
        onSuccess(inputHash);
        setPassword('');
        onClose();
      } else {
        sound.playError();
        const failCount = Number(safeStorage.get('ec_super_fail_count') || 0) + 1;
        safeStorage.set('ec_super_fail_count', String(failCount));

        if (failCount >= 3) {
          const until = Date.now() + 60000; // 60 seconds lockout
          safeStorage.set('ec_super_lockout_until', String(until));
          setLockoutSeconds(60);
          setError('Terlalu banyak percobaan gagal! Akses dibekukan selama 60 detik.');
        } else {
          setError(`Kata sandi salah! Sisa kesempatan: ${3 - failCount}x.`);
        }
        setPassword('');
      }
    } catch {
      sound.playError();
      setError('Gagal memverifikasi kata sandi kriptografi.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-2 border-amber-400 shadow-[0_8px_0_0_#d97706] p-6 space-y-4">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playPop();
            setPassword('');
            setError(null);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center border-2 border-amber-700 shadow-[0_4px_0_0_#b45309]">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              Akses Rahasia Super Admin
            </h3>
            <p className="text-xs font-bold text-amber-700">
              Chandra Darmawan Jhon — Ketua EC SMEGA
            </p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Masukkan kata sandi ketua untuk membuka kendali penuh sesi, rapor, dan radar kedisiplinan.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                Kata Sandi Super Admin
              </label>
              {lockoutSeconds > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                  <Timer className="w-3 h-3" />
                  <span>Kunci: {lockoutSeconds}s</span>
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lockoutSeconds > 0 ? `Terkunci (${lockoutSeconds} detik)...` : "Masukkan sandi ketua..."}
                disabled={lockoutSeconds > 0}
                className={`w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                  lockoutSeconds > 0
                    ? 'bg-slate-100 border-2 border-slate-300 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-50 border-2 border-slate-200 text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none'
                }`}
                autoFocus={lockoutSeconds === 0}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={lockoutSeconds > 0}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {lockoutSeconds > 0 ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border-2 border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2.5 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
              <div className="text-[11px] leading-relaxed">
                <p className="font-black text-rose-700">Benteng Keamanan Aktif</p>
                <p className="text-slate-600 font-medium">
                  Terlalu banyak percobaan salah. Silakan tunggu <span className="font-black text-rose-600">{lockoutSeconds} detik</span> sebelum mencoba kembali.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <TactileButton
            type="submit"
            variant="amber"
            size="md"
            className="w-full py-3 text-xs"
            disabled={!password.trim() || isVerifying || lockoutSeconds > 0}
          >
            <Lock className="w-4 h-4" />
            <span>
              {lockoutSeconds > 0
                ? `TERKUNCI (${lockoutSeconds}s)`
                : isVerifying
                ? 'MEMVERIFIKASI...'
                : 'BUKA AKSES PENUH'}
            </span>
          </TactileButton>
        </form>
      </div>
    </div>
  );
};
