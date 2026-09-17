import React, { useState, useMemo } from 'react';
import { Download, Copy, Check, Filter, Search, UserCheck, UserX, Calendar } from 'lucide-react';
import { Member, Meeting, Attendance } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';

interface ReportRecapProps {
  members: Member[];
  meetings: Meeting[];
  attendances: Attendance[];
  activeMeeting: Meeting | null;
}

export const ReportRecap: React.FC<ReportRecapProps> = ({
  members,
  meetings,
  attendances,
  activeMeeting,
}) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    activeMeeting ? activeMeeting.id : meetings[0]?.id || ''
  );
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [copied, setCopied] = useState(false);

  // Filter only Angkatan 21 active students for report card grading
  const a21Students = useMemo(() => {
    return members.filter((m) => m.generation === 21 && m.status === 'active');
  }, [members]);

  // Distinct classes in Angkatan 21
  const classList = useMemo(() => {
    const set = new Set(a21Students.map((m) => m.class_name));
    return Array.from(set).sort();
  }, [a21Students]);

  // Filter attendances for selected meeting
  const currentMeetingAttendances = useMemo(() => {
    return attendances.filter((a) => a.meeting_id === selectedMeetingId);
  }, [attendances, selectedMeetingId]);

  const attendedMemberIds = useMemo(() => {
    return new Set(currentMeetingAttendances.map((a) => a.member_id));
  }, [currentMeetingAttendances]);

  // Combined member rows with attendance status
  const reportRows = useMemo(() => {
    return a21Students
      .filter((m) => {
        const matchesClass = selectedClass === 'all' || m.class_name === selectedClass;
        const matchesName =
          !searchName.trim() || m.name.toLowerCase().includes(searchName.toLowerCase());
        return matchesClass && matchesName;
      })
      .map((m) => {
        const isPresent = attendedMemberIds.has(m.id);
        const attendanceRecord = currentMeetingAttendances.find((a) => a.member_id === m.id);
        return {
          member: m,
          isPresent,
          attendance: attendanceRecord,
        };
      })
      .sort((a, b) => a.member.class_name.localeCompare(b.member.class_name) || a.member.name.localeCompare(b.member.name));
  }, [a21Students, selectedClass, searchName, attendedMemberIds, currentMeetingAttendances]);

  // Stats
  const totalFiltered = reportRows.length;
  const presentCount = reportRows.filter((r) => r.isPresent).length;
  const absentCount = totalFiltered - presentCount;
  const percentage = totalFiltered > 0 ? Math.round((presentCount / totalFiltered) * 100) : 0;

  // 1-Click Copy to Excel clipboard
  const handleCopyClipboard = () => {
    sound.playPop();
    const headers = ['NO', 'NAMA LENGKAP', 'KELAS', 'STATUS KEHADIRAN', 'WAKTU ABSEN', 'FEEDBACK'];
    const rows = reportRows.map((r, idx) => [
      idx + 1,
      r.member.name,
      r.member.class_name,
      r.isPresent ? 'HADIR' : 'TIDAK HADIR (ALPHA)',
      r.attendance?.submitted_at
        ? new Date(r.attendance.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        : '-',
      r.attendance?.feedback_rating || '-',
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // 1-Click Export CSV
  const handleExportCSV = () => {
    sound.playPop();
    const headers = ['No', 'Nama Lengkap', 'Kelas', 'Status Kehadiran', 'Waktu Absen', 'Rating'];
    const rows = reportRows.map((r, idx) => [
      `"${idx + 1}"`,
      `"${r.member.name}"`,
      `"${r.member.class_name}"`,
      `"${r.isPresent ? 'HADIR' : 'TIDAK HADIR'}"`,
      `"${r.attendance?.submitted_at ? new Date(r.attendance.submitted_at).toLocaleString('id-ID') : '-'}"`,
      `"${r.attendance?.feedback_rating || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const currentM = meetings.find((m) => m.id === selectedMeetingId);
    const dateStr = currentM ? currentM.meeting_date : 'rekap';
    link.setAttribute('download', `Rekap_Presensi_EC_SMEGA_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0]">
          <p className="text-[11px] font-black uppercase text-slate-400">Total Anggota A21</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{a21Students.length}</h3>
          <p className="text-[10px] font-bold text-slate-400">Terdaftar aktif</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-[0_3px_0_0_#86efac]">
          <p className="text-[11px] font-black uppercase text-emerald-800">Siswa Hadir</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{presentCount}</h3>
          <p className="text-[10px] font-bold text-emerald-600">Presensi terekam</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-[0_3px_0_0_#fca5a5]">
          <p className="text-[11px] font-black uppercase text-rose-800">Belum Hadir</p>
          <h3 className="text-2xl font-black text-rose-700 mt-1">{absentCount}</h3>
          <p className="text-[10px] font-bold text-rose-600">Alpha / Izin</p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-300 shadow-[0_3px_0_0_#93c5fd]">
          <p className="text-[11px] font-black uppercase text-blue-800">Persentase Rapor</p>
          <h3 className="text-2xl font-black text-blue-700 mt-1">{percentage}%</h3>
          <p className="text-[10px] font-bold text-blue-600">Tingkat kehadiran</p>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Meeting selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500 shrink-0" />
            <select
              value={selectedMeetingId}
              onChange={(e) => {
                sound.playPop();
                setSelectedMeetingId(e.target.value);
              }}
              className="px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-800 focus:outline-none focus:border-slate-800"
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.meeting_date} — {m.title} ({m.is_active ? 'Aktif' : 'Tutup'})
                </option>
              ))}
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <TactileButton variant="white" size="sm" onClick={handleCopyClipboard}>
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin ke Excel!' : 'Salin Tabel Excel'}</span>
            </TactileButton>

            <TactileButton variant="brand" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </TactileButton>
          </div>
        </div>

        {/* Filter Bar (Class + Name Search) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          {/* Class selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedClass}
              onChange={(e) => {
                sound.playPop();
                setSelectedClass(e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Kelas Angkatan 21 ({a21Students.length} Siswa)</option>
              {classList.map((cls) => {
                const count = a21Students.filter((m) => m.class_name === cls).length;
                return (
                  <option key={cls} value={cls}>
                    Kelas {cls} ({count} Siswa)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Name search */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Cari nama adik kelas..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3">Nama Lengkap</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3 text-center">Status Kehadiran</th>
                <th className="py-3 px-3 text-center">Waktu Presensi</th>
                <th className="py-3 px-3 text-center">Kesan Hari Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {reportRows.map((r, idx) => (
                <tr
                  key={r.member.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    r.isPresent ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-extrabold">{r.member.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-black">
                      {r.member.class_name}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {r.isPresent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300">
                        <UserCheck className="w-3 h-3" />
                        Hadir
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                        <UserX className="w-3 h-3" />
                        Alpha
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500 text-[11px]">
                    {r.attendance?.submitted_at
                      ? new Date(r.attendance.submitted_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) + ' WIB'
                      : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {r.attendance?.feedback_rating ? (
                      <span className="text-sm" title={r.attendance.feedback_rating}>
                        {r.attendance.feedback_rating === 'super_fun' && '🔥 Super Fun'}
                        {r.attendance.feedback_rating === 'okay' && '👍 Okay'}
                        {r.attendance.feedback_rating === 'boring' && '😴 Boring'}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
