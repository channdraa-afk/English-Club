import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Search, 
  UserCheck, 
  TrendingUp, 
  UserX, 
  FileText, 
  MessageSquare, 
  Copy, 
  Check 
} from 'lucide-react';
import { Member, Meeting, Attendance, TalentStar } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';

interface LiveMonitorA21Props {
  members: Member[];
  activeMeeting: Meeting | null;
  attendances: Attendance[];
  talentStars?: TalentStar[];
}

export const LiveMonitorA21: React.FC<LiveMonitorA21Props> = ({
  members,
  activeMeeting,
  attendances,
  talentStars = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'absent' | 'present' | 'permit' | 'all'>('absent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [copiedWA, setCopiedWA] = useState(false);

  // 0ms Optimistic UI State for instant responsiveness
  const [optimisticAttendances, setOptimisticAttendances] = useState<Attendance[]>(attendances);

  useEffect(() => {
    setOptimisticAttendances(attendances);
  }, [attendances]);

  // Filter Angkatan 21 active students (104 members)
  const a21Students = useMemo(() => {
    return members.filter((m) => m.generation === 21 && m.status === 'active');
  }, [members]);

  // Current meeting attendances
  const currentAttendances = useMemo(() => {
    if (!activeMeeting) return [];
    return optimisticAttendances.filter((a) => a.meeting_id === activeMeeting.id);
  }, [optimisticAttendances, activeMeeting]);

  const attendedMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    currentAttendances.forEach((a) => {
      map.set(a.member_id, a);
    });
    return map;
  }, [currentAttendances]);

  const starsByMemberId = useMemo(() => {
    const map = new Map<string, number>();
    talentStars.forEach((s) => {
      map.set(s.member_id, (map.get(s.member_id) || 0) + 1);
    });
    return map;
  }, [talentStars]);

  // Lists: Hadir, Izin (Surat Fisik), and Belum Hadir / Alpa
  const presentStudents = useMemo(() => {
    return a21Students
      .filter((m) => attendedMap.has(m.id) && attendedMap.get(m.id)?.critique !== 'IZIN_SURAT_FISIK')
      .sort((a, b) => a.class_name.localeCompare(b.class_name) || a.name.localeCompare(b.name));
  }, [a21Students, attendedMap]);

  const permitStudents = useMemo(() => {
    return a21Students
      .filter((m) => attendedMap.has(m.id) && attendedMap.get(m.id)?.critique === 'IZIN_SURAT_FISIK')
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
      const permitInClass = permitStudents.filter((m) => m.class_name === cls).length;
      const effectiveCount = presentInClass + permitInClass;
      const percent = totalInClass > 0 ? Math.round((effectiveCount / totalInClass) * 100) : 0;
      return {
        className: cls,
        total: totalInClass,
        present: presentInClass,
        permit: permitInClass,
        percent,
      };
    });
  }, [classList, a21Students, presentStudents, permitStudents]);

  const totalStudents = a21Students.length;
  const presentCount = presentStudents.length;
  const permitCount = permitStudents.length;
  const absentCount = absentStudents.length;
  const effectiveCount = presentCount + permitCount;
  const overallPercent = totalStudents > 0 ? Math.round((effectiveCount / totalStudents) * 100) : 0;

  // Filtered lists for view
  const displayList = useMemo(() => {
    let source = absentStudents;
    if (activeSubTab === 'present') source = presentStudents;
    else if (activeSubTab === 'permit') source = permitStudents;
    else if (activeSubTab === 'all') source = a21Students;

    return source.filter((m) => {
      const matchClass = selectedClass === 'all' || m.class_name === selectedClass;
      const matchSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.class_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [activeSubTab, presentStudents, permitStudents, absentStudents, a21Students, selectedClass, searchQuery]);

  // 1-Click Copy Absent List to WhatsApp
  const handleCopyAbsentWA = () => {
    sound.playPop();
    if (absentStudents.length === 0) {
      alert('Alhamdulillah, semua adik kelas pada sesi ini tercatat Hadir atau Izin resmi! 🎉');
      return;
    }

    const meetingTitle = activeMeeting ? activeMeeting.title : 'Sesi Pertemuan English Club';
    const meetingDate = activeMeeting?.meeting_date 
      ? new Date(activeMeeting.meeting_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : 'Hari Ini';

    let text = `📢 *DAFTAR SISWA BELUM HADIR / ALPA — ENGLISH CLUB SMEGA*\n`;
    text += `📅 *Sesi:* ${meetingTitle} (${meetingDate})\n`;
    text += `👥 *Total Alpa:* ${absentStudents.length} Siswa\n\n`;
    text += `Berikut adik kelas Angkatan 21 yang tercatat *Tanpa Keterangan*:\n`;

    absentStudents.forEach((st, idx) => {
      text += `${idx + 1}. ${st.name} — *${st.class_name}*\n`;
    });

    text += `\n⚠️ *Perhatian:* Bagi adik kelas yang berhalangan hadir karena sakit/izin keperluan, wajib segera menyerahkan *Surat Izin Fisik resmi* langsung ke Kakak Kelas agar status tercatat Izin resmi di rapor. Terima kasih! 🙏✨`;

    navigator.clipboard.writeText(text).then(() => {
      sound.playSuccess();
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Live Counter Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white border-2 border-blue-900 shadow-[0_6px_0_0_#1e3a8a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-200 bg-blue-900/60 px-2.5 py-0.5 rounded-md border border-blue-500/40">
              Live Monitoring Sesi Eskul
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Presensi Angkatan 21 (Adik Kelas)
            </h2>
            <p className="text-xs font-bold text-blue-100">
              {activeMeeting ? activeMeeting.title : 'Belum Ada Sesi Pertemuan'}
            </p>
          </div>

          {/* Big Circular/Number Stats */}
          <div className="bg-blue-950/60 border-2 border-blue-400/40 rounded-3xl p-4 text-center min-w-[170px]">
            <div className="text-3xl sm:text-4xl font-black text-amber-300">
              {effectiveCount} <span className="text-sm font-bold text-blue-100">/ {totalStudents}</span>
            </div>
            <p className="text-xs font-black text-blue-200 mt-0.5">
              {overallPercent}% Kehadiran Efektif
            </p>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-4 bg-blue-950/70 rounded-full overflow-hidden border border-blue-500/50 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-extrabold text-blue-100">
            <span>🟢 Hadir: {presentCount}</span>
            <span>🟡 Izin (Surat): {permitCount}</span>
            <span>🔴 Belum Hadir: {absentCount}</span>
          </div>
        </div>
      </div>

      {/* 1-Click WhatsApp Broadcast Bar for Absent Students */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300/80 p-4 rounded-3xl shadow-[0_3px_0_0_#a7f3d0]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-sm shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-950">
              Salin Daftar Alpa / Bolos ke Grup WhatsApp
            </h4>
            <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
              Tercatat <strong>{absentCount}</strong> adik kelas belum hadir tanpa keterangan pada sesi ini.
            </p>
          </div>
        </div>

        <TactileButton
          variant="emerald"
          size="sm"
          onClick={handleCopyAbsentWA}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 py-2 px-4"
        >
          {copiedWA ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
          <span>{copiedWA ? '✓ Berhasil Disalin!' : '📋 Salin Daftar Alpa (WA)'}</span>
        </TactileButton>
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
              <div className="text-[10px] font-bold text-slate-500 mt-1 flex items-center justify-between">
                <span>H: {cs.present} | I: {cs.permit}</span>
                <span>/{cs.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Subtabs Bar */}
      <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-3">
        {/* Subtabs Selector (4 Subtabs) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => {
              sound.playPop();
              setActiveSubTab('absent');
            }}
            className={`py-2 px-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'absent'
                ? 'bg-rose-500 text-white border-rose-700 shadow-[0_3px_0_0_#b91c1c]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Belum ({absentCount})</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveSubTab('present');
            }}
            className={`py-2 px-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'present'
                ? 'bg-emerald-600 text-white border-emerald-800 shadow-[0_3px_0_0_#15803d]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Hadir ({presentCount})</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveSubTab('permit');
            }}
            className={`py-2 px-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'permit'
                ? 'bg-amber-500 text-white border-amber-700 shadow-[0_3px_0_0_#b45309]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Izin ({permitCount})</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveSubTab('all');
            }}
            className={`py-2 px-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'all'
                ? 'bg-blue-600 text-white border-blue-800 shadow-[0_3px_0_0_#1d4ed8]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Semua ({totalStudents})</span>
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
              Tidak ada siswa yang ditemukan pada filter ini.
            </p>
          </div>
        ) : (
          displayList.map((student) => {
            const hasRecord = attendedMap.has(student.id);
            const attendance = attendedMap.get(student.id);
            const isPermit = hasRecord && attendance?.critique === 'IZIN_SURAT_FISIK';
            const isPresent = hasRecord && !isPermit;

            return (
              <div
                key={student.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isPresent
                    ? 'bg-emerald-50/50 border-emerald-200 shadow-[0_2px_0_0_#a7f3d0]'
                    : isPermit
                    ? 'bg-amber-50/50 border-amber-200 shadow-[0_2px_0_0_#fde68a]'
                    : 'bg-white border-slate-200 shadow-[0_2px_0_0_#e2e8f0]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs text-slate-900">{student.name}</h4>
                    <span className="px-2 py-0.2 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black">
                      {student.class_name}
                    </span>

                    {(starsByMemberId.get(student.id) || 0) > 0 && (
                      <span 
                        className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black inline-flex items-center gap-0.5"
                        title="Bintang Keaktifan Lomba"
                      >
                        <span>⭐</span>
                        <span>{starsByMemberId.get(student.id)}</span>
                      </span>
                    )}

                    {isPresent && (
                      <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                        ✓ Hadir
                      </span>
                    )}

                    {isPermit && (
                      <span className="px-2 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black">
                        📄 Izin (Surat Fisik)
                      </span>
                    )}
                  </div>

                  {hasRecord && attendance && (
                    <p className={`text-[10px] font-bold flex items-center gap-1 ${isPermit ? 'text-amber-700' : 'text-emerald-700'}`}>
                      <Clock className="w-3 h-3" />
                      <span>Tercatat: {new Date(attendance.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      {attendance.feedback_rating && !isPermit && (
                        <span className="ml-1">
                          {attendance.feedback_rating === 'super_fun' ? '🤩' : attendance.feedback_rating === 'okay' ? '👍' : '😴'}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Status Badge (Pure Read-Only Indicator) */}
                <div className="shrink-0 self-end sm:self-center">
                  {isPresent ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Hadir</span>
                    </span>
                  ) : isPermit ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Izin Resmi</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                      <UserX className="w-3.5 h-3.5 text-rose-500" />
                      <span>Belum Hadir</span>
                    </span>
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
