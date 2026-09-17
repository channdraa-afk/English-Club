import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  Search, 
  UserCheck, 
  TrendingUp, 
  RefreshCw,
  UserX,
  Zap
} from 'lucide-react';
import { Member, Meeting, Attendance } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';

interface LiveMonitorA21Props {
  members: Member[];
  activeMeeting: Meeting | null;
  attendances: Attendance[];
  onAttendanceChanged: () => void;
}

export const LiveMonitorA21: React.FC<LiveMonitorA21Props> = ({
  members,
  activeMeeting,
  attendances,
  onAttendanceChanged,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'present' | 'absent'>('absent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter Angkatan 21 active students (104 members)
  const a21Students = useMemo(() => {
    return members.filter((m) => m.generation === 21 && m.status === 'active');
  }, [members]);

  // Current meeting attendances
  const currentAttendances = useMemo(() => {
    if (!activeMeeting) return [];
    return attendances.filter((a) => a.meeting_id === activeMeeting.id);
  }, [attendances, activeMeeting]);

  const attendedMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    currentAttendances.forEach((a) => {
      map.set(a.member_id, a);
    });
    return map;
  }, [currentAttendances]);

  // Lists
  const presentStudents = useMemo(() => {
    return a21Students
      .filter((m) => attendedMap.has(m.id))
      .sort((a, b) => a.class_name.localeCompare(b.class_name) || a.name.localeCompare(b.name));
  }, [a21Students, attendedMap]);

  const absentStudents = useMemo(() => {
    return a21Students
      .filter((m) => !attendedMap.has(m.id))
      .sort((a, b) => a.class_name.localeCompare(b.class_name) || a.name.localeCompare(b.name));
  }, [a21Students, attendedMap]);

  // Classes list
  const classList = useMemo(() => {
    const set = new Set(a21Students.map((m) => m.class_name));
    return Array.from(set).sort();
  }, [a21Students]);

  // Per-class stats
  const classStats = useMemo(() => {
    return classList.map((cls) => {
      const totalInClass = a21Students.filter((m) => m.class_name === cls).length;
      const presentInClass = presentStudents.filter((m) => m.class_name === cls).length;
      const percent = totalInClass > 0 ? Math.round((presentInClass / totalInClass) * 100) : 0;
      return {
        className: cls,
        total: totalInClass,
        present: presentInClass,
        percent,
      };
    });
  }, [classList, a21Students, presentStudents]);

  const totalStudents = a21Students.length;
  const presentCount = presentStudents.length;
  const absentCount = absentStudents.length;
  const overallPercent = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Filtered lists for view
  const displayList = useMemo(() => {
    const source = activeSubTab === 'present' ? presentStudents : absentStudents;
    return source.filter((m) => {
      const matchClass = selectedClass === 'all' || m.class_name === selectedClass;
      const matchSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.class_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [activeSubTab, presentStudents, absentStudents, selectedClass, searchQuery]);

  // Manual mark attendance
  const handleMarkPresent = async (student: Member) => {
    if (!activeMeeting) {
      sound.playError();
      alert('Belum ada pertemuan aktif!');
      return;
    }

    sound.playPop();
    setLoadingId(student.id);

    try {
      const { error } = await supabase.from('attendances').insert({
        meeting_id: activeMeeting.id,
        member_id: student.id,
        feedback_rating: 'super_fun',
        next_agenda_suggestion: 'Ditandai manual oleh Ketua / Pengurus',
        is_anonymous: false,
      });

      if (error) throw error;
      sound.playSuccess();
      onAttendanceChanged();
    } catch (err: any) {
      console.error('Error marking attendance:', err);
      sound.playError();
      alert('Gagal menandai presensi: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // Cancel attendance
  const handleCancelAttendance = async (student: Member) => {
    if (!activeMeeting) return;
    if (!confirm(`Batalkan presensi untuk ${student.name}?`)) return;

    sound.playPop();
    setLoadingId(student.id);

    try {
      const { error } = await supabase
        .from('attendances')
        .delete()
        .eq('meeting_id', activeMeeting.id)
        .eq('member_id', student.id);

      if (error) throw error;
      sound.playSuccess();
      onAttendanceChanged();
    } catch (err: any) {
      console.error('Error canceling attendance:', err);
      sound.playError();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Live Counter Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white border-2 border-emerald-900 shadow-[0_6px_0_0_#14532d] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 bg-emerald-900/60 px-2.5 py-0.5 rounded-md border border-emerald-500/40">
              Live Monitoring Sesi Eskul
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Presensi Angkatan 21 (Adik Kelas)
            </h2>
            <p className="text-xs font-bold text-emerald-100">
              {activeMeeting ? activeMeeting.title : 'Belum Ada Sesi Pertemuan'}
            </p>
          </div>

          {/* Big Circular/Number Stats */}
          <div className="bg-emerald-950/60 border-2 border-emerald-400/40 rounded-3xl p-4 text-center min-w-[150px]">
            <div className="text-3xl sm:text-4xl font-black text-emerald-300">
              {presentCount} <span className="text-sm font-bold text-emerald-100">/ {totalStudents}</span>
            </div>
            <p className="text-xs font-black text-emerald-200 mt-0.5">
              {overallPercent}% Sudah Hadir
            </p>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-4 bg-emerald-950/70 rounded-full overflow-hidden border border-emerald-500/50 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-300 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-100">
            <span>🟢 Hadir: {presentCount} siswa</span>
            <span>🔴 Belum Hadir: {absentCount} siswa</span>
          </div>
        </div>
      </div>

      {/* Class Breakdown Grid (Bento) */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Statistik Kehadiran Tiap Kelas</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {classStats.map((cs) => (
            <div
              key={cs.className}
              onClick={() => {
                sound.playPop();
                setSelectedClass(selectedClass === cs.className ? 'all' : cs.className);
              }}
              className={`p-3 rounded-2xl border-2 cursor-pointer transition-all select-none ${
                selectedClass === cs.className
                  ? 'bg-emerald-50 border-emerald-500 shadow-[0_3px_0_0_#10b981]'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 shadow-[0_2px_0_0_#e2e8f0]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-xs text-slate-800 truncate">{cs.className}</span>
                <span className="text-[10px] font-black text-emerald-700">{cs.percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${cs.percent}%` }}
                />
              </div>
              <div className="text-[10px] font-bold text-slate-500 mt-1">
                {cs.present} / {cs.total} siswa
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Subtabs Bar */}
      <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-3">
        {/* Subtabs Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playPop();
              setActiveSubTab('absent');
            }}
            className={`py-2.5 px-4 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'absent'
                ? 'bg-rose-500 text-white border-rose-700 shadow-[0_3px_0_0_#b91c1c]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Belum Hadir ({absentCount})</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveSubTab('present');
            }}
            className={`py-2.5 px-4 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'present'
                ? 'bg-emerald-600 text-white border-emerald-800 shadow-[0_3px_0_0_#15803d]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Sudah Hadir ({presentCount})</span>
          </button>
        </div>

        {/* Search & Class Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama adik kelas atau kelas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-none transition-colors"
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => {
              sound.playPop();
              setSelectedClass(e.target.value);
            }}
            className="px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-700 focus:bg-white focus:border-slate-800 focus:outline-none"
          >
            <option value="all">Semua Kelas ({totalStudents})</option>
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-2">
        {displayList.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-300 p-6">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-black text-slate-600">
              {activeSubTab === 'absent'
                ? 'Hore! Semua siswa pada kriteria ini sudah hadir!'
                : 'Belum ada siswa yang hadir pada filter ini.'}
            </p>
          </div>
        ) : (
          displayList.map((student) => {
            const isPresent = attendedMap.has(student.id);
            const attendance = attendedMap.get(student.id);
            const isRowLoading = loadingId === student.id;

            return (
              <div
                key={student.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isPresent
                    ? 'bg-emerald-50/50 border-emerald-200 shadow-[0_2px_0_0_#a7f3d0]'
                    : 'bg-white border-slate-200 shadow-[0_2px_0_0_#e2e8f0]'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs text-slate-900">{student.name}</h4>
                    <span className="px-2 py-0.2 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black">
                      {student.class_name}
                    </span>
                  </div>

                  {isPresent && attendance && (
                    <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Check-in: {new Date(attendance.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      {attendance.feedback_rating && (
                        <span className="ml-1">
                          {attendance.feedback_rating === 'super_fun' ? '🤩' : attendance.feedback_rating === 'okay' ? '👍' : '😴'}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div>
                  {isPresent ? (
                    <button
                      onClick={() => handleCancelAttendance(student)}
                      disabled={isRowLoading}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-black transition-colors"
                      title="Batalkan presensi siswa ini"
                    >
                      Batal
                    </button>
                  ) : (
                    <TactileButton
                      onClick={() => handleMarkPresent(student)}
                      disabled={isRowLoading}
                      variant="brand"
                      size="sm"
                      className="py-1 px-3 text-xs"
                    >
                      {isRowLoading ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                      <span>Tandai Hadir</span>
                    </TactileButton>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
