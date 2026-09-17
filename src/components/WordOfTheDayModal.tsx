import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, Share2, X, BookmarkCheck } from 'lucide-react';
import { Member, Meeting } from '../types/database';
import { TactileButton } from './TactileButton';
import { sound } from '../lib/audio';

interface WordOfTheDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  meeting: Meeting | null;
}

export const WordOfTheDayModal: React.FC<WordOfTheDayModalProps> = ({
  isOpen,
  onClose,
  member,
  meeting,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playSuccess();
      // Confetti burst
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#16a34a', '#fef08a', '#3b82f6', '#ec4899'],
        });
      } catch {
        // Fallback if canvas-confetti fails
      }
    }
  }, [isOpen]);

  if (!isOpen || !member || !meeting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-slate-200 shadow-[0_12px_0_0_#1e293b] overflow-hidden animate-scale-up">
        {/* Header Ribbon */}
        <div className="bg-emerald-500 px-6 py-5 text-center text-white relative">
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="absolute top-4 right-4 p-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-2 backdrop-blur-sm">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Presensi Berhasil! 🎉</h2>
          <p className="text-xs font-bold text-emerald-100 mt-0.5">
            Terima kasih atas kehadiranmu di English Club SMEGA
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Member Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Nama Peserta</p>
              <h4 className="font-black text-slate-800 text-base">{member.name}</h4>
              <p className="text-xs font-bold text-emerald-700">{member.class_name} • Angkatan 21</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                <BookmarkCheck className="w-3.5 h-3.5" />
                Hadir
              </span>
              <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
            </div>
          </div>

          {/* Word of the Day Card (Aesthetic screenshot friendly) */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-[0_4px_0_0_#fcd34d] text-center overflow-hidden">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200 border border-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Word of the Day</span>
            </div>

            <h3 className="text-lg font-black text-amber-950 italic">
              "{meeting.word_of_the_day || 'Break a leg!'}"
            </h3>

            <p className="text-xs font-bold text-amber-800 mt-2 leading-relaxed">
              {meeting.word_meaning || 'Idiom yang digunakan untuk mendoakan seseorang agar sukses dan memberikan performa terbaik.'}
            </p>

            <div className="mt-3 pt-2 border-t border-amber-200 flex items-center justify-center gap-1 text-[11px] font-extrabold text-amber-700">
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagus buat quote status WhatsApp kamu! 📸</span>
            </div>
          </div>

          {/* Close Button */}
          <TactileButton
            variant="brand"
            size="md"
            onClick={onClose}
            className="w-full py-3 text-base"
          >
            Selesai & Tutup
          </TactileButton>
        </div>
      </div>
    </div>
  );
};
