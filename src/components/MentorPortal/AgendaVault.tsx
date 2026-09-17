import React, { useMemo } from 'react';
import { Sparkles, MessageSquareHeart, User } from 'lucide-react';
import { Attendance, Member, Meeting } from '../../types/database';

interface AgendaVaultProps {
  attendances: Attendance[];
  members: Member[];
  activeMeeting: Meeting | null;
}

export const AgendaVault: React.FC<AgendaVaultProps> = ({
  attendances,
  members,
  activeMeeting,
}) => {
  const memberMap = useMemo(() => {
    return new Map(members.map((m) => [m.id, m]));
  }, [members]);

  // Attendances with feedback or suggestions
  const feedbackItems = useMemo(() => {
    return attendances
      .filter((a) => a.next_agenda_suggestion || a.critique || a.feedback_rating)
      .map((a) => {
        const member = memberMap.get(a.member_id);
        return {
          ...a,
          memberName: a.is_anonymous ? 'Adik Kelas (Anonim)' : member?.name || 'Siswa',
          memberClass: a.is_anonymous ? 'Rahasia' : member?.class_name || '-',
        };
      })
      .reverse();
  }, [attendances, memberMap]);

  // Ratings count
  const ratingCounts = useMemo(() => {
    let fun = 0;
    let ok = 0;
    let boring = 0;
    attendances.forEach((a) => {
      if (a.feedback_rating === 'super_fun') fun++;
      else if (a.feedback_rating === 'okay') ok++;
      else if (a.feedback_rating === 'boring') boring++;
    });
    return { fun, ok, boring, total: attendances.length };
  }, [attendances]);

  return (
    <div className="space-y-6">
      {/* Reaction Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-[0_4px_0_0_#fcd34d] text-center">
          <span className="text-3xl">🔥</span>
          <h4 className="text-xl font-black text-amber-950 mt-1">{ratingCounts.fun}</h4>
          <p className="text-xs font-black text-amber-800">Super Fun!</p>
        </div>

        <div className="p-4 rounded-3xl bg-blue-50 border-2 border-blue-300 shadow-[0_4px_0_0_#93c5fd] text-center">
          <span className="text-3xl">👍</span>
          <h4 className="text-xl font-black text-blue-950 mt-1">{ratingCounts.ok}</h4>
          <p className="text-xs font-black text-blue-800">Okay</p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-100 border-2 border-slate-300 shadow-[0_4px_0_0_#cbd5e1] text-center">
          <span className="text-3xl">😴</span>
          <h4 className="text-xl font-black text-slate-900 mt-1">{ratingCounts.boring}</h4>
          <p className="text-xs font-black text-slate-600">Boring / Kurang</p>
        </div>
      </div>

      {/* Ideas and Critique Board */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Aspirasi Ide "Next Agenda" & Kritik Saran</span>
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              {activeMeeting ? `Sesi: ${activeMeeting.title}` : 'Koleksi usulan kegiatan selanjutnya langsung dari adik-adik kelas!'}
            </p>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
            {feedbackItems.length} Masukan
          </span>
        </div>

        {feedbackItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquareHeart className="w-10 h-10 mx-auto opacity-40 mb-2" />
            <p className="text-xs font-bold">Belum ada saran atau ide yang masuk untuk sesi ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {feedbackItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 shadow-sm space-y-2.5"
              >
                {/* Header Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-extrabold text-slate-800">{item.memberName}</span>
                    <span className="text-[10px] font-bold text-slate-400">({item.memberClass})</span>
                  </div>

                  <span className="text-xs">
                    {item.feedback_rating === 'super_fun' && '🔥'}
                    {item.feedback_rating === 'okay' && '👍'}
                    {item.feedback_rating === 'boring' && '😴'}
                  </span>
                </div>

                {/* Next Agenda Box */}
                {item.next_agenda_suggestion && (
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                      💡 Ide Next Agenda:
                    </p>
                    <p className="text-xs font-bold text-amber-950 mt-0.5 leading-relaxed">
                      "{item.next_agenda_suggestion}"
                    </p>
                  </div>
                )}

                {/* Critique / Feedback */}
                {item.critique && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      💬 Kritik & Masukan:
                    </p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">
                      "{item.critique}"
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
