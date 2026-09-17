import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Search, 
  UserCheck, 
  UserX, 
  Calendar, 
  Printer, 
  CalendarRange, 
  FileSpreadsheet, 
  RefreshCw 
} from 'lucide-react';
import { Member, Meeting, Attendance } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';

interface ReportRecapProps {
  members: Member[];
  meetings: Meeting[];
  attendances: Attendance[];
  activeMeeting: Meeting | null;
  onAttendanceChanged?: () => void;
}

export const ReportRecap: React.FC<ReportRecapProps> = ({
  members,
  meetings,
  attendances,
  activeMeeting,
  onAttendanceChanged,
}) => {
  const [recapMode, setRecapMode] = useState<'single' | 'monthly'>('single');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    activeMeeting ? activeMeeting.id : meetings[0]?.id || ''
  );
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [manualLoadingId, setManualLoadingId] = useState<string | null>(null);

  // Month selector for Monthly Matrix view (format: YYYY-MM)
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Filter only Angkatan 21 active students
  const a21Students = useMemo(() => {
    return members.filter((m) => m.generation === 21 && m.status === 'active');
  }, [members]);

  // Distinct classes in Angkatan 21
  const classList = useMemo(() => {
    const set = new Set(a21Students.map((m) => m.class_name));
    return Array.from(set).sort();
  }, [a21Students]);

  // Available months from meetings list
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    meetings.forEach((m) => {
      if (m.meeting_date) {
        monthsSet.add(m.meeting_date.slice(0, 7));
      }
    });
    monthsSet.add(currentMonthStr);
    return Array.from(monthsSet).sort().reverse();
  }, [meetings, currentMonthStr]);

  // ==========================================
  // SINGLE MEETING RECAP LOGIC
  // ==========================================
  const currentMeetingAttendances = useMemo(() => {
    return attendances.filter((a) => a.meeting_id === selectedMeetingId);
  }, [attendances, selectedMeetingId]);

  const attendedMemberIds = useMemo(() => {
    return new Set(currentMeetingAttendances.map((a) => a.member_id));
  }, [currentMeetingAttendances]);

  const singleReportRows = useMemo(() => {
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

  const singlePresentCount = singleReportRows.filter((r) => r.isPresent).length;
  const singlePercentage = singleReportRows.length > 0 
    ? Math.round((singlePresentCount / singleReportRows.length) * 100) 
    : 0;

  // Handler: Tandai Hadir Manual (Dispensasi izin pindah ekskul)
  const handleToggleManualAttendance = async (member: Member, isPresent: boolean, attRecord?: Attendance) => {
    if (!selectedMeetingId) return;
    sound.playPop();
    setManualLoadingId(member.id);

    try {
      if (isPresent && attRecord) {
        // Hapus absen
        await supabase.from('attendances').delete().eq('id', attRecord.id);
      } else {
        // Tambah absen manual
        await supabase.from('attendances').insert({
          meeting_id: selectedMeetingId,
          member_id: member.id,
          feedback_rating: 'okay',
          critique: 'Presensi Manual / Dispensasi Pindah Ekskul',
          is_anonymous: false,
        });
      }
      if (onAttendanceChanged) onAttendanceChanged();
    } catch (err: any) {
      console.error('Error toggling manual attendance:', err);
      sound.playError();
      alert('Gagal mengubah status presensi: ' + err.message);
    } finally {
      setManualLoadingId(null);
    }
  };

  // ==========================================
  // MONTHLY MATRIX RECAP LOGIC (OPSI B - 4 PEKAN BULANAN LENGKAP)
  // ==========================================
  interface MonthSlot {
    dateStr: string;
    displayDate: string;
    weekLabel: string;
    meeting: Meeting | null;
    isPastOrToday: boolean;
  }

  // Menghitung seluruh hari Rabu dalam bulan yang dipilih + sesi yang tersimpan di DB
  const monthSlots = useMemo<MonthSlot[]>(() => {
    const [yStr, mStr] = selectedMonth.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1; // 0-indexed in Date
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Sesi yang sudah ada di database untuk bulan ini
    const existingMeetings = meetings.filter(
      (m) => m.meeting_date && m.meeting_date.startsWith(selectedMonth)
    );

    // 2. Kumpulkan seluruh hari Rabu dalam bulan ini
    const wednesdayDates: string[] = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      if (d.getDay() === 3) {
        // 3 = Rabu
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        wednesdayDates.push(`${yyyy}-${mm}-${dd}`);
      }
      d.setDate(d.getDate() + 1);
    }

    // Gabungkan tanggal hari Rabu & tanggal pertemuan DB
    const allDateSet = new Set<string>([
      ...wednesdayDates,
      ...existingMeetings.map((m) => m.meeting_date),
    ]);
    const sortedDates = Array.from(allDateSet).sort();

    return sortedDates.map((dateStr, idx) => {
      const matchedMeeting = existingMeetings.find((m) => m.meeting_date === dateStr) || null;
      const parts = dateStr.split('-');
      const dd = parts[2];
      const mm = parts[1];
      return {
        dateStr,
        displayDate: `${dd}/${mm}`,
        weekLabel: `Pekan ${idx + 1}`,
        meeting: matchedMeeting,
        isPastOrToday: dateStr <= todayStr,
      };
    });
  }, [selectedMonth, meetings]);

  // Sesi efektif yang sudah benar-benar berjalan & bukan libur (pembagi nilai rapor)
  const heldNonHolidayMeetings = useMemo(() => {
    return monthSlots.filter((s) => s.meeting && !s.meeting.is_holiday);
  }, [monthSlots]);

  // Attendance lookup: Map key = `${meeting_id}_${member_id}`
  const attendanceLookup = useMemo(() => {
    const map = new Map<string, Attendance>();
    attendances.forEach((a) => {
      map.set(`${a.meeting_id}_${a.member_id}`, a);
    });
    return map;
  }, [attendances]);

  const monthlyMatrixRows = useMemo(() => {
    return a21Students
      .filter((m) => {
        const matchesClass = selectedClass === 'all' || m.class_name === selectedClass;
        const matchesName =
          !searchName.trim() || m.name.toLowerCase().includes(searchName.toLowerCase());
        return matchesClass && matchesName;
      })
      .map((m) => {
        let presentCount = 0;
        const slotStatuses = monthSlots.map((slot) => {
          if (!slot.meeting) {
            return {
              slot,
              status: slot.isPastOrToday ? ('no_session' as const) : ('upcoming' as const),
            };
          }
          if (slot.meeting.is_holiday) {
            return { slot, status: 'holiday' as const };
          }
          const hasAtt = attendanceLookup.has(`${slot.meeting.id}_${m.id}`);
          if (hasAtt) {
            presentCount++;
            return { slot, status: 'present' as const };
          }
          if (slot.isPastOrToday) {
            return { slot, status: 'absent' as const };
          }
          return { slot, status: 'upcoming' as const };
        });

        const totalActive = heldNonHolidayMeetings.length;
        const percent = totalActive > 0 ? Math.round((presentCount / totalActive) * 100) : 100;

        return {
          member: m,
          slotStatuses,
          presentCount,
          percent,
        };
      })
      .sort((a, b) => a.member.class_name.localeCompare(b.member.class_name) || a.member.name.localeCompare(b.member.name));
  }, [a21Students, selectedClass, searchName, monthSlots, heldNonHolidayMeetings, attendanceLookup]);

  // Print to PDF (Clean table without kop surat and without signatures)
  const handlePrintPDF = () => {
    sound.playPop();
    window.print();
  };

  // Export Monthly CSV
  const handleExportMonthlyCSV = () => {
    sound.playPop();
    const dateHeaders = monthSlots.map((s) => {
      if (s.meeting?.is_holiday) return `"${s.displayDate} (LIBUR)"`;
      return `"${s.displayDate} (${s.weekLabel})"`;
    });
    const headers = ['No', 'Nama Lengkap', 'Kelas', ...dateHeaders, 'Total Hadir', 'Persentase'];

    const rows = monthlyMatrixRows.map((r, idx) => {
      const datesData = r.slotStatuses.map((s) => {
        if (s.status === 'holiday') return '"LIBUR"';
        if (s.status === 'present') return '"Hadir"';
        if (s.status === 'absent') return '"Alpha"';
        return '"-"';
      });

      return [
        `"${idx + 1}"`,
        `"${r.member.name}"`,
        `"${r.member.class_name}"`,
        ...datesData,
        `"${r.presentCount}"`,
        `"${r.percent}%"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Bulanan_EC_SMEGA_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format month label
  const formatMonthTitle = (mStr: string) => {
    const [y, m] = mStr.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const mIdx = parseInt(m, 10) - 1;
    return `${monthNames[mIdx] || m} ${y}`;
  };

  return (
    <div className="space-y-6">
      {/* Printable Area Specific Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-matrix, #printable-matrix * {
            visibility: visible;
          }
          #printable-matrix {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Mode Switcher Tabs */}
      <div className="no-print flex items-center justify-between gap-3 bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setRecapMode('single');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              recapMode === 'single'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Rekap Sesi Hari Ini</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setRecapMode('monthly');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              recapMode === 'monthly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Rekap Bulanan (Sekretaris)</span>
          </button>
        </div>

        {recapMode === 'monthly' && (
          <div className="flex items-center gap-2">
            <TactileButton variant="white" size="sm" onClick={handlePrintPDF}>
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span>Cetak / Simpan PDF</span>
            </TactileButton>

            <TactileButton variant="brand" size="sm" onClick={handleExportMonthlyCSV}>
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </TactileButton>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODE 1: REKAP PER PERTEMUAN (WITH MANUAL ATTENDANCE BUTTON) */}
      {/* ========================================================= */}
      {recapMode === 'single' && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm">
              <p className="text-[11px] font-black uppercase text-slate-400">Total Siswa A21</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{a21Students.length}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-sm">
              <p className="text-[11px] font-black uppercase text-emerald-800">Siswa Hadir</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">{singlePresentCount}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm">
              <p className="text-[11px] font-black uppercase text-rose-800">Belum Hadir</p>
              <h3 className="text-2xl font-black text-rose-700 mt-1">{singleReportRows.length - singlePresentCount}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-300 shadow-sm">
              <p className="text-[11px] font-black uppercase text-blue-800">Persentase</p>
              <h3 className="text-2xl font-black text-blue-700 mt-1">{singlePercentage}%</h3>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-4 sm:p-6 space-y-4">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.meeting_date} — {m.title} {m.is_holiday ? '(🌴 Libur)' : ''}
                  </option>
                ))}
              </select>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="all">Semua Kelas ({a21Students.length} Siswa)</option>
                {classList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>

              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Cari nama adik kelas..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3">Nama Siswa</th>
                    <th className="py-3 px-3">Kelas</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Aksi Cepat (Izin/Dispensasi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {singleReportRows.map((r, idx) => (
                    <tr
                      key={r.member.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        r.isPresent ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-slate-900 font-extrabold">{r.member.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {r.member.class_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {r.isPresent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                            <UserCheck className="w-3 h-3" />
                            Hadir
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                            <UserX className="w-3 h-3" />
                            Alpha
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          disabled={manualLoadingId === r.member.id}
                          onClick={() => handleToggleManualAttendance(r.member, r.isPresent, r.attendance)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                            r.isPresent
                              ? 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700 shadow-[0_2px_0_0_#15803d] active:translate-y-0.5'
                          }`}
                        >
                          {manualLoadingId === r.member.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                          ) : r.isPresent ? (
                            'Batalkan Hadir'
                          ) : (
                            'Tandai Hadir (Izin/Dispen)'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: REKAP MATRIKS BULANAN (UNTUK SEKRETARIS & PRINT PDF) */}
      {/* ========================================================= */}
      {recapMode === 'monthly' && (
        <div id="printable-matrix" className="space-y-4 bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-6">
          {/* Official Clean Heading for PDF (NO KOP SURAT / NO SIGNATURES) */}
          <div className="border-b border-slate-200 pb-4 text-center">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              REKAPITULASI PRESENSI BULANAN EKSTRAKURIKULER ENGLISH CLUB
            </h2>
            <p className="text-sm font-extrabold text-slate-600 mt-1">
              SMK NEGERI 1 PURBALINGGA — ANGKATAN 21
            </p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Periode: {formatMonthTitle(selectedMonth)} • Sesi Berjalan: {heldNonHolidayMeetings.length} Pertemuan ({monthSlots.length} Slot Pekan)
            </p>
          </div>

          {/* Filter Bar (Hidden in Print) */}
          <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Pilih Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  sound.playPop();
                  setSelectedMonth(e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthTitle(m)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Filter Kelas
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="all">Semua Kelas ({a21Students.length} Siswa)</option>
                {classList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          {monthSlots.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileSpreadsheet className="w-10 h-10 mx-auto opacity-40 mb-2" />
              <p className="text-xs font-bold">Belum ada sesi pertemuan yang tercatat di bulan {formatMonthTitle(selectedMonth)}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-black">
                  <tr>
                    <th className="border border-slate-300 py-2.5 px-2 w-8 text-center">No</th>
                    <th className="border border-slate-300 py-2.5 px-3 min-w-[160px]">Nama Lengkap</th>
                    <th className="border border-slate-300 py-2.5 px-2.5 w-20 text-center">Kelas</th>
                    {monthSlots.map((slot) => (
                      <th
                        key={slot.dateStr}
                        className={`border border-slate-300 py-2.5 px-2 text-center text-[11px] min-w-[70px] ${
                          slot.meeting?.is_holiday ? 'bg-amber-100 text-amber-900' : ''
                        }`}
                      >
                        <div className="font-extrabold">{slot.displayDate}</div>
                        <span className="text-[9px] font-bold text-slate-500 block">
                          {slot.meeting?.is_holiday ? 'Libur' : slot.weekLabel}
                        </span>
                      </th>
                    ))}
                    <th className="border border-slate-300 py-2.5 px-2 text-center w-16 bg-slate-200">Hadir</th>
                    <th className="border border-slate-300 py-2.5 px-2 text-center w-16 bg-slate-200">% Rapor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-bold">
                  {monthlyMatrixRows.map((r, idx) => (
                    <tr key={r.member.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 py-2 px-2 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                      <td className="border border-slate-300 py-2 px-3 text-slate-900 font-extrabold">{r.member.name}</td>
                      <td className="border border-slate-300 py-2 px-2.5 text-center text-slate-600 text-[11px]">{r.member.class_name}</td>
                      {r.slotStatuses.map((st, sIdx) => (
                        <td
                          key={sIdx}
                          className={`border border-slate-300 py-2 px-2 text-center text-sm ${
                            st.status === 'holiday'
                              ? 'bg-amber-50 text-amber-600 font-bold text-[10px]'
                              : st.status === 'present'
                              ? 'text-emerald-600 font-black'
                              : st.status === 'absent'
                              ? 'text-rose-400 font-black'
                              : 'text-slate-300 font-bold'
                          }`}
                        >
                          {st.status === 'holiday' ? 'LIBUR' : st.status === 'present' ? '✓' : st.status === 'absent' ? '✗' : '-'}
                        </td>
                      ))}
                      <td className="border border-slate-300 py-2 px-2 text-center font-mono font-black text-slate-900 bg-slate-50">
                        {r.presentCount}
                      </td>
                      <td className={`border border-slate-300 py-2 px-2 text-center font-mono font-black ${
                        r.percent >= 75 ? 'text-emerald-700 bg-emerald-50/50' : 'text-rose-700 bg-rose-50/50'
                      }`}>
                        {r.percent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
