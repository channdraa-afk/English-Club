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
  CalendarCheck,
  Printer
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

  // Handle Print PDF
  const handlePrintPdf = () => {
    sound.playPop();
    window.print();
  };

  // Export CSV function (Standard Excel Windows Indonesia: ';' with UTF-8 BOM)
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
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Radar_Kedisiplinan_A20_${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      {/* Printable Area Specific Styles - Locked to A4 Landscape, zero clipping */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm 6mm;
          }
          html, body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-discipline-radar, #printable-discipline-radar * {
            visibility: visible;
          }
          #printable-discipline-radar {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-discipline-radar table {
            width: 100% !important;
            font-size: 8.5pt !important;
            border-collapse: collapse !important;
          }
          #printable-discipline-radar th, #printable-discipline-radar td {
            padding: 3px 5px !important;
          }
        }
      `}</style>

      {/* Top Banner (Hidden in Print) */}
      <div className="no-print p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500 shadow-[0_6px_0_0_#312e81] space-y-3">
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

      {/* KPI Cards Grid (Hidden in Print) */}
      <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* Control Bar: Filters & Export (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-3">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500">
            Menampilkan <strong>{filteredList.length}</strong> dari {a20Mentors.length} pengurus
          </span>

          <div className="flex items-center gap-2">
            <TactileButton
              onClick={handlePrintPdf}
              variant="white"
              size="sm"
              className="py-1.5 px-3 text-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span>Cetak PDF Kedisiplinan</span>
            </TactileButton>

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
      </div>

      {/* List of Mentors (Hidden in Print, replaced by Official Table) */}
      <div className="no-print space-y-2.5">
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

      {/* ========================================================= */}
      {/* OFFICIAL PRINTABLE RECAP TABLE FOR KEDIS (A4 LANDSCAPE) */}
      {/* ========================================================= */}
      <div id="printable-discipline-radar" className="hidden print:block space-y-4 bg-white p-6">
        {/* Official Clean Heading with EC Logo */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3.5">
            <img src="/logo.png" alt="EC SMEGA Logo" className="w-14 h-14 object-contain shrink-0" />
            <div>
              <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight leading-tight">
                REKAPITULASI KEDISIPLINAN & PRESENSI PENGURUS (ANGKATAN 20)
              </h2>
              <p className="text-xs font-black text-slate-700 mt-0.5">
                EKSTRAKURIKULER ENGLISH CLUB — SMK NEGERI 1 PURBALINGGA
              </p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                Periode: {formatMonthTitle(selectedMonth)} • Standar Shift: Minimal 2x Hadir per Bulan • {effectiveMeetings.length} Pertemuan Aktif
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-[10px] font-black border border-slate-300 uppercase tracking-wider">
              Laporan Sie Kedisiplinan
            </span>
          </div>
        </div>

        {/* Compact KPI Summary Bar */}
        <div className="grid grid-cols-4 gap-2.5 p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-[11px] font-bold text-slate-800">
          <div>Total Pengurus: <strong>{stats.total} Orang</strong></div>
          <div>Aman (≥2x): <strong className="text-emerald-700">{stats.safeCount} Orang ({stats.complianceRate}%)</strong></div>
          <div>Kurang 1 Sesi (1x): <strong className="text-amber-700">{stats.warningCount} Orang</strong></div>
          <div>Kritis (0x): <strong className="text-rose-700">{stats.criticalCount} Orang</strong></div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-900 font-black">
              <tr>
                <th className="border border-slate-300 py-2 px-2 w-8 text-center">No</th>
                <th className="border border-slate-300 py-2 px-3 min-w-[170px]">Nama Lengkap</th>
                <th className="border border-slate-300 py-2 px-2 w-20 text-center">Kelas</th>
                <th className="border border-slate-300 py-2 px-3 min-w-[140px]">Jabatan / Sie</th>
                <th className="border border-slate-300 py-2 px-2 min-w-[150px] text-center">Kehadiran Sesi Rabu</th>
                <th className="border border-slate-300 py-2 px-2 w-20 text-center">Total Hadir</th>
                <th className="border border-slate-300 py-2 px-3 w-36 text-center">Status Kedisiplinan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold">
              {filteredList.map((item, idx) => (
                <tr key={item.mentor.id}>
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="border border-slate-300 py-1.5 px-3 text-slate-900 font-extrabold">{item.mentor.name}</td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center text-slate-600">{item.mentor.class_name}</td>
                  <td className="border border-slate-300 py-1.5 px-3 text-slate-700">{item.mentor.position}</td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center text-[10px] font-mono">
                    {item.attendedMeetings.length === 0 ? (
                      <span className="text-slate-400 italic">Belum Ada</span>
                    ) : (
                      item.attendedMeetings.map((m) => m.meeting_date.slice(8)).join(', ')
                    )}
                  </td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-mono font-black text-slate-900">
                    {item.count} Sesi
                  </td>
                  <td className="border border-slate-300 py-1.5 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                      item.status === 'safe'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend Footer (NO SIGNATURES) */}
        <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] font-bold text-slate-500">
          <div>Ketentuan Shift: Setiap pengurus wajib hadir minimal 2 kali pertemuan aktif per bulan. Sesi libur resmi tidak dihitung.</div>
          <div>Total Data: {filteredList.length} Pengurus Angkatan 20</div>
        </div>
      </div>
    </div>
  );
};
