import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  Calendar, 
  Search, 
  Download, 
  Users, 
  ArrowUpDown,
  CalendarCheck
} from 'lucide-react';
import { Member, Meeting, Attendance } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';

interface MentorDisciplineRadarProps {
  members: Member[];
  meetings: Meeting[];
  attendances: Attendance[];
}

export const MentorDisciplineRadar: React.FC<MentorDisciplineRadarProps> = ({
  members,
  meetings,
  attendances,
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [searchName, setSearchName] = useState('');
  const [selectedSie, setSelectedSie] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'critical' | 'warning' | 'safe'>('all');
  const [sortBy, setSortBy] = useState<'attention' | 'highest' | 'name'>('attention');

  // Filter only Angkatan 20 active mentors (59 members)
  const a20Mentors = useMemo(() => {
    return members.filter((m) => m.generation === 20 && m.status === 'active');
  }, [members]);

  // Available months from meetings
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    meetings.forEach((m) => {
      if (m.meeting_date) set.add(m.meeting_date.slice(0, 7));
    });
    set.add(currentMonthStr);
    return Array.from(set).sort().reverse();
  }, [meetings, currentMonthStr]);

  // Meetings in the selected month (excluding official holidays)
  const monthMeetings = useMemo(() => {
    return meetings
      .filter((m) => m.meeting_date && m.meeting_date.startsWith(selectedMonth))
      .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date));
  }, [meetings, selectedMonth]);

  const effectiveMeetings = useMemo(() => {
    return monthMeetings.filter((m) => !m.is_holiday);
  }, [monthMeetings]);

  // List of distinct sie sections
  const sieOptions = useMemo(() => {
    const list = [
      'Ketua', 'Wakil Ketua', 'Divisi', 'Sekretaris', 'Bendahara',
      'Pengajar', 'PDD', 'Sarpras', 'Humas', 'Kedisiplinan', 'Operasional', 'Kurikulum'
    ];
    return list;
  }, []);

  // Compute evaluation per mentor
  const mentorEvaluations = useMemo(() => {
    return a20Mentors.map((mentor) => {
      // Find attendances in effective meetings this month
      const attendedMeetings = effectiveMeetings.filter((meeting) => {
        return attendances.some(
          (a) => a.meeting_id === meeting.id && a.member_id === mentor.id
        );
      });

      const count = attendedMeetings.length;

      let status: 'critical' | 'warning' | 'safe' = 'safe';
      let statusLabel = 'Aman / Disiplin';
      let isOverachiever = false;

      if (count === 0) {
        status = 'critical';
        statusLabel = 'Kritis (0x Hadir)';
      } else if (count === 1) {
        status = 'warning';
        statusLabel = 'Kurang 1 Sesi (1x)';
      } else if (count === 2) {
        status = 'safe';
        statusLabel = 'Disiplin Sesuai Shift (2x)';
      } else {
        status = 'safe';
        isOverachiever = true;
        statusLabel = `Super Rajin (${count}x Hadir)`;
      }

      return {
        mentor,
        attendedMeetings,
        count,
        status,
        statusLabel,
        isOverachiever,
      };
    });
  }, [a20Mentors, effectiveMeetings, attendances]);

  // KPI Statistics
  const stats = useMemo(() => {
    const total = mentorEvaluations.length;
    const safeCount = mentorEvaluations.filter((e) => e.status === 'safe').length;
    const warningCount = mentorEvaluations.filter((e) => e.status === 'warning').length;
    const criticalCount = mentorEvaluations.filter((e) => e.status === 'critical').length;
    const overachieverCount = mentorEvaluations.filter((e) => e.isOverachiever).length;

    return {
      total,
      safeCount,
      warningCount,
      criticalCount,
      overachieverCount,
      complianceRate: total > 0 ? Math.round((safeCount / total) * 100) : 0,
    };
  }, [mentorEvaluations]);

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    return mentorEvaluations
      .filter((item) => {
        const matchesName =
          !searchName.trim() ||
          item.mentor.name.toLowerCase().includes(searchName.toLowerCase()) ||
          item.mentor.position.toLowerCase().includes(searchName.toLowerCase()) ||
          item.mentor.class_name.toLowerCase().includes(searchName.toLowerCase());

        const matchesSie =
          selectedSie === 'all' ||
          item.mentor.position.toLowerCase().includes(selectedSie.toLowerCase());

        const matchesStatus =
          selectedStatus === 'all' || item.status === selectedStatus;

        return matchesName && matchesSie && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'attention') {
          // 0x first, then 1x, then 2x, then overachievers
          if (a.count !== b.count) return a.count - b.count;
          return a.mentor.name.localeCompare(b.mentor.name);
        }
        if (sortBy === 'highest') {
          if (a.count !== b.count) return b.count - a.count;
          return a.mentor.name.localeCompare(b.mentor.name);
        }
        return a.mentor.name.localeCompare(b.mentor.name);
      });
  }, [mentorEvaluations, searchName, selectedSie, selectedStatus, sortBy]);

  // Export CSV function
  const handleExportCsv = () => {
    sound.playSuccess();

    const headers = [
      'No',
      'Nama Lengkap',
      'Kelas',
      'Jabatan / Sie',
      'Total Hadir',
      'Target Shift Bulanan',
      'Status Kedisiplinan',
      'Detail Tanggal Hadir',
    ];

    const rows = filteredList.map((item, idx) => {
      const datesStr = item.attendedMeetings.map((m) => m.meeting_date).join(' | ');
      return [
        idx + 1,
        `"${item.mentor.name.replace(/"/g, '""')}"`,
        `"${item.mentor.class_name}"`,
        `"${item.mentor.position.replace(/"/g, '""')}"`,
        item.count,
        '2 Pertemuan',
        `"${item.statusLabel}"`,
        `"${datesStr || 'Belum Ada'}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Radar_Kedisiplinan_A20_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMonthTitle = (str: string) => {
    const [year, month] = str.split('-');
    const names = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${names[parseInt(month, 10) - 1] || month} ${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500 shadow-[0_6px_0_0_#312e81] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                Pusat Kendali Kedisiplinan Pengurus
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Radar Kedisiplinan Angkatan 20</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black border border-amber-300">
                  Target: 2x/Bulan
                </span>
              </h2>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-300 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                sound.playPop();
                setSelectedMonth(e.target.value);
              }}
              className="bg-indigo-900/80 text-white border-2 border-indigo-400 rounded-2xl px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {formatMonthTitle(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs font-bold text-indigo-200/90 leading-relaxed max-w-2xl">
          Aturan Shift Chandra: Setiap Sie mengirimkan 50% anggota per minggu (fleksibel hadir 2 minggu berturut-turut). 
          Selama dalam sebulan hadir minimal <strong>2 kali pertemuan aktif</strong>, status pengurus dinyatakan <strong>AMAN</strong>.
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-indigo-200">
          <span className="flex items-center gap-1 bg-indigo-800/60 px-2.5 py-1 rounded-xl border border-indigo-600/50">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pertemuan Aktif Bulan Ini: <strong>{effectiveMeetings.length} Sesi</strong></span>
          </span>
          {monthMeetings.some((m) => m.is_holiday) && (
            <span className="flex items-center gap-1 bg-rose-900/60 text-rose-200 px-2.5 py-1 rounded-xl border border-rose-700/50">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Libur: {monthMeetings.filter((m) => m.is_holiday).length} Pertemuan</span>
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Safe / Disciplined */}
        <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 shadow-[0_4px_0_0_#86efac] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              Aman / Disiplin
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950">
            {stats.safeCount} <span className="text-xs font-bold text-emerald-700">/ {stats.total}</span>
          </div>
          <p className="text-[10px] font-extrabold text-emerald-700">
            {stats.complianceRate}% Memenuhi Kuota (≥2x)
          </p>
        </div>

        {/* Overachievers */}
        <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-[0_4px_0_0_#fde047] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
              Super Dedikasi
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950">
            {stats.overachieverCount} <span className="text-xs font-bold text-amber-700">Orang</span>
          </div>
          <p className="text-[10px] font-extrabold text-amber-700">
            Hadir Lebih dari Kuota (&gt;2x)
          </p>
        </div>

        {/* Warning (1x) */}
        <div className="p-4 rounded-3xl bg-yellow-50 border-2 border-yellow-300 shadow-[0_4px_0_0_#fef08a] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-800">
              Kurang 1 Sesi
            </span>
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-yellow-950">
            {stats.warningCount} <span className="text-xs font-bold text-yellow-700">Orang</span>
          </div>
          <p className="text-[10px] font-extrabold text-yellow-700">
            Baru Hadir 1x (Perlu 1x Lagi)
          </p>
        </div>

        {/* Critical (0x) */}
        <div className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-[0_4px_0_0_#fca5a5] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">
              Kritis / 0 Hadir
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-950">
            {stats.criticalCount} <span className="text-xs font-bold text-rose-700">Orang</span>
          </div>
          <p className="text-[10px] font-extrabold text-rose-700">
            Belum Bertugas Sama Sekali
          </p>
        </div>
      </div>

      {/* Control Bar: Filters & Export */}
      <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Cari nama pengurus, sie, atau kelas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-none transition-colors"
            />
          </div>

          {/* Sie Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedSie}
              onChange={(e) => {
                sound.playPop();
                setSelectedSie(e.target.value);
              }}
              className="px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-700 focus:bg-white focus:border-slate-800 focus:outline-none"
            >
              <option value="all">Semua Sie & BPH</option>
              {sieOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                sound.playPop();
                setSelectedStatus(e.target.value as any);
              }}
              className="px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-700 focus:bg-white focus:border-slate-800 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="critical">🔴 Kritis (0x)</option>
              <option value="warning">🟡 Kurang (1x)</option>
              <option value="safe">🟢 Aman (≥2x)</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => {
                sound.playPop();
                setSortBy((prev) => 
                  prev === 'attention' ? 'highest' : prev === 'highest' ? 'name' : 'attention'
                );
              }}
              className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 text-xs font-black flex items-center gap-1 transition-colors"
              title="Ganti Pengurutan"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {sortBy === 'attention' ? 'Prioritas Kritis' : sortBy === 'highest' ? 'Paling Rajin' : 'Nama A-Z'}
              </span>
            </button>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500">
            Menampilkan <strong>{filteredList.length}</strong> dari {a20Mentors.length} pengurus
          </span>

          <TactileButton
            onClick={handleExportCsv}
            variant="brand"
            size="sm"
            className="py-1.5 px-3 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV Kedisiplinan</span>
          </TactileButton>
        </div>
      </div>

      {/* List of Mentors */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-300 p-6">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-black text-slate-600">Tidak ada pengurus yang sesuai kriteria filter.</p>
          </div>
        ) : (
          filteredList.map((item) => {
            const { mentor, count, status, isOverachiever, attendedMeetings } = item;

            return (
              <div
                key={mentor.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  status === 'critical'
                    ? 'bg-rose-50/50 border-rose-200 shadow-[0_3px_0_0_#fca5a5]'
                    : status === 'warning'
                    ? 'bg-yellow-50/50 border-yellow-200 shadow-[0_3px_0_0_#fef08a]'
                    : isOverachiever
                    ? 'bg-amber-50/40 border-amber-300 shadow-[0_3px_0_0_#fde047]'
                    : 'bg-white border-slate-200 shadow-[0_3px_0_0_#e2e8f0]'
                }`}
              >
                {/* Mentor Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-sm text-slate-900">{mentor.name}</h4>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black">
                      {mentor.class_name}
                    </span>
                    {isOverachiever && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                        <span>Overachiever</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-500">
                    {mentor.position}
                  </p>

                  {/* Attended meeting dates pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400">Kehadiran:</span>
                    {effectiveMeetings.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">Belum ada sesi di bulan ini</span>
                    ) : (
                      effectiveMeetings.map((m) => {
                        const hasAttended = attendedMeetings.some((am) => am.id === m.id);
                        return (
                          <span
                            key={m.id}
                            title={`${m.title || 'Pertemuan'} (${m.meeting_date})`}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 ${
                              hasAttended
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {hasAttended ? '✓' : '✗'} {m.meeting_date.slice(8)}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Status Badge & Attendance Count */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500">Total:</span>
                    <span className={`text-base font-black px-2 py-0.5 rounded-xl border ${
                      count >= 2 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : count === 1
                        ? 'bg-yellow-50 text-yellow-900 border-yellow-300'
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}>
                      {count} / 2 Sesi
                    </span>
                  </div>

                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                    status === 'safe'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : status === 'warning'
                      ? 'bg-yellow-400 text-slate-950 border-yellow-500'
                      : 'bg-rose-600 text-white border-rose-700'
                  }`}>
                    {status === 'safe' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {status === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {status === 'critical' && <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>{item.statusLabel}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
