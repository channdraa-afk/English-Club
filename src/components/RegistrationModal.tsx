import React, { useState } from 'react';
import { X, UserPlus, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { TactileButton } from './TactileButton';
import { sound } from '../lib/audio';
import { supabase } from '../lib/supabase';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [reason, setReason] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !className.trim() || !whatsapp.trim() || !reason.trim()) {
      sound.playError();
      setErrorMsg('Semua kolom wajib diisi yaa!');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('registrations').insert({
        full_name: fullName.trim(),
        class_name: className.trim(),
        whatsapp_number: whatsapp.trim(),
        reason: reason.trim(),
        status: 'pending',
      });

      if (error) throw error;

      sound.playSuccess();
      setIsSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error registering:', err);
      sound.playError();
      setErrorMsg(err.message || 'Gagal mengirim pendaftaran. Cek koneksi internetmu.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    sound.playPop();
    setFullName('');
    setClassName('');
    setWhatsapp('');
    setReason('');
    setIsSuccess(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-slate-200 shadow-[0_12px_0_0_#1e293b] overflow-hidden">
        {/* Header */}
        <div className="bg-amber-500 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">Pendaftaran Anggota</h3>
              <p className="text-xs font-bold text-amber-100">English Club SMK Negeri 1 Purbalingga</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 border-2 border-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Formulir Terkirim! 🎉</h4>
              <p className="text-xs font-bold text-slate-600 leading-relaxed max-w-xs mx-auto">
                Pendaftaranmu atas nama <span className="text-slate-900 font-extrabold">{fullName}</span> sudah diterima dan sedang menunggu persetujuan (ACC) dari kakak kelas pengurus.
              </p>
              <div className="pt-2">
                <TactileButton variant="brand" size="md" onClick={handleClose} className="w-full">
                  Mengerti & Selesai
                </TactileButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Chandra Darmawan Jhon"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Kelas
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Contoh: X PPLG 1 atau X AKL 2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Nomor WhatsApp Aktif
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Alasan Mau Bergabung
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan kenapa kamu tertarik ikut English Club SMEGA..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <TactileButton
                type="submit"
                variant="amber"
                size="md"
                disabled={isLoading}
                className="w-full py-3 text-base"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirim Formulir...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>KIRIM PENDAFTARAN</span>
                  </>
                )}
              </TactileButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
