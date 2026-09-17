import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  RefreshCw, 
  Dices, 
  Clock, 
  Zap
} from 'lucide-react';
import { Meeting } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';
import { getScheduleStatus } from '../../lib/schedule';

interface MeetingControlProps {
  activeMeeting: Meeting | null;
  mentorToken: string;
  onMentorTokenUpdated: (newTok: string) => void;
  isManualBypass: boolean;
  onToggleManualBypass: (state: boolean) => void;
  onMeetingUpdated: () => void;
  isRegistrationOpen: boolean;
  onToggleRegistration: (newState: boolean) => void;
  currentPin: string;
  onPinUpdated: (newPin: string) => void;
}

export const MeetingControl: React.FC<MeetingControlProps> = ({
  activeMeeting,
  mentorToken,
  onMentorTokenUpdated,
  isManualBypass,
  onToggleManualBypass,
  onMeetingUpdated,
  isRegistrationOpen,
  onToggleRegistration,
  currentPin,
  onPinUpdated,
}) => {
  // New / Edit Meeting state
  const [title, setTitle] = useState(activeMeeting?.title || 'Weekly English Gathering');
  const [token, setToken] = useState(activeMeeting?.token || 'EAGLE21');
  const [mentorTokenInput, setMentorTokenInput] = useState(mentorToken || 'CREW20');
  const [word, setWord] = useState(activeMeeting?.word_of_the_day || 'Piece of cake (Sangat mudah)');
  const [meaning, setMeaning] = useState(activeMeeting?.word_meaning || 'Idiom yang digunakan saat sesuatu terasa sangat mudah diselesaikan.');
  const [isHoliday, setIsHoliday] = useState(Boolean(activeMeeting?.is_holiday));
  const [holidayReason, setHolidayReason] = useState(activeMeeting?.holiday_reason || '');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PIN settings state
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const sampleStudentTokens = ['EAGLE21', 'SPEAK21', 'SMART21', 'VOCA21', 'BRAVO21', 'SUPER21'];
  const sampleMentorTokens = ['LEAD20', 'CREW20', 'MENTOR20', 'COMMAND20', 'SMEGA20'];

  const scheduleStatus = getScheduleStatus(activeMeeting, isManualBypass);

  useEffect(() => {
    setMentorTokenInput(mentorToken);
  }, [mentorToken]);

  const handleRandomStudentToken = () => {
    sound.playPop();
    const rand = sampleStudentTokens[Math.floor(Math.random() * sampleStudentTokens.length)];
    setToken(rand);
  };

  const handleRandomMentorToken = () => {
    sound.playPop();
    const rand = sampleMentorTokens[Math.floor(Math.random() * sampleMentorTokens.length)];
    setMentorTokenInput(rand);
  };

  const handleToggleHoliday = async () => {
    if (!activeMeeting) return;
    sound.playPop();
    const nextState = !isHoliday;
    let reason = holidayReason;
    if (nextState && !reason.trim()) {
      reason = 'Libur Kegiatan / Ujian Sekolah';
      setHolidayReason(reason);
    }
    setIsHoliday(nextState);

    await supabase
      .from('meetings')
      .update({
        is_holiday: nextState,
        holiday_reason: nextState ? reason : null,
      })
      .eq('id', activeMeeting.id);

    onMeetingUpdated();
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);

    try {
      if (activeMeeting) {
        // Update existing meeting
        const { error } = await supabase
          .from('meetings')
          .update({
            title: title.trim(),
            token: token.trim().toUpperCase(),
            word_of_the_day: word.trim(),
            word_meaning: meaning.trim(),
            is_holiday: isHoliday,
            holiday_reason: isHoliday ? holidayReason.trim() : null,
            is_active: true,
          })
          .eq('id', activeMeeting.id);

        if (error) throw error;
      } else {
        // Create new meeting
        const { error } = await supabase.from('meetings').insert({
          meeting_date: new Date().toISOString().split('T')[0],
          title: title.trim(),
          token: token.trim().toUpperCase(),
          word_of_the_day: word.trim(),
          word_meaning: meaning.trim(),
          is_holiday: isHoliday,
          holiday_reason: isHoliday ? holidayReason.trim() : null,
          is_active: true,
        });

        if (error) throw error;
      }

      // Save mentor token to app_settings
      const cleanMentorTok = mentorTokenInput.trim().toUpperCase();
      await supabase
        .from('app_settings')
        .upsert({ key: 'mentor_token', value: cleanMentorTok });
      onMentorTokenUpdated(cleanMentorTok);

      sound.playSuccess();
      setSuccessMsg('Sesi pertemuan & kedua token berhasil disimpan!');
      onMeetingUpdated();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Error saving meeting:', err);
      sound.playError();
      alert('Gagal menyimpan sesi: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.length < 4) return;
    sound.playPop();

    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'mentor_pin', value: newPin.trim() });

    if (!error) {
      onPinUpdated(newPin.trim());
      setNewPin('');
      setPinSuccess(true);
      setTimeout(() => setPinSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Schedule Automation Banner */}
      <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h4 className="font-black text-slate-900 text-sm">Jadwal Operasional Otomatis</h4>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
              Rabu 15:40 - 17:30 WIB
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500">
            Status: <span className={`font-black ${
              scheduleStatus.badgeColor === 'emerald' ? 'text-emerald-600' :
              scheduleStatus.badgeColor === 'amber' ? 'text-amber-600' :
              scheduleStatus.badgeColor === 'rose' ? 'text-rose-600' : 'text-slate-600'
            }`}>{scheduleStatus.statusText}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playPop();
            onToggleManualBypass(!isManualBypass);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs border transition-all cursor-pointer ${
            isManualBypass
              ? 'bg-amber-500 text-white border-amber-700 shadow-[0_2px_0_0_#b45309]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isManualBypass ? 'Bypass Manual: AKTIF' : 'Bypass Jadwal (Uji Coba)'}</span>
        </button>
      </div>

      {/* Dual Active Token Hero Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border-2 border-slate-700 shadow-[0_6px_0_0_#0f172a] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-800">
              Token Presensi Hari Ini
            </span>
            <h3 className="text-base font-black text-white mt-1">
              {activeMeeting ? activeMeeting.title : 'Weekly Gathering'}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleToggleHoliday}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs border transition-all cursor-pointer ${
              isHoliday
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-700 shadow-[0_3px_0_0_#b45309]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            } active:translate-y-0.5`}
          >
            <span>{isHoliday ? '🏖️ Status: LIBUR' : '🌴 Set Pertemuan Libur'}</span>
          </button>
        </div>

        {/* Dual Tokens Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Token Siswa (A21) */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              1. Token Siswa (Adik Kelas A21)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-wider">
              {activeMeeting?.is_active ? activeMeeting.token : 'NONAKTIF'}
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              Tuliskan kode ini di papan tulis kelas untuk adik kelas.
            </p>
          </div>

          {/* Token Khusus Pengurus (A20) */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              2. Token Khusus Pengurus (Kakak Kelas A20)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-wider">
              {activeMeeting?.is_active ? mentorToken : 'NONAKTIF'}
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              Token rahasia yang dibisikkan/diumumkan setelah eskul mulai.
            </p>
          </div>
        </div>
      </div>

      {/* Form Setup Pertemuan */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-6">
        <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Atur Sesi Pertemuan & Token</span>
        </h3>

        {isHoliday && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-1.5">
            <label className="block text-xs font-black text-amber-900 uppercase tracking-wider">
              Alasan Pertemuan Libur (Ditampilkan ke Siswa)
            </label>
            <input
              type="text"
              value={holidayReason}
              onChange={(e) => setHolidayReason(e.target.value)}
              placeholder="Contoh: Libur Ujian Tengah Semester (PTS) / Tanggal Merah"
              className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>
        )}

        <form onSubmit={handleSaveMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Judul Sesi Pertemuan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly English Gathering #1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-slate-800 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Token Siswa */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Token Siswa (Papan Tulis)
                </label>
                <button
                  type="button"
                  onClick={handleRandomStudentToken}
                  className="flex items-center gap-1 text-[11px] font-black text-emerald-600 hover:text-emerald-700"
                >
                  <Dices className="w-3 h-3" />
                  <span>Acak</span>
                </button>
              </div>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                placeholder="EAGLE21"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-black tracking-wider text-slate-900 uppercase focus:bg-white focus:border-slate-800 focus:outline-none"
              />
            </div>

            {/* Input Token Pengurus */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Token Khusus Pengurus A20
                </label>
                <button
                  type="button"
                  onClick={handleRandomMentorToken}
                  className="flex items-center gap-1 text-[11px] font-black text-amber-600 hover:text-amber-700"
                >
                  <Dices className="w-3 h-3" />
                  <span>Acak</span>
                </button>
              </div>
              <input
                type="text"
                value={mentorTokenInput}
                onChange={(e) => setMentorTokenInput(e.target.value.toUpperCase())}
                placeholder="LEAD20"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-black tracking-wider text-amber-900 uppercase focus:bg-white focus:border-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Word of the Day (Idiom / Quote)
              </label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Break a leg! (Semoga sukses!)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Arti & Penjelasan Idiom
              </label>
              <input
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Arti singkat dalam bahasa Indonesia..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <TactileButton
              type="submit"
              variant="brand"
              size="md"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan Sesi & Kedua Token</span>
                </>
              )}
            </TactileButton>
          </div>
        </form>
      </div>

      {/* Global Club Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Toggle Pendaftaran */}
        <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] flex items-center justify-between">
          <div>
            <h4 className="font-black text-slate-900 text-sm">Pendaftaran Anggota Baru</h4>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Status: <span className={isRegistrationOpen ? 'text-emerald-600 font-black' : 'text-slate-500 font-bold'}>
                {isRegistrationOpen ? 'DIBUKA' : 'DITUTUP'}
              </span>
            </p>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onToggleRegistration(!isRegistrationOpen);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
              isRegistrationOpen
                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {isRegistrationOpen ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}
          </button>
        </div>

        {/* Ubah PIN Akses Mentor */}
        <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0]">
          <h4 className="font-black text-slate-900 text-sm mb-1">Ganti PIN Portal Mentor</h4>
          <p className="text-[11px] font-bold text-slate-400 mb-3">
            PIN saat ini: <span className="font-mono font-black text-slate-700">{currentPin}</span>
          </p>

          <form onSubmit={handleChangePin} className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="PIN Baru..."
              className="flex-1 px-3 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-slate-800 focus:outline-none"
            />
            <button
              type="submit"
              disabled={newPin.length < 4}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-colors"
            >
              Simpan
            </button>
          </form>

          {pinSuccess && (
            <p className="text-[10px] font-black text-emerald-600 mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" /> PIN berhasil diperbarui!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
