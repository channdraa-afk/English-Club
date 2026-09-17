import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  KeyRound, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  HeartHandshake
} from 'lucide-react';
import { Member, Meeting, Attendance } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';
import confetti from 'canvas-confetti';

interface MentorAttendanceProps {
  members: Member[];
  activeMeeting: Meeting | null;
  attendances: Attendance[];
  mentorToken?: string;
  onAttendanceChanged: () => void;
}

export const MentorAttendance: React.FC<MentorAttendanceProps> = ({
  members,
  activeMeeting,
  attendances,
  mentorToken = 'CREW20',
  onAttendanceChanged,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Member | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [mood, setMood] = useState<'super_fun' | 'okay' | 'boring'>('super_fun');
  const [issues, setIssues] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successRecorded, setSuccessRecorded] = useState(false);

  // Filter Angkatan 20 mentors (59 members)
  const a20Mentors = useMemo(() => {
    return members.filter((m) => m.generation === 20 && m.status === 'active');
  }, [members]);

  // Attendances for current meeting
  const currentMeetingAttendances = useMemo(() => {
    if (!activeMeeting) return [];
    return attendances.filter((a) => a.meeting_id === activeMeeting.id);
  }, [attendances, activeMeeting]);

  const attendedMentorSet = useMemo(() => {
    return new Set(currentMeetingAttendances.map((a) => a.member_id));
  }, [currentMeetingAttendances]);

  // Autocomplete matching
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return a20Mentors
      .filter((m) => m.name.toLowerCase().includes(q) || m.position.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, a20Mentors]);

  // Check if selected mentor already attended
  const isSelectedAlreadyAttended = useMemo(() => {
    if (!selectedMentor) return false;
    return attendedMentorSet.has(selectedMentor.id);
  }, [selectedMentor, attendedMentorSet]);

  const handleSelectMentor = (m: Member) => {
    sound.playPop();
    setSelectedMentor(m);
    setSearchQuery('');
    setErrorMessage(null);
    setSuccessRecorded(false);
  };

  const handleResetMentor = () => {
    sound.playPop();
    setSelectedMentor(null);
    setSearchQuery('');
    setSuccessRecorded(false);
  };

  // Submit self-attendance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeMeeting) {
      sound.playError();
      setErrorMessage('Belum ada pertemuan eskul aktif saat ini!');
      return;
    }

    if (!selectedMentor) {
      sound.playError();
      setErrorMessage('Silakan cari dan pilih namamu terlebih dahulu!');
      return;
    }

    const cleanInput = tokenInput.trim().toUpperCase();
    const cleanExpected = mentorToken.trim().toUpperCase();

    // Check if mentor accidentally typed student token
    if (cleanInput === activeMeeting.token.trim().toUpperCase() && cleanInput !== cleanExpected) {
      sound.playError();
      setErrorMessage('Ini token adik kelas! Masukkan Token Khusus Pengurus A20 yaa.');
      return;
    }

    if (cleanInput !== cleanExpected) {
      sound.playError();
      setErrorMessage('Token Khusus Pengurus salah! Tanyakan token ini ke Ketua / BPH.');
      return;
    }

    setIsLoading(true);

    try {
      // Check duplicate
      const { data: existing } = await supabase
        .from('attendances')
        .select('id')
        .eq('meeting_id', activeMeeting.id)
        .eq('member_id', selectedMentor.id)
        .maybeSingle();

      if (existing) {
        sound.playError();
        setErrorMessage('Kamu sudah tercatat hadir di pertemuan ini!');
        return;
      }

      // Record attendance + curhat
      const { error } = await supabase.from('attendances').insert({
        meeting_id: activeMeeting.id,
        member_id: selectedMentor.id,
        feedback_rating: mood,
        critique: issues.trim() || null,
        next_agenda_suggestion: suggestions.trim() || null,
        is_anonymous: isAnonymous,
      });

      if (error) throw error;

      sound.playSuccess();
      setSuccessRecorded(true);
      setTokenInput('');
      setIssues('');
      setSuggestions('');
      
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#dc2626', '#f59e0b', '#10b981'],
      });

      onAttendanceChanged();
    } catch (err: any) {
      console.error('Error submitting mentor attendance:', err);
      sound.playError();
      setErrorMessage('Gagal mencatat presensi: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-700 shadow-[0_6px_0_0_#312e81] space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-2xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
            <HeartHandshake className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
              Presensi Mandiri Pengurus
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Presensi & Curhat Sesi — Angkatan 20
            </h2>
          </div>
        </div>

        <p className="text-xs font-bold text-indigo-100/90 leading-relaxed max-w-xl">
          Sesi ini khusus untuk 59 pengurus Angkatan 20. Masukkan <strong>Token Khusus Pengurus</strong> yang dibagikan Ketua/BPH, 
          dan bagikan evaluasi/unek-unek riil eskul hari ini secara jujur!
        </p>

        <div className="flex items-center gap-2 pt-1 text-xs font-bold text-indigo-200">
          <span>Sesi: <strong>{activeMeeting ? activeMeeting.title : 'Pertemuan Aktif'}</strong></span>
          <span>•</span>
          <span>Pengurus Hadir: <strong>{attendedMentorSet.size} / {a20Mentors.length}</strong></span>
        </div>
      </div>

      {/* Main Attendance Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#e2e8f0] p-6 space-y-5">
        {/* Step 1: Member Selector */}
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
            1. Cari & Pilih Namamu (Pengurus A20)
          </label>

          {selectedMentor ? (
            <div className="flex items-center justify-between p-3.5 bg-indigo-50 border-2 border-indigo-300 rounded-2xl shadow-sm">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900">{selectedMentor.name}</h3>
                  <span className="px-2 py-0.2 rounded-md bg-indigo-200 text-indigo-950 text-[10px] font-black">
                    {selectedMentor.class_name}
                  </span>
                </div>
                <p className="text-xs font-bold text-indigo-700">{selectedMentor.position}</p>
              </div>

              <button
                type="button"
                onClick={handleResetMentor}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black transition-colors"
              >
                Ganti
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik minimal 2 huruf namamu (misal: Chandra, Kevin, Prisa)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
              />

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-2xl shadow-xl overflow-hidden z-20">
                  {searchResults.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMentor(m)}
                      className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-indigo-50/70 border-b border-slate-100 last:border-b-0 transition-colors"
                    >
                      <div>
                        <span className="text-xs font-black text-slate-900">{m.name}</span>
                        <p className="text-[11px] text-slate-500 font-bold">{m.position}</p>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {m.class_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* If already attended message */}
        {isSelectedAlreadyAttended && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="block font-black text-emerald-900">Kamu Sudah Tercatat Hadir!</strong>
              <span className="font-bold text-emerald-800">
                Terima kasih sudah bertugas di eskul hari ini. Presensimu sudah aman di kuota bulanan.
              </span>
            </div>
          </div>
        )}

        {/* If successfully just submitted */}
        {successRecorded && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white flex items-center gap-3 animate-fade-in shadow-[0_4px_0_0_#047857]">
            <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
            <div>
              <strong className="block font-black text-sm">Presensi & Curhat Berhasil Dikirim!</strong>
              <p className="text-xs text-emerald-100 font-bold">
                Unek-unek dan evaluasimu sudah tersimpan di brankas ketua. Terima kasih dedikasinya!
              </p>
            </div>
          </div>
        )}

        {/* Form only shown if mentor selected and hasn't attended yet */}
        {selectedMentor && !isSelectedAlreadyAttended && !successRecorded && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            {/* Step 2: Token Pengurus */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                2. Masukkan Token Khusus Pengurus
              </label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Token rahasia pengurus..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-black tracking-widest text-slate-900 uppercase focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-bold mt-1">
                * Tanyakan kode ini ke Ketua / BPH saat eskul berlangsung.
              </p>
            </div>

            {/* Step 3: Curhat & Evaluasi */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>3. Gimana Kondisi & Kelancaran Eskul Hari Ini?</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setMood('super_fun');
                    }}
                    className={`p-2.5 rounded-xl border-2 text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      mood === 'super_fun'
                        ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-[0_2px_0_0_#f59e0b]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-xl">🤩</span>
                    <span>Lancar Banget</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setMood('okay');
                    }}
                    className={`p-2.5 rounded-xl border-2 text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      mood === 'okay'
                        ? 'bg-blue-100 border-blue-400 text-blue-950 shadow-[0_2px_0_0_#3b82f6]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-xl">👍</span>
                    <span>Cukup Baik</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setMood('boring');
                    }}
                    className={`p-2.5 rounded-xl border-2 text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      mood === 'boring'
                        ? 'bg-rose-100 border-rose-400 text-rose-950 shadow-[0_2px_0_0_#ef4444]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-xl">⚠️</span>
                    <span>Banyak Kendala</span>
                  </button>
                </div>
              </div>

              {/* Unek-unek kendala */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Unek-unek atau Masalah Riil yang Terjadi Tadi:
                </label>
                <textarea
                  value={issues}
                  onChange={(e) => setIssues(e.target.value)}
                  rows={2}
                  placeholder="Jujur aja, apa yang bikin ribet tadi? (Adik kelas susah diatur, mic mati, rundown molor, anggota sie kurang orang)..."
                  className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Saran minggu depan */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Saran / Solusi untuk Pertemuan Minggu Depan:
                </label>
                <input
                  type="text"
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="Misal: minggu depan bawa speaker cadangan, games diubah..."
                  className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Anonymous Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-600 select-none">
                  Kirim unek-unek secara anonim (Nama dirahasiakan dari kotak curhat)
                </span>
              </label>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <TactileButton
              type="submit"
              disabled={isLoading || !tokenInput.trim()}
              variant="brand"
              size="lg"
              className="w-full py-3 text-sm"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>KIRIM PRESENSI & EVALUASI</span>
            </TactileButton>
          </form>
        )}
      </div>

      {/* List of mentors who attended today */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Pengurus yang Sudah Hadir Hari Ini</span>
          </h3>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
            {attendedMentorSet.size} Orang
          </span>
        </div>

        {attendedMentorSet.size === 0 ? (
          <p className="text-xs font-bold text-slate-400 py-4 text-center">
            Belum ada pengurus yang mengisi presensi hari ini.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {a20Mentors
              .filter((m) => attendedMentorSet.has(m.id))
              .map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between"
                >
                  <div className="truncate">
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {mentor.name}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 truncate">
                      {mentor.position}
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 shrink-0 ml-1">
                    ✓ Hadir
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
