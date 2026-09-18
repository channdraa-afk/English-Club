import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  RefreshCw,
  HandHeart,
  Zap,
  FileText
} from 'lucide-react';
import { Member, Meeting, Attendance } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';

interface HelperAttendanceA21Props {
  members: Member[];
  activeMeeting: Meeting | null;
  attendances: Attendance[];
  onAttendanceChanged: () => void;
}

export const HelperAttendanceA21: React.FC<HelperAttendanceA21Props> = ({
  members,
  activeMeeting,
  attendances,
  onAttendanceChanged,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [recentHelped, setRecentHelped] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 0ms Optimistic UI State
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

  const attendedSet = useMemo(() => {
    return new Set(currentAttendances.map((a) => a.member_id));
  }, [currentAttendances]);

  // Distinct classes
  const classList = useMemo(() => {
    const set = new Set(a21Students.map((m) => m.class_name));
    return Array.from(set).sort();
  }, [a21Students]);

  // Filter students who have NOT attended yet
  const unAttendedStudents = useMemo(() => {
    return a21Students
      .filter((m) => !attendedSet.has(m.id))
      .filter((m) => {
        const matchClass = selectedClass === 'all' || m.class_name === selectedClass;
        const matchSearch =
          !searchQuery.trim() ||
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.class_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchClass && matchSearch;
      })
      .sort((a, b) => a.class_name.localeCompare(b.class_name) || a.name.localeCompare(b.name));
  }, [a21Students, attendedSet, selectedClass, searchQuery]);

  // Handle Quick Assist (Bantu Hadirkan) - 0ms Optimistic UI
  const handleQuickAssist = async (student: Member) => {
    if (!activeMeeting) {
      sound.playError();
      setErrorMessage('Belum ada sesi eskul aktif saat ini!');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    sound.playPop();
    const previousAttendances = [...optimisticAttendances];

    // 0ms Optimistic UI update
    const updated = previousAttendances.filter(
      (a) => !(a.meeting_id === activeMeeting.id && a.member_id === student.id)
    );
    updated.push({
      id: 'opt_' + Date.now() + '_' + Math.random(),
      meeting_id: activeMeeting.id,
      member_id: student.id,
      feedback_rating: 'super_fun',
      next_agenda_suggestion: 'Dibantu absen hadir oleh Kakak Kelas',
      is_anonymous: false,
      submitted_at: new Date().toISOString(),
    });

    setOptimisticAttendances(updated);
    setRecentHelped(`${student.name} (✓ Hadir)`);
    setTimeout(() => setRecentHelped(null), 3000);
    setLoadingId(student.id);

    try {
      // 1. Delete any existing record for this meeting & member (clean slate)
      await supabase
        .from('attendances')
        .delete()
        .eq('meeting_id', activeMeeting.id)
        .eq('member_id', student.id);

      // 2. Insert fresh presence record
      const { error } = await supabase.from('attendances').insert({
        meeting_id: activeMeeting.id,
        member_id: student.id,
        feedback_rating: 'super_fun',
        next_agenda_suggestion: 'Dibantu absen hadir oleh Kakak Kelas',
        is_anonymous: false,
      });

      if (error) throw error;
      sound.playSuccess();
      onAttendanceChanged();
    } catch (err: any) {
      console.error('Error assisting attendance:', err);
      // Rollback on failure
      setOptimisticAttendances(previousAttendances);
      sound.playError();
      setErrorMessage('Gagal membantu presensi: ' + err.message);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setLoadingId(null);
    }
  };

  // Handle Quick Permit (Tandai Izin Surat Fisik) - 0ms Optimistic UI
  const handleQuickPermit = async (student: Member) => {
    if (!activeMeeting) {
      sound.playError();
      setErrorMessage('Belum ada sesi eskul aktif saat ini! Untuk pertemuan lama, atur di tab Rekap Rapor Bulanan.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    sound.playPop();
    const previousAttendances = [...optimisticAttendances];

    // 0ms Optimistic UI update
    const updated = previousAttendances.filter(
      (a) => !(a.meeting_id === activeMeeting.id && a.member_id === student.id)
    );
    updated.push({
      id: 'opt_' + Date.now() + '_' + Math.random(),
      meeting_id: activeMeeting.id,
      member_id: student.id,
      feedback_rating: 'okay',
      next_agenda_suggestion: 'Izin Resmi (Menyerahkan Surat Fisik)',
      critique: 'IZIN_SURAT_FISIK',
      is_anonymous: false,
      submitted_at: new Date().toISOString(),
    });

    setOptimisticAttendances(updated);
    setRecentHelped(`${student.name} (📄 Izin Surat Fisik)`);
    setTimeout(() => setRecentHelped(null), 3000);
    setLoadingId(student.id);

    try {
      // 1. Delete any existing record for this meeting & member (clean slate)
      await supabase
        .from('attendances')
        .delete()
        .eq('meeting_id', activeMeeting.id)
        .eq('member_id', student.id);

      // 2. Insert fresh permit record
      const { error } = await supabase.from('attendances').insert({
        meeting_id: activeMeeting.id,
        member_id: student.id,
        feedback_rating: 'okay',
        next_agenda_suggestion: 'Izin Resmi (Menyerahkan Surat Fisik)',
        critique: 'IZIN_SURAT_FISIK',
        is_anonymous: false,
      });

      if (error) throw error;
      sound.playSuccess();
      onAttendanceChanged();
    } catch (err: any) {
      console.error('Error recording permit:', err);
      // Rollback on failure
      setOptimisticAttendances(previousAttendances);
      sound.playError();
      setErrorMessage('Gagal mencatat izin: ' + err.message);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white border-2 border-blue-900 shadow-[0_6px_0_0_#1e3a8a] space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-2xl bg-blue-500/30 text-blue-200 border border-blue-400/40">
            <HandHeart className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
              Bantuan Presensi Langsung
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Bantu Absen Adik Kelas (Tanpa Token)
            </h2>
          </div>
        </div>

        <p className="text-xs font-bold text-blue-100/90 leading-relaxed max-w-xl">
          Gunakan menu ini jika ada adik kelas yang hadir namun <strong>tidak membawa HP, kuota habis, atau izin di tengah eskul</strong>.
          Cukup cari nama adik kelas di bawah dan klik <strong>Bantu Hadirkan</strong> tanpa perlu memasukkan token!
        </p>

        {recentHelped && (
          <div className="p-3 rounded-2xl bg-emerald-500/30 border border-emerald-300 text-emerald-100 text-xs font-extrabold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Berhasil mencatat kehadiran untuk <strong>{recentHelped}</strong>!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/30 border border-rose-300 text-rose-100 text-xs font-extrabold flex items-center gap-2 animate-fade-in">
            <span className="text-base shrink-0">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama adik kelas yang mau dibantu..."
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
            <option value="all">Semua Kelas</option>
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1 border-t border-slate-100">
          <span>Menampilkan <strong>{unAttendedStudents.length}</strong> siswa yang belum presensi</span>
          <span>Total A21: {a21Students.length} siswa</span>
        </div>
      </div>

      {/* List of un-attended students */}
      <div className="space-y-2">
        {unAttendedStudents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-300 p-6 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-black text-slate-800">Semua Adik Kelas Sudah Hadir!</h4>
            <p className="text-xs font-bold text-slate-400">
              Tidak ada siswa yang tersisa pada kriteria filter ini.
            </p>
          </div>
        ) : (
          unAttendedStudents.map((student) => {
            const isLoading = loadingId === student.id;

            return (
              <div
                key={student.id}
                className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_2px_0_0_#e2e8f0] flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="space-y-0.5">
                  <h4 className="font-black text-xs text-slate-900">{student.name}</h4>
                  <span className="inline-block px-2 py-0.2 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black">
                    {student.class_name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <TactileButton
                    onClick={() => handleQuickAssist(student)}
                    disabled={isLoading}
                    variant="blue"
                    size="sm"
                    className="py-1 px-2.5 text-xs font-black"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    <span>Hadir</span>
                  </TactileButton>

                  <TactileButton
                    onClick={() => handleQuickPermit(student)}
                    disabled={isLoading}
                    variant="amber"
                    size="sm"
                    className="py-1 px-2.5 text-xs font-black"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    <span>Izin (Surat)</span>
                  </TactileButton>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
