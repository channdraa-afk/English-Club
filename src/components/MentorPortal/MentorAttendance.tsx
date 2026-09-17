import React, { useState, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Member, Meeting, Attendance } from '../../types/database';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';

interface MentorAttendanceProps {
  members: Member[];
  activeMeeting: Meeting | null;
  attendances: Attendance[];
  onAttendanceChanged: () => void;
}

export const MentorAttendance: React.FC<MentorAttendanceProps> = ({
  members,
  activeMeeting,
  attendances,
  onAttendanceChanged,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSie, setSelectedSie] = useState('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter Angkatan 20 mentors
  const a20Mentors = useMemo(() => {
    return members.filter((m) => m.generation === 20 && m.status === 'active');
  }, [members]);

  // Attendances for active meeting
  const currentMeetingAttendances = useMemo(() => {
    if (!activeMeeting) return [];
    return attendances.filter((a) => a.meeting_id === activeMeeting.id);
  }, [attendances, activeMeeting]);

  const attendedMentorIds = useMemo(() => {
    return new Set(currentMeetingAttendances.map((a) => a.member_id));
  }, [currentMeetingAttendances]);

  // Distinct roles/positions
  const distinctSections = useMemo(() => {
    const list = [
      'Ketua', 'Wakil Ketua', 'Ketua Divisi', 'Sekretaris', 'Bendahara',
      'Sie PDD', 'Sie Sarpras', 'Sie Humas', 'Sie Kedisiplinan',
      'Sie Pengajar', 'Sie Operasional', 'Sie Kurikulum'
    ];
    return list;
  }, []);

  const filteredMentors = useMemo(() => {
    return a20Mentors.filter((m) => {
      const matchSearch =
        !search.trim() ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.position.toLowerCase().includes(search.toLowerCase());
      const matchSie =
        selectedSie === 'all' || m.position.toLowerCase().includes(selectedSie.toLowerCase());
      return matchSearch && matchSie;
    });
  }, [a20Mentors, search, selectedSie]);

  const toggleAttendance = async (mentor: Member) => {
    if (!activeMeeting) {
      sound.playError();
      alert('Belum ada sesi pertemuan aktif!');
      return;
    }

    sound.playPop();
    setLoadingId(mentor.id);

    try {
      const isAttended = attendedMentorIds.has(mentor.id);
      if (isAttended) {
        // Delete attendance
        await supabase
          .from('attendances')
          .delete()
          .eq('meeting_id', activeMeeting.id)
          .eq('member_id', mentor.id);
      } else {
        // Mark attended
        await supabase.from('attendances').insert({
          meeting_id: activeMeeting.id,
          member_id: mentor.id,
          feedback_rating: 'super_fun',
        });
      }
      onAttendanceChanged();
    } catch (err) {
      console.error(err);
      sound.playError();
    } finally {
      setLoadingId(null);
    }
  };

  const presentCount = a20Mentors.filter((m) => attendedMentorIds.has(m.id)).length;

  return (
    <div className="space-y-5">
      {/* Header Stat */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white border-2 border-slate-700 shadow-[0_4px_0_0_#0f172a] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
            Presensi Pengurus & Mentor
          </span>
          <h3 className="text-xl font-black mt-0.5">Angkatan 20 (Total {a20Mentors.length} Pengurus)</h3>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Sesi: {activeMeeting ? activeMeeting.title : 'Belum Ada Sesi Aktif'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-emerald-400 font-mono">{presentCount}</span>
          <span className="text-sm font-bold text-slate-400"> / {a20Mentors.length}</span>
          <p className="text-[10px] font-bold text-slate-400">Hadir di Lokasi</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pengurus..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>

          <select
            value={selectedSie}
            onChange={(e) => {
              sound.playPop();
              setSelectedSie(e.target.value);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="all">Semua Sie Kerja</option>
            {distinctSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredMentors.map((m) => {
            const isAttended = attendedMentorIds.has(m.id);
            const isKoor = m.position.includes('Koordinator');
            const isKetua = m.position === 'Ketua' || m.position === 'Wakil Ketua';

            return (
              <div
                key={m.id}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 select-none ${
                  isAttended
                    ? 'bg-emerald-50 border-emerald-400 shadow-[0_3px_0_0_#86efac]'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-extrabold text-slate-900 text-xs truncate">{m.name}</h4>
                    {isKetua && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-400">
                        👑 {m.position}
                      </span>
                    )}
                    {isKoor && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                        ⭐ Koor
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate">
                    {m.position} • {m.class_name}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loadingId === m.id}
                  onClick={() => toggleAttendance(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer shrink-0 ${
                    isAttended
                      ? 'bg-emerald-600 text-white border-emerald-800 shadow-[0_2px_0_0_#15803d] active:translate-y-0.5'
                      : 'bg-white text-slate-700 border-slate-300 shadow-[0_2px_0_0_#cbd5e1] hover:bg-slate-50 active:translate-y-0.5'
                  }`}
                >
                  {loadingId === m.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isAttended ? (
                    'Hadir'
                  ) : (
                    'Tandai Hadir'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
