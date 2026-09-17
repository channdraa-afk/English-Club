import React, { useState } from 'react';
import { Crown, KeyRound, Lock, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password === 'mybinivioletevergarden') {
      sound.playSuccess();
      onSuccess();
      setPassword('');
      onClose();
    } else {
      sound.playError();
      setError('Kata sandi salah! Akses ini dikhususkan untuk Ketua.');
      setPassword('');
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
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
              Kata Sandi Super Admin
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan sandi ketua..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <TactileButton
            type="submit"
            variant="amber"
            size="md"
            className="w-full py-3 text-xs"
            disabled={!password.trim()}
          >
            <Lock className="w-4 h-4" />
            <span>BUKA AKSES PENUH</span>
          </TactileButton>
        </form>
      </div>
    </div>
  );
};
