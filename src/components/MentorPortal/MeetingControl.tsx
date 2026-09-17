import React, { useState } from 'react';
import { Sparkles, ToggleLeft, ToggleRight, Check, RefreshCw, Dices, Lock } from 'lucide-react';
import { Meeting } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';

interface MeetingControlProps {
  activeMeeting: Meeting | null;
  onMeetingUpdated: () => void;
  isRegistrationOpen: boolean;
  onToggleRegistration: (newState: boolean) => void;
  currentPin: string;
  onPinUpdated: (newPin: string) => void;
}

export const MeetingControl: React.FC<MeetingControlProps> = ({
  activeMeeting,
  onMeetingUpdated,
  isRegistrationOpen,
  onToggleRegistration,
  currentPin,
  onPinUpdated,
}) => {
  // New / Edit Meeting state
  const [title, setTitle] = useState(activeMeeting?.title || 'Weekly English Gathering');
  const [token, setToken] = useState(activeMeeting?.token || 'EAGLE21');
  const [word, setWord] = useState(activeMeeting?.word_of_the_day || 'Piece of cake (Sangat mudah)');
  const [meaning, setMeaning] = useState(activeMeeting?.word_meaning || 'Idiom yang digunakan saat sesuatu terasa sangat mudah diselesaikan.');
  const [isHoliday, setIsHoliday] = useState(Boolean(activeMeeting?.is_holiday));
  const [holidayReason, setHolidayReason] = useState(activeMeeting?.holiday_reason || '');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PIN settings state
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const sampleTokens = ['EAGLE21', 'SPEAK20', 'CHANDRA', 'SMART21', 'VOCA26', 'BRAVO21', 'SUPER21'];

  const handleRandomToken = () => {
    sound.playPop();
    const rand = sampleTokens[Math.floor(Math.random() * sampleTokens.length)];
    setToken(rand);
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

      sound.playSuccess();
      setSuccessMsg('Sesi pertemuan & token berhasil disimpan!');
      onMeetingUpdated();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error saving meeting:', err);
      sound.playError();
      alert('Gagal menyimpan sesi: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSessionActive = async () => {
    if (!activeMeeting) return;
    sound.playPop();
    const nextState = !activeMeeting.is_active;
    const { error } = await supabase
      .from('meetings')
      .update({ is_active: nextState })
      .eq('id', activeMeeting.id);

    if (!error) {
      onMeetingUpdated();
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.length < 4) return;
    sound.playPop();

    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'mentor_pin', value: JSON.stringify(newPin.trim()) });

    if (!error) {
      onPinUpdated(newPin.trim());
      setNewPin('');
      setPinSuccess(true);
      setTimeout(() => setPinSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Token Hero Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border-2 border-slate-700 shadow-[0_6px_0_0_#0f172a] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
            Token Papan Tulis Hari Ini
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-widest text-white font-mono">
            {activeMeeting?.is_active ? activeMeeting.token : 'NONAKTIF'}
          </h2>
          <p className="text-xs font-bold text-slate-400">
            {activeMeeting?.is_active
              ? 'Tuliskan kode di atas di papan tulis ruang EC untuk adik kelas.'
              : 'Sesi sedang ditutup. Aktifkan kembali di bawah saat pertemuan dimulai.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          {activeMeeting && (
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
          )}

          {activeMeeting && (
            <button
              type="button"
              onClick={handleToggleSessionActive}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs border transition-all cursor-pointer ${
                activeMeeting.is_active
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-800 shadow-[0_3px_0_0_#9f1239]'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-800 shadow-[0_3px_0_0_#15803d]'
              } active:translate-y-0.5`}
            >
              {activeMeeting.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              <span>{activeMeeting.is_active ? 'Tutup Sesi Ini' : 'Buka Kembali Sesi'}</span>
            </button>
          )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Judul / Topik Sesi
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Speaking Icebreaker & Games"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Token Papan Tulis
                </label>
                <button
                  type="button"
                  onClick={handleRandomToken}
                  className="flex items-center gap-1 text-[11px] font-black text-emerald-600 hover:text-emerald-700"
                >
                  <Dices className="w-3 h-3" />
                  <span>Acak Token</span>
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
                  <span>Simpan Perubahan Sesi</span>
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
              Status: <span className={isRegistrationOpen ? 'text-emerald-600' : 'text-slate-500'}>
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
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {isRegistrationOpen ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}
          </button>
        </div>

        {/* Ubah PIN Mentor */}
        <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0]">
          <h4 className="font-black text-slate-900 text-sm mb-1 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-slate-600" />
            <span>Ganti PIN Mentor (Saat ini: {currentPin})</span>
          </h4>
          <form onSubmit={handleChangePin} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="PIN Baru (min 4 digit)"
              maxLength={8}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 w-full focus:outline-none"
            />
            <TactileButton type="submit" variant="slate" size="sm" disabled={newPin.length < 4}>
              Ubah
            </TactileButton>
          </form>
          {pinSuccess && <p className="text-[11px] font-bold text-emerald-600 mt-1">PIN berhasil diubah!</p>}
        </div>
      </div>
    </div>
  );
};
