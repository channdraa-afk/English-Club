import React, { useState } from 'react';
import { KeyRound, AlertCircle, X, Sparkles } from 'lucide-react';
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
                <span>Pesan Apresiasi Ketua &amp; Rekan A20</span>
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
                Sebagai bentuk apresiasi spesial dari Chandra &amp; pengurus A20:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                <li>Presensi otomatis 100% tuntas sampai akhir periode.</li>
                <li>Hak akses privat menu pengurus &amp; Live Token Inspector.</li>
                <li>Fitur ganti PIN mandiri bisa diakses kapan saja setelah login.</li>
              </ul>
              <p className="text-[11px] text-indigo-700 font-extrabold pt-1">
                Selamat menjelajah portal pengurus, Lead Speaker &amp; Bug Hunter! 🚀✨
              </p>
            </div>

            <TactileButton
              type="button"
              variant="brand"
              onClick={() => {
                sound.playSuccess();
                if (cachedToken) {
                  completeLogin(cachedToken);
                } else {
                  onClose();
                }
              }}
              className="w-full py-3 text-xs font-black"
            >
              <span>Lanjut ke Dashboard Pengurus 🚀</span>
            </TactileButton>
          </div>
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
                  Ketua Divisi Speaking 🎙️
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
                  placeholder="Masukkan PIN..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <TactileButton
                type="submit"
                disabled={isVerifying || !pin.trim()}
                variant="brand"
                className="w-full py-3 text-xs font-black"
              >
                <span>{isVerifying ? 'Memvalidasi...' : 'Masuk Portal Pengurus 🚀'}</span>
              </TactileButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
