import React, { useState } from 'react';
import { KeyRound, AlertCircle, X, Sparkles, Check, Key } from 'lucide-react';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { safeStorage } from '../../lib/storage';
import { supabase } from '../../lib/supabase';

interface HananSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const HananSecretModal: React.FC<HananSecretModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState(false);
  const [cachedToken, setCachedToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || isVerifying) return;
    setError(null);
    setIsVerifying(true);

    try {
      const cleanPin = pin.trim().toLowerCase();
      const { data, error: rpcErr } = await supabase.rpc('auth_hanan_pin', {
        pin_input: cleanPin,
      });

      if (rpcErr) throw rpcErr;

      const res = typeof data === 'string' ? JSON.parse(data) : data;

      if (res && res.success) {
        sound.playSuccess();
        const sessionToken = res.session_token;
        setCachedToken(sessionToken);

        // Check if first-time welcome has been seen
        const hasWelcomed = safeStorage.get('ec_hanan_welcomed') === 'true';

        if (!hasWelcomed) {
          setShowWelcome(true);
        } else {
          completeLogin(sessionToken);
        }
      } else {
        sound.playError();
        setError(res?.error || 'PIN Bug Hunter tidak valid!');
        setPin('');
      }
    } catch (err: any) {
      console.error('Hanan auth error:', err);
      sound.playError();
      setError('Gagal memvalidasi PIN: ' + (err.message || 'Koneksi error'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPin.trim() || !newPin.trim() || isVerifying) return;
    setError(null);
    setIsVerifying(true);

    try {
      const { data: isUpdated, error: rpcErr } = await supabase.rpc('update_hanan_pin', {
        current_pin: oldPin.trim().toLowerCase(),
        new_pin: newPin.trim().toLowerCase(),
      });

      if (rpcErr) throw rpcErr;

      if (isUpdated) {
        sound.playSuccess();
        setChangePinSuccess(true);
        setTimeout(() => {
          setIsChangingPin(false);
          setChangePinSuccess(false);
          setOldPin('');
          setNewPin('');
          setPin(newPin.trim().toLowerCase());
        }, 1500);
      } else {
        sound.playError();
        setError('PIN saat ini salah atau PIN baru terlalu pendek (min 3 karakter)!');
      }
    } catch (err: any) {
      sound.playError();
      setError('Gagal mengubah PIN: ' + (err.message || 'Error'));
    } finally {
      setIsVerifying(false);
    }
  };

  const completeLogin = (sessionToken: string) => {
    safeStorage.set('ec_mentor_session_v2', sessionToken);
    safeStorage.set('ec_saved_mentor_id', '4cb5bc39-23ac-4402-a389-a777842cd36f');
    safeStorage.set('ec_is_bughunter', 'true');
    safeStorage.set('ec_hanan_welcomed', 'true');

    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      window.location.hash = '#mentor';
      window.location.reload();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-indigo-500 shadow-[0_10px_0_0_#3730a3] p-6 space-y-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {showWelcome ? (
          /* ================= WELCOME MODAL PERTAMA KALI ================= */
          <div className="text-center space-y-4 pt-2 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-3xl">🎙️</span>
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Pesan Apresiasi Ketua & Rekan A20</span>
              </span>
              <h3 className="text-xl font-black text-slate-950">
                Thank You So Much, Hanan! 💖
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/80 border-2 border-indigo-200 text-slate-800 text-xs sm:text-sm font-bold leading-relaxed text-left space-y-2.5">
              <p>
                Terima kasih banyaak yaa Hanan udah jadi partner yang luar biasa, selalu hadir 100% dari awal sampai akhir, dan selalu sigap ngebantu hunting &amp; fix bug bareng Chandra! 🐞
              </p>
              <p>
                Kebaikan dan kontribusimu sangat berarti untuk kemajuan English Club SMEGA. Akses khusus Bug Hunter &amp; live monitor token resmi diaktifkan untukmu. Selamat bertugas, Chief Speaker! ✨
              </p>
            </div>

            <TactileButton
              type="button"
              onClick={() => {
                sound.playSuccess();
                if (cachedToken) completeLogin(cachedToken);
              }}
              variant="brand"
              className="w-full py-3.5 text-sm font-black"
            >
              <span>Siap, Gas Terus! 🚀</span>
            </TactileButton>
          </div>
        ) : isChangingPin ? (
          /* ================= GANTI PIN BUG HUNTER ================= */
          <form onSubmit={handleUpdatePin} className="space-y-4 pt-2 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-300">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Ganti PIN Bug Hunter</h3>
              <p className="text-xs font-bold text-slate-500">
                Ubah PIN rahasiamu agar selalu aman dan mudah kamu ingat.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {changePinSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PIN Bug Hunter berhasil diperbarui! 🎉</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  PIN Saat Ini:
                </label>
                <input
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Masukkan PIN saat ini (default: hanan)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  PIN Baru:
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="PIN baru (min. 3 karakter)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIsChangingPin(false);
                  setError(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors"
              >
                Kembali
              </button>
              <TactileButton
                type="submit"
                disabled={isVerifying}
                variant="brand"
                className="flex-1 py-2.5 text-xs font-black"
              >
                <span>{isVerifying ? 'Menyimpan...' : 'Simpan PIN'}</span>
              </TactileButton>
            </div>
          </form>
        ) : (
          /* ================= LOGIN FORM BUG HUNTER ================= */
          <form onSubmit={handleVerify} className="space-y-4 pt-2">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-100 text-indigo-700 border-2 border-indigo-300 flex items-center justify-center shadow-md">
                <span className="text-2xl">🐞</span>
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                  Secret Portal • Bug Hunter
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Hanan Aditya Zahid
                </h3>
                <p className="text-xs font-extrabold text-indigo-600">
                  Chief of Speaking &amp; Lead Bug Hunter 🎙️
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                Masukkan PIN Bug Hunter:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN Bug Hunter (Default: hanan)"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] font-bold text-slate-400">
                💡 PIN default pertama kali: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">hanan</code>
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <TactileButton
                type="submit"
                disabled={isVerifying || !pin.trim()}
                variant="brand"
                className="w-full py-3 text-xs font-black"
              >
                <span>{isVerifying ? 'Memvalidasi...' : 'Masuk Portal Pengurus 🚀'}</span>
              </TactileButton>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIsChangingPin(true);
                  setError(null);
                  setOldPin(pin);
                }}
                className="w-full py-1.5 text-center text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Mau ganti PIN? Klik di sini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
