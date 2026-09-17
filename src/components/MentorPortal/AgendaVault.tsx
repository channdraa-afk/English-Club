import React, { useState, useMemo } from 'react';
import { Sparkles, MessageSquareHeart, User, HeartHandshake, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Attendance, Member, Meeting } from '../../types/database';
import { sound } from '../../lib/audio';

interface AgendaVaultProps {
  attendances: Attendance[];
  members: Member[];
  activeMeeting: Meeting | null;
  isSuperAdmin?: boolean;
}

export const AgendaVault: React.FC<AgendaVaultProps> = ({
  attendances,
  members,
  activeMeeting,
  isSuperAdmin = false,
}) => {
  const [activeGroup, setActiveGroup] = useState<'a21' | 'a20'>('a21');

  const memberMap = useMemo(() => {
    return new Map(members.map((m) => [m.id, m]));
  }, [members]);

  // Separate attendances by generation
  const a21Feedbacks = useMemo(() => {
    return attendances
      .filter((a) => {
        const m = memberMap.get(a.member_id);
        return m?.generation === 21 && (a.next_agenda_suggestion || a.critique || a.feedback_rating);
      })
      .map((a) => {
        const m = memberMap.get(a.member_id);
        return {
          ...a,
          memberName: a.is_anonymous ? 'Adik Kelas (Anonim)' : m?.name || 'Siswa',
          memberClass: a.is_anonymous ? 'Rahasia' : m?.class_name || '-',
          memberPosition: 'Angkatan 21',
        };
      })
      .reverse();
  }, [attendances, memberMap]);

  const a20Curhats = useMemo(() => {
    return attendances
      .filter((a) => {
        const m = memberMap.get(a.member_id);
        return m?.generation === 20 && (a.next_agenda_suggestion || a.critique || a.feedback_rating);
      })
      .map((a) => {
        const m = memberMap.get(a.member_id);
        return {
          ...a,
          memberName: a.is_anonymous ? 'Pengurus (Anonim)' : m?.name || 'Pengurus',
          memberClass: a.is_anonymous ? 'Rahasia' : m?.class_name || '-',
          memberPosition: m?.position || 'Pengurus A20',
        };
      })
      .reverse();
  }, [attendances, memberMap]);

  const currentList = activeGroup === 'a20' ? a20Curhats : a21Feedbacks;

  // Ratings count for selected group
  const ratingCounts = useMemo(() => {
    let fun = 0;
    let ok = 0;
    let boring = 0;
    currentList.forEach((a) => {
      if (a.feedback_rating === 'super_fun') fun++;
      else if (a.feedback_rating === 'okay') ok++;
      else if (a.feedback_rating === 'boring') boring++;
    });
    return { fun, ok, boring, total: currentList.length };
  }, [currentList]);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      {isSuperAdmin ? (
        <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-3xl border-2 border-slate-200 shadow-sm">
          <button
            onClick={() => {
              sound.playPop();
              setActiveGroup('a21');
            }}
            className={`py-3 px-4 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 ${
              activeGroup === 'a21'
                ? 'bg-blue-600 text-white border-blue-800 shadow-[0_3px_0_0_#1e3a8a]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Aspirasi Adik Kelas A21 ({a21Feedbacks.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveGroup('a20');
            }}
            className={`py-3 px-4 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 ${
              activeGroup === 'a20'
                ? 'bg-indigo-900 text-white border-indigo-950 shadow-[0_3px_0_0_#1e1b4b]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-indigo-300" />
            <span>Kotak Curhat & Evaluasi A20 ({a20Curhats.length})</span>
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-2 border-blue-900 shadow-[0_4px_0_0_#1e3a8a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/20 text-white">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                Suara & Masukan Lapangan
              </span>
              <h3 className="text-lg font-black leading-tight">
                Aspirasi & Ulasan Adik Kelas (Angkatan 21)
              </h3>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-white/20 text-white border border-white/30">
            {a21Feedbacks.length} Respon
          </span>
        </div>
      )}

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-[0_4px_0_0_#fcd34d] text-center">
          <span className="text-2xl">🤩</span>
          <h4 className="text-xl font-black text-amber-950 mt-1">{ratingCounts.fun}</h4>
          <p className="text-xs font-black text-amber-800">
            {activeGroup === 'a20' ? 'Lancar Banget' : 'Super Fun!'}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-blue-50 border-2 border-blue-300 shadow-[0_4px_0_0_#93c5fd] text-center">
          <span className="text-2xl">👍</span>
          <h4 className="text-xl font-black text-blue-950 mt-1">{ratingCounts.ok}</h4>
          <p className="text-xs font-black text-blue-800">
            {activeGroup === 'a20' ? 'Cukup Kondusif' : 'Okay'}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-[0_4px_0_0_#fca5a5] text-center">
          <span className="text-2xl">⚠️</span>
          <h4 className="text-xl font-black text-rose-950 mt-1">{ratingCounts.boring}</h4>
          <p className="text-xs font-black text-rose-800">
            {activeGroup === 'a20' ? 'Banyak Kendala' : 'Boring / Kurang'}
          </p>
        </div>
      </div>

      {/* Message Cards List */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              {activeGroup === 'a20' ? (
                <>
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  <span>Unek-Unek & Laporan Kendala Pengurus A20</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>Ide "Next Agenda" & Usulan Kegiatan A21</span>
                </>
              )}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              {activeMeeting ? `Sesi: ${activeMeeting.title}` : 'Semua masukan sesi'}
            </p>
          </div>

          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
            {currentList.length} Masukan
          </span>
        </div>

        {currentList.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquareHeart className="w-10 h-10 mx-auto opacity-40 mb-2" />
            <p className="text-xs font-bold">
              {activeGroup === 'a20'
                ? 'Belum ada unek-unek yang masuk dari pengurus untuk sesi ini.'
                : 'Belum ada saran atau ide kegiatan dari adik kelas.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
            {currentList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 shadow-sm space-y-2.5 ${
                  activeGroup === 'a20'
                    ? 'bg-slate-50 border-indigo-100'
                    : 'bg-slate-50 border-slate-200'
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
                    {item.feedback_rating === 'super_fun' && '🤩'}
                    {item.feedback_rating === 'okay' && '👍'}
                    {item.feedback_rating === 'boring' && '⚠️'}
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
                  <div className="p-3 rounded-xl bg-white border border-rose-200 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      <span>{activeGroup === 'a20' ? 'Unek-unek / Masalah Lapangan:' : 'Kritik & Masukan:'}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      "{item.critique}"
                    </p>
                  </div>
                )}

                {/* Next Agenda / Suggestion */}
                {item.next_agenda_suggestion && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
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
