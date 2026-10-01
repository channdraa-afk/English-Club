import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, MessageSquareHeart, User, HeartHandshake, ShieldAlert, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { Attendance, Member, Meeting } from '../../types/database';
import { sound } from '../../lib/audio';

interface AgendaVaultProps {
  attendances: Attendance[];
  members: Member[];
  activeMeeting: Meeting | null;
  meetings?: Meeting[];
  isSuperAdmin?: boolean;
  initialGroup?: 'a21' | 'a20';
  lockGroup?: boolean;
}

export const AgendaVault: React.FC<AgendaVaultProps> = ({
  attendances,
  members,
  activeMeeting,
  meetings = [],
  isSuperAdmin = false,
  initialGroup = 'a21',
  lockGroup = false,
}) => {
  const [activeGroup, setActiveGroup] = useState<'a21' | 'a20'>(initialGroup);

  useEffect(() => {
    setActiveGroup(initialGroup);
  }, [initialGroup]);

  const memberMap = useMemo(() => {
    return new Map(members.map((m) => [m.id, m]));
  }, [members]);

  // Available meetings list sorted newest first
  const availableMeetings = useMemo(() => {
    const list = meetings && meetings.length > 0 ? meetings : (activeMeeting ? [activeMeeting] : []);
    return [...list].sort((a, b) => b.meeting_date.localeCompare(a.meeting_date));
  }, [meetings, activeMeeting]);

  // Scalable 2-Pill Anchor: Primary (Active/Latest), Previous (Last Week), and Older Archives
  const { primaryMeeting, previousMeeting, olderMeetings } = useMemo(() => {
    const active = activeMeeting || (availableMeetings.length > 0 ? availableMeetings[0] : null);
    const remaining = availableMeetings.filter((m) => m.id !== active?.id);
    const prev = remaining.length > 0 ? remaining[0] : null;
    const older = remaining.slice(1);
    return { primaryMeeting: active, previousMeeting: prev, olderMeetings: older };
  }, [activeMeeting, availableMeetings]);

  // Session selector state: defaults to active meeting or the newest meeting
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(() => {
    return activeMeeting?.id || (availableMeetings.length > 0 ? availableMeetings[0].id : 'all');
  });

  const isOlderSelected = useMemo(() => {
    return olderMeetings.some((m) => m.id === selectedMeetingId);
  }, [olderMeetings, selectedMeetingId]);

  // Selected rating filter: 'all' | 'super_fun' | 'okay' | 'boring'
  const [selectedRating, setSelectedRating] = useState<'all' | 'super_fun' | 'okay' | 'boring'>('all');

  // Filter attendances by group and meeting_id
  const filteredGroupAttendances = useMemo(() => {
    return attendances.filter((a) => {
      const m = memberMap.get(a.member_id);
      const isSystemStatusMarker = a.critique === 'IZIN_SURAT_FISIK';
      if (isSystemStatusMarker) return false;

      // Group match
      const targetGen = activeGroup === 'a20' ? 20 : 21;
      if (m?.generation !== targetGen) return false;

      // Meeting match
      if (selectedMeetingId !== 'all' && a.meeting_id !== selectedMeetingId) return false;

      // Has feedback
      return Boolean(a.next_agenda_suggestion || a.critique || a.feedback_rating);
    });
  }, [attendances, memberMap, activeGroup, selectedMeetingId]);

  // Rating counts for current session/group
  const ratingCounts = useMemo(() => {
    let fun = 0;
    let ok = 0;
    let boring = 0;
    filteredGroupAttendances.forEach((a) => {
      if (a.feedback_rating === 'super_fun') fun++;
      else if (a.feedback_rating === 'okay') ok++;
      else if (a.feedback_rating === 'boring') boring++;
    });
    return { fun, ok, boring, total: filteredGroupAttendances.length };
  }, [filteredGroupAttendances]);

  // Final list filtered by selected rating
  const displayedList = useMemo(() => {
    return filteredGroupAttendances
      .filter((a) => {
        if (selectedRating === 'all') return true;
        return a.feedback_rating === selectedRating;
      })
      .map((a) => {
        const m = memberMap.get(a.member_id);
        return {
          ...a,
          memberName: a.is_anonymous
            ? (activeGroup === 'a20' ? 'Pengurus (Anonim)' : 'Adik Kelas (Anonim)')
            : m?.name || (activeGroup === 'a20' ? 'Pengurus' : 'Siswa'),
          memberClass: a.is_anonymous ? 'Rahasia' : m?.class_name || '-',
          memberPosition: m?.position || (activeGroup === 'a20' ? 'Pengurus A20' : 'Angkatan 21'),
        };
      })
      .reverse();
  }, [filteredGroupAttendances, selectedRating, memberMap, activeGroup]);

  const activeMeetingObj = useMemo(() => {
    if (selectedMeetingId === 'all') return null;
    return availableMeetings.find((m) => m.id === selectedMeetingId) || null;
  }, [availableMeetings, selectedMeetingId]);

  return (
    <div className="space-y-5">
      {/* Category Tabs (Khusus Super Admin jika tidak dikunci) */}
      {isSuperAdmin && !lockGroup && (
        <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-3xl border-2 border-slate-200 shadow-sm">
          <button
            onClick={() => {
              sound.playPop();
              setActiveGroup('a21');
            }}
            className={`py-3 px-4 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeGroup === 'a21'
                ? 'bg-blue-600 text-white border-blue-800 shadow-[0_3px_0_0_#1e3a8a]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Aspirasi Adik Kelas A21</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveGroup('a20');
            }}
            className={`py-3 px-4 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeGroup === 'a20'
                ? 'bg-indigo-900 text-white border-indigo-950 shadow-[0_3px_0_0_#1e1b4b]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-indigo-300" />
            <span>Kotak Curhat &amp; Evaluasi A20</span>
          </button>
        </div>
      )}

      {/* Top Hero Banner */}
      <div
        className={`p-5 sm:p-6 rounded-3xl text-white border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          activeGroup === 'a20'
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-700 shadow-[0_4px_0_0_#312e81]'
            : 'bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 border-blue-900 shadow-[0_4px_0_0_#1e3a8a]'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-white/20 text-white shrink-0">
            {activeGroup === 'a20' ? (
              <HeartHandshake className="w-6 h-6 text-indigo-300" />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-300" />
            )}
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-200 bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-400/30">
              {activeGroup === 'a20' ? 'Internal Angkatan 20' : 'Suara &amp; Masukan Lapangan'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black leading-tight mt-1">
              {activeGroup === 'a20'
                ? 'Curhat & Evaluasi Kendala Pengurus (A20)'
                : 'Aspirasi & Ulasan Adik Kelas (Angkatan 21)'}
            </h3>
            <p className="text-xs text-blue-100 font-bold mt-0.5">
              {activeMeetingObj
                ? `Menampilkan ulasan sesi: ${activeMeetingObj.title}`
                : 'Menampilkan akumulasi seluruh pertemuan semester ini'}
            </p>
          </div>
        </div>

        <div className="bg-white/10 border-2 border-white/20 rounded-2xl px-4 py-2 text-center self-start sm:self-auto shrink-0">
          <div className="text-2xl font-black text-amber-300">{filteredGroupAttendances.length}</div>
          <span className="text-[10px] font-black text-blue-100 uppercase tracking-wider">
            Total Respon Sesi Ini
          </span>
        </div>
      </div>

      {/* 📅 BILAH SELEKTOR SESI TAKTIL (PER-SESI EVALUATION COCKPIT) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Pilih Sesi Yang Ingin Dievaluasi
              </h4>
              <p className="text-[11px] font-bold text-slate-400">
                Pilih satu pertemuan agar ulasan tidak bercampur aduk
              </p>
            </div>
          </div>

          <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
            {selectedMeetingId === 'all'
              ? '🌐 Mode Kumulatif'
              : `📅 Sesi: ${activeMeetingObj?.title || 'Terpilih'}`}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Sesi Aktif / Sesi Terbaru */}
          {primaryMeeting && (
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setSelectedMeetingId(primaryMeeting.id);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 min-h-[44px] ${
                selectedMeetingId === primaryMeeting.id
                  ? 'bg-emerald-600 text-white shadow-[0_3px_0_0_#047857]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-200'
              }`}
            >
              <span>
                {primaryMeeting.is_active ? '🟢 Sesi Aktif' : '📁 Sesi Terbaru'} (
                {new Date(primaryMeeting.meeting_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
                )
              </span>
            </button>
          )}

          {/* 2. Sesi Pekan Lalu */}
          {previousMeeting && (
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setSelectedMeetingId(previousMeeting.id);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 min-h-[44px] ${
                selectedMeetingId === previousMeeting.id
                  ? 'bg-amber-500 text-white shadow-[0_3px_0_0_#b45309]'
                  : 'bg-amber-50/70 hover:bg-amber-100 text-amber-900 border-2 border-amber-200 shadow-[0_2px_0_0_#fde68a]'
              }`}
            >
              <span>
                📄 Pekan Lalu (
                {new Date(previousMeeting.meeting_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
                )
              </span>
            </button>
          )}

          {/* 3. Opsi Semua Sesi (Kumulatif) */}
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setSelectedMeetingId('all');
            }}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 min-h-[44px] ${
              selectedMeetingId === 'all'
                ? 'bg-indigo-900 text-white shadow-[0_3px_0_0_#1e1b4b]'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-2 border-slate-200'
            }`}
          >
            <span>🌐 Semua Sesi (Gabungan)</span>
          </button>

          {/* 4. Dropdown Arsip Sesi Lainnya */}
          {olderMeetings.length > 0 && (
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 transition-all min-h-[44px] ${
                isOlderSelected
                  ? 'bg-amber-500 text-white border-amber-600 shadow-[0_3px_0_0_#b45309]'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-[0_2px_0_0_#e2e8f0]'
              }`}
            >
              <Calendar className={`w-4 h-4 shrink-0 ${isOlderSelected ? 'text-white' : 'text-slate-500'}`} />
              <select
                value={isOlderSelected ? selectedMeetingId : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    sound.playPop();
                    setSelectedMeetingId(e.target.value);
                  }
                }}
                className={`bg-transparent text-xs sm:text-sm font-black focus:outline-none cursor-pointer max-w-[210px] truncate ${
                  isOlderSelected ? 'text-white font-black' : 'text-slate-800'
                }`}
              >
                <option value="" disabled className="text-slate-900 bg-white">
                  📁 Arsip Sesi Lainnya ({olderMeetings.length})...
                </option>
                {olderMeetings.map((m) => (
                  <option key={m.id} value={m.id} className="text-slate-900 bg-white">
                    {m.title} ({new Date(m.meeting_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 🎯 SUMMARY KPI CARDS: SEKALIGUS TOMBOL FILTER 1-KLIK ("BORING DOANG / OKAY DOANG") */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Klik Kartu Untuk Menyaring Masukan:</span>
          </span>
          {selectedRating !== 'all' && (
            <button
              onClick={() => {
                sound.playPop();
                setSelectedRating('all');
              }}
              className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
            >
              Reset ke Semua Ulasan ({ratingCounts.total})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Tab 0: Semua Respon */}
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setSelectedRating('all');
            }}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all active:translate-y-1 cursor-pointer ${
              selectedRating === 'all'
                ? 'bg-slate-900 border-slate-950 text-white shadow-[0_2px_0_0_#0f172a]'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-[0_4px_0_0_#e2e8f0]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">📋</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                selectedRating === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                Semua
              </span>
            </div>
            <h4 className={`text-2xl font-black mt-1 ${selectedRating === 'all' ? 'text-white' : 'text-slate-900'}`}>
              {ratingCounts.total}
            </h4>
            <p className={`text-xs font-black ${selectedRating === 'all' ? 'text-slate-200' : 'text-slate-500'}`}>
              Semua Ulasan
            </p>
          </button>

          {/* Tab 1: Super Fun */}
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setSelectedRating(selectedRating === 'super_fun' ? 'all' : 'super_fun');
            }}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all active:translate-y-1 cursor-pointer ${
              selectedRating === 'super_fun'
                ? 'bg-amber-100 border-amber-500 shadow-[0_2px_0_0_#b45309] ring-2 ring-amber-300'
                : 'bg-amber-50/70 border-amber-200 hover:border-amber-400 shadow-[0_4px_0_0_#fde68a]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🤩</span>
              {selectedRating === 'super_fun' && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-white">
                  ✓ Aktif
                </span>
              )}
            </div>
            <h4 className="text-2xl font-black text-amber-950 mt-1">{ratingCounts.fun}</h4>
            <p className="text-xs font-black text-amber-800">
              {activeGroup === 'a20' ? 'Lancar Banget' : 'Super Fun!'}
            </p>
          </button>

          {/* Tab 2: Okay */}
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setSelectedRating(selectedRating === 'okay' ? 'all' : 'okay');
            }}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all active:translate-y-1 cursor-pointer ${
              selectedRating === 'okay'
                ? 'bg-blue-100 border-blue-500 shadow-[0_2px_0_0_#1d4ed8] ring-2 ring-blue-300'
                : 'bg-blue-50/70 border-blue-200 hover:border-blue-400 shadow-[0_4px_0_0_#bfdbfe]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">👍</span>
              {selectedRating === 'okay' && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-600 text-white">
                  ✓ Aktif
                </span>
              )}
            </div>
            <h4 className="text-2xl font-black text-blue-950 mt-1">{ratingCounts.ok}</h4>
            <p className="text-xs font-black text-blue-800">
              {activeGroup === 'a20' ? 'Cukup Kondusif' : 'Okay'}
            </p>
          </button>

          {/* Tab 3: Boring / Kurang */}
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setSelectedRating(selectedRating === 'boring' ? 'all' : 'boring');
            }}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all active:translate-y-1 cursor-pointer ${
              selectedRating === 'boring'
                ? 'bg-rose-100 border-rose-500 shadow-[0_2px_0_0_#b91c1c] ring-2 ring-rose-300'
                : 'bg-rose-50/70 border-rose-200 hover:border-rose-400 shadow-[0_4px_0_0_#fecdd3]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">⚠️</span>
              {selectedRating === 'boring' && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white">
                  ✓ Aktif
                </span>
              )}
            </div>
            <h4 className="text-2xl font-black text-rose-950 mt-1">{ratingCounts.boring}</h4>
            <p className="text-xs font-black text-rose-800">
              {activeGroup === 'a20' ? 'Banyak Kendala' : 'Boring / Kurang'}
            </p>
          </button>
        </div>
      </div>

      {/* Message Cards List */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              {activeGroup === 'a20' ? (
                <>
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  <span>Unek-Unek &amp; Laporan Kendala Pengurus A20</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>Ide "Next Agenda" &amp; Usulan Kegiatan A21</span>
                </>
              )}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              {selectedRating === 'all'
                ? 'Menampilkan semua respon ulasan'
                : `Menyaring khusus respon: ${
                    selectedRating === 'boring'
                      ? '⚠️ Boring / Kurang'
                      : selectedRating === 'okay'
                      ? '👍 Okay'
                      : '🤩 Super Fun!'
                  }`}
            </p>
          </div>

          <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            {displayedList.length} Masukan Terfilter
          </span>
        </div>

        {displayedList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <MessageSquareHeart className="w-12 h-12 mx-auto opacity-30 text-indigo-400" />
            <p className="text-xs font-bold">
              {selectedRating !== 'all'
                ? `Tidak ada ulasan berstatus "${selectedRating}" untuk sesi ini.`
                : activeGroup === 'a20'
                ? 'Belum ada unek-unek yang masuk dari pengurus untuk sesi ini.'
                : 'Belum ada saran atau ide kegiatan dari adik kelas untuk sesi ini.'}
            </p>
            {selectedRating !== 'all' && (
              <button
                onClick={() => setSelectedRating('all')}
                className="text-xs font-black text-indigo-600 hover:underline cursor-pointer"
              >
                Lihat Semua Respon Sesi Ini
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {displayedList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 shadow-sm space-y-2.5 transition-all ${
                  item.feedback_rating === 'boring'
                    ? 'bg-rose-50/50 border-rose-200'
                    : item.feedback_rating === 'okay'
                    ? 'bg-blue-50/40 border-blue-200'
                    : 'bg-amber-50/30 border-amber-200'
                }`}
              >
                {/* Header Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-800 truncate">
                      {item.memberName}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      ({item.memberClass})
                    </span>
                  </div>

                  <span className="text-sm shrink-0">
                    {item.feedback_rating === 'super_fun' && '🤩 Super Fun'}
                    {item.feedback_rating === 'okay' && '👍 Okay'}
                    {item.feedback_rating === 'boring' && '⚠️ Boring'}
                  </span>
                </div>

                {/* Subtitle Role for A20 */}
                {activeGroup === 'a20' && (
                  <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200">
                    {item.memberPosition}
                  </span>
                )}

                {/* Issues / Critique */}
                {item.critique && (
                  <div className={`p-3 rounded-xl border space-y-1 ${
                    item.feedback_rating === 'boring'
                      ? 'bg-rose-100/70 border-rose-300'
                      : 'bg-white border-rose-200'
                  }`}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{activeGroup === 'a20' ? 'Unek-unek / Masalah Lapangan:' : 'Kritik & Masukan:'}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-900 leading-relaxed">
                      "{item.critique}"
                    </p>
                  </div>
                )}

                {/* Next Agenda / Suggestion */}
                {item.next_agenda_suggestion && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{activeGroup === 'a20' ? 'Saran Perbaikan Minggu Depan:' : 'Ide Next Agenda:'}</span>
                    </p>
                    <p className="text-xs font-bold text-amber-950 leading-relaxed">
                      "{item.next_agenda_suggestion}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
