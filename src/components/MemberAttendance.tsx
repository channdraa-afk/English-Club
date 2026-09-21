import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, KeyRound, Sparkles, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Member, Meeting } from '../types/database';
import { TactileButton } from './TactileButton';
import { sound } from '../lib/audio';
import { supabase } from '../lib/supabase';
import { getScheduleStatus } from '../lib/schedule';

interface MemberAttendanceProps {
  members: Member[];
  activeMeeting: Meeting | null;
  isManualBypass?: boolean;
  onAttendanceSuccess: (member: Member, meeting: Meeting) => void;
}

export const MemberAttendance: React.FC<MemberAttendanceProps> = ({
  members,
  activeMeeting,
  isManualBypass = false,
  onAttendanceSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [rating, setRating] = useState<'boring' | 'okay' | 'super_fun'>('super_fun');
  const [nextAgenda, setNextAgenda] = useState('');
  const [critique, setCritique] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter only active Angkatan 21 students for student attendance
  const studentMembers = useMemo(() => {
    return members.filter((m) => m.generation === 21 && m.status === 'active');
  }, [members]);

  // Autocomplete search matching
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return studentMembers
      .filter((m) => m.name.toLowerCase().includes(q) || m.class_name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, studentMembers]);

  const handleSelectMember = (m: Member) => {
    sound.playPop();
    setSelectedMember(m);
    setSearchQuery('');
    setErrorMessage(null);
  };

  const handleResetMember = () => {
    sound.playPop();
    setSelectedMember(null);
    setSearchQuery('');
  };

  const scheduleStatus = useMemo(() => {
    return getScheduleStatus(activeMeeting, isManualBypass);
  }, [activeMeeting, isManualBypass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeMeeting) {
      sound.playError();
      setErrorMessage('Saat ini belum ada pertemuan aktif. Silakan hubungi kakak kelas / mentor!');
      return;
    }

    if (!scheduleStatus.isActive) {
      sound.playError();
      setErrorMessage(`Presensi saat ini tidak aktif: ${scheduleStatus.statusText}`);
      return;
    }

    if (!selectedMember) {
      sound.playError();
      setErrorMessage('Silakan cari dan pilih namamu terlebih dahulu!');
      return;
    }

    const cleanToken = tokenInput.trim().toUpperCase();
    if (!cleanToken) {
      sound.playError();
      setErrorMessage('Masukkan token yang tertulis di papan tulis!');
      return;
    }

    if (cleanToken !== activeMeeting.token.trim().toUpperCase()) {
      sound.playError();
      setErrorMessage('Token salah! Pastikan kamu menyalin huruf yang ada di papan tulis dengan benar.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if already attended
      const { data: existing, error: checkError } = await supabase
        .from('attendances')
        .select('id')
        .eq('meeting_id', activeMeeting.id)
        .eq('member_id', selectedMember.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        sound.playError();
        setErrorMessage(`Hai ${selectedMember.name}, kamu sudah mengisi presensi untuk pertemuan hari ini! ✨`);
        setIsLoading(false);
        return;
      }

      // 2. Insert attendance
      const { error: insertError } = await supabase.from('attendances').insert({
        meeting_id: activeMeeting.id,
        member_id: selectedMember.id,
        feedback_rating: rating,
        next_agenda_suggestion: nextAgenda.trim() || null,
        critique: critique.trim() || null,
        is_anonymous: isAnonymous,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique violation
          setErrorMessage('Kamu sudah tercatat absen untuk pertemuan ini!');
          sound.playError();
          setIsLoading(false);
          return;
        }
        throw insertError;
      }

      // Reset form
      setTokenInput('');
      setNextAgenda('');
      setCritique('');
      setSelectedMember(null);
      setIsLoading(false);

      // Trigger success celebration
      onAttendanceSuccess(selectedMember, activeMeeting);
    } catch (err: any) {
      console.error('Error submitting attendance:', err);
      sound.playError();
      setErrorMessage(err.message || 'Terjadi gangguan jaringan saat merekam presensi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">
      {/* Greeting Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-black mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Presensi Resmi Angkatan 21</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Welcome to English Club! 🇬🇧
        </h1>
        <p className="text-sm font-bold text-slate-500 mt-1">
          {activeMeeting 
            ? `Sesi Pertemuan: "${activeMeeting.title}"`
            : 'Silakan isi presensi kehadiranmu dengan token di papan tulis.'}
        </p>
      </div>

      {scheduleStatus.isHoliday ? (
        <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-[0_6px_0_0_#fcd34d] p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-600 border-2 border-amber-300 flex items-center justify-center text-3xl">
            🏖️
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              Pertemuan Hari Ini Libur
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {activeMeeting?.holiday_reason || 'Kegiatan English Club Ditiadakan'}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              Presensi ditiadakan dan tidak mempengaruhi persentase nilai kehadiranmu. Selamat beristirahat dan sampai jumpa di hari Rabu minggu depan! ✨
            </p>
          </div>
        </div>
      ) : !scheduleStatus.isActive ? (
        <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-[0_6px_0_0_#cbd5e1] p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 text-slate-600 border-2 border-slate-300 flex items-center justify-center text-3xl">
            ⏰
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-bold sm:font-black tracking-normal sm:tracking-wider border border-slate-200 max-w-xs sm:max-w-md mx-auto leading-snug">
              {scheduleStatus.statusText}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Presensi Angkatan 21 Sedang Ditutup
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-md mx-auto leading-relaxed">
              Sistem presensi resmi English Club SMEGA aktif secara otomatis setiap hari <span className="text-emerald-700 font-extrabold">Rabu pukul 15:40 – 17:30 WIB</span>. Di luar waktu tersebut, token otomatis kedaluwarsa demi menjaga validitas data.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 text-left max-w-md mx-auto space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
              <span className="text-base">💬</span>
              <span className="uppercase tracking-wider">English Club SMEGA Quote</span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-amber-950 leading-relaxed italic">
              "Jangan takut untuk mencoba ataupun salah bicara. Di English Club, setiap kesalahan adalah bukti kalau kamu berani melangkah maju. See you on Wednesday, let's learn, laugh, and grow together! 🌟"
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bypass Active Tactile Banner */}
          {isManualBypass && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center gap-3 shadow-[0_3px_0_0_#fcd34d] animate-fade-in">
              <span className="text-xl shrink-0">⚡</span>
              <div className="text-xs font-bold leading-tight">
                <span className="font-black text-amber-950 block sm:inline">Mode Uji Coba / Bypass Manual Aktif: </span>
                Pintu presensi dibuka oleh Ketua. Kamu dapat mengisi presensi dan mencoba simulasi eskul di luar jadwal resmi.
              </div>
            </div>
          )}

          {/* Main Attendance Card */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#e2e8f0] p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Pilih Nama Kamu */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              1. Cari & Pilih Namamu
            </label>

            {!selectedMember ? (
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik minimal 2 huruf namamu..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-blue-500 shadow-xl overflow-hidden z-20">
                    <div className="px-3 py-1.5 bg-blue-50 text-[11px] font-black text-blue-900 border-b border-blue-200">
                      Klik namamu untuk memilih:
                    </div>
                    {searchResults.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember(m)}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between border-b border-slate-100 last:border-none transition-colors group"
                      >
                        <span className="font-extrabold text-sm text-slate-800 group-hover:text-blue-700">
                          {m.name}
                        </span>
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-200 group-hover:text-blue-900">
                          {m.class_name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <p className="text-xs font-bold text-slate-400 mt-1.5 pl-1">
                    Nama tidak ditemukan di Angkatan 21. Cek ejaan atau hubungi pengurus.
                  </p>
                )}
              </div>
            ) : (
              /* Selected Member Card */
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 shadow-[0_3px_0_0_#86efac]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{selectedMember.name}</h4>
                    <p className="text-xs font-bold text-emerald-800">{selectedMember.class_name} • Angkatan 21</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetMember}
                  className="text-xs font-black text-slate-500 hover:text-rose-600 px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-rose-300 shadow-sm transition-colors"
                >
                  Ganti
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: Token Papan Tulis */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                2. Token di Papan Tulis
              </label>
              <span className="text-[11px] font-bold text-slate-400">Tanyakan mentor jika belum ada</span>
            </div>
            <div className="relative flex items-center">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="CONTOH: EAGLE21"
                maxLength={10}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-black text-slate-900 tracking-wider placeholder:tracking-normal placeholder:text-slate-400 placeholder:font-bold focus:bg-white focus:border-emerald-500 focus:outline-none uppercase transition-colors"
              />
            </div>
          </div>

          {/* STEP 3: Kepuasan Hari Ini (3 Emotikon Taktil) */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              3. Bagaimana Kegiatan Hari Ini?
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'boring', label: 'Boring', icon: '😴', desc: 'Kurang seru' },
                { id: 'okay', label: 'Okay', icon: '👍', desc: 'Lumayan' },
                { id: 'super_fun', label: 'Super Fun!', icon: '🔥', desc: 'Seru banget!' },
              ].map((opt) => {
                const active = rating === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setRating(opt.id as any);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 select-none transition-all duration-75 cursor-pointer ${
                      active
                        ? 'bg-emerald-100 border-emerald-600 shadow-[0_4px_0_0_#15803d] translate-y-0'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-[0_3px_0_0_#cbd5e1] active:translate-y-1'
                    }`}
                  >
                    <span className="text-2xl mb-1">{opt.icon}</span>
                    <span className="text-xs font-black text-slate-900">{opt.label}</span>
                    <span className="text-[10px] font-bold text-slate-500">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Next Agenda Mau Ngapain? */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              4. Next Agenda Mau Ngapain? 💡
            </label>
            <input
              type="text"
              value={nextAgenda}
              onChange={(e) => setNextAgenda(e.target.value)}
              placeholder="Contoh: Movie session, Kahoot games, atau Speaking games..."
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* STEP 5: Kritik & Saran + Toggle Anonim */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                5. Kritik & Masukan Bebas (Opsional)
              </label>
              
              {/* Checkbox Anonim */}
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => {
                    sound.playPop();
                    setIsAnonymous(e.target.checked);
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-black text-slate-500">Kirim Anonim</span>
              </label>
            </div>
            <textarea
              value={critique}
              onChange={(e) => setCritique(e.target.value)}
              rows={2}
              placeholder="Ada materi yang kurang jelas atau masukan untuk kakak kelas?"
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-bounce-short">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <TactileButton
            type="submit"
            size="lg"
            variant="brand"
            disabled={isLoading || !selectedMember || !tokenInput}
            className="w-full py-4 text-lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Merekam Kehadiran...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>KIRIM ABSENSI SEKARANG</span>
              </>
            )}
          </TactileButton>
        </form>
      </div>
      </div>
      )}
    </div>
  );
};
