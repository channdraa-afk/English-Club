import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldAlert, 
  Sliders, 
  Check, 
  X, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2
} from 'lucide-react';
import { Member, Attendance } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';

interface MemberRosterManagerProps {
  members: Member[];
  attendances: Attendance[];
  onMemberMutated: () => void;
}

const SMEGA_CLASSES = [
  'X AKL 1', 'X AKL 2', 'X AKL 3',
  'X MPLB 1', 'X MPLB 2',
  'X PM 1', 'X PM 2',
  'X Kuliner 1', 'X Kuliner 2',
  'X Busana 1', 'X Busana 2',
  'X PPLG 1', 'X PPLG 2',
  'X DKV 1', 'X DKV 2',
  'XI AKL 1', 'XI AKL 2', 'XI AKL 3',
  'XI MPLB 1', 'XI MPLB 2',
  'XI PM 1', 'XI PM 2',
  'XI Kuliner 1', 'XI Kuliner 2',
  'XI Busana 1', 'XI Busana 2',
  'XI PPLG 1', 'XI PPLG 2',
  'XI DKV 1', 'XI DKV 2',
  'XII AKL 1', 'XII PPLG 1', 'Lainnya'
];

export const MemberRosterManager: React.FC<MemberRosterManagerProps> = ({
  members,
  attendances,
  onMemberMutated,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'a21' | 'a20' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form states for Add Member
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('X PPLG 1');
  const [customClass, setCustomClass] = useState('');
  const [newGeneration, setNewGeneration] = useState<number>(21);
  const [newRole, setNewRole] = useState<'member' | 'mentor'>('member');
  const [newPosition, setNewPosition] = useState('Anggota');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Safeguard state for Editing/Deactivating
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive'>('active');
  const [confirmDeactivateChecked, setConfirmDeactivateChecked] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);

  // Calculate attendance count map
  const attendanceCountMap = useMemo(() => {
    const map = new Map<string, number>();
    attendances.forEach((att) => {
      map.set(att.member_id, (map.get(att.member_id) || 0) + 1);
    });
    return map;
  }, [attendances]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Tab filter
      if (activeTab === 'a21' && (m.generation !== 21 || m.status !== 'active')) return false;
      if (activeTab === 'a20' && (m.generation !== 20 || m.status !== 'active')) return false;
      if (activeTab === 'inactive' && m.status !== 'inactive') return false;
      if (activeTab === 'all' && m.status !== 'active') return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(query);
        const matchClass = m.class_name.toLowerCase().includes(query);
        const matchPosition = (m.position || '').toLowerCase().includes(query);
        return matchName || matchClass || matchPosition;
      }
      return true;
    });
  }, [members, activeTab, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const a21Active = members.filter((m) => m.generation === 21 && m.status === 'active').length;
    const a20Active = members.filter((m) => m.generation === 20 && m.status === 'active').length;
    const inactive = members.filter((m) => m.status === 'inactive').length;
    return { a21Active, a20Active, inactive, total: members.length };
  }, [members]);

  // Open Edit Modal
  const handleOpenEdit = (member: Member) => {
    sound.playPop();
    setEditingMember(member);
    setTargetStatus(member.status);
    setConfirmDeactivateChecked(false);
    setDeleteConfirmationInput('');
    setIsDangerZoneOpen(false);
    setFormError(null);
  };

  // Submit Add Member
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = newName.trim();
    if (cleanName.length < 3) {
      sound.playError();
      setFormError('Nama anggota minimal 3 karakter!');
      return;
    }

    const finalClass = newClass === 'Lainnya' ? customClass.trim().toUpperCase() : newClass;
    if (!finalClass) {
      sound.playError();
      setFormError('Silakan pilih atau ketik kelas yang valid!');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('members').insert({
        name: cleanName,
        class_name: finalClass,
        generation: newGeneration,
        role: newRole,
        position: newPosition.trim() || 'Anggota',
        status: 'active',
      });

      if (error) throw error;

      sound.playSuccess();
      setNewName('');
      setCustomClass('');
      setIsAddModalOpen(false);
      onMemberMutated();
    } catch (err: any) {
      sound.playError();
      setFormError('Gagal menambahkan anggota: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Status Change (Soft Delete / Reactivate)
  const handleUpdateStatus = async () => {
    if (!editingMember) return;
    setFormError(null);

    // If changing to inactive, require two-step checkbox
    if (targetStatus === 'inactive' && !confirmDeactivateChecked) {
      sound.playError();
      setFormError('Harap centang konfirmasi pengunduran diri terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({ status: targetStatus })
        .eq('id', editingMember.id);

      if (error) throw error;

      sound.playSuccess();
      setEditingMember(null);
      onMemberMutated();
    } catch (err: any) {
      sound.playError();
      setFormError('Gagal memperbarui status anggota: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Hard Delete (GitHub Safeguard)
  const handleHardDelete = async () => {
    if (!editingMember) return;
    if (deleteConfirmationInput.trim() !== 'HAPUS SISWA') {
      sound.playError();
      setFormError('Teks konfirmasi salah! Wajib mengetik HAPUS SISWA.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', editingMember.id);

      if (error) throw error;

      sound.playSuccess();
      setEditingMember(null);
      onMemberMutated();
    } catch (err: any) {
      sound.playError();
      setFormError('Gagal menghapus anggota: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Action Banner */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Pusat Kendali Master Roster (Super Admin Only)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Kelola Master Anggota & Mutasi Siswa
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl">
              Tambah siswa susulan, nonaktifkan anggota yang keluar/pindah sekolah, atau kelola status aktif dengan protokol pengaman berlapis anti-senggol.
            </p>
          </div>

          <TactileButton
            onClick={() => {
              sound.playPop();
              setIsAddModalOpen(true);
              setFormError(null);
            }}
            variant="emerald"
            size="md"
            className="w-full sm:w-auto shrink-0 py-2.5 px-4 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Anggota Manual</span>
          </TactileButton>
        </div>

        {/* 2. Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t-2 border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Adik Kelas (A21)</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600">{stats.a21Active} <span className="text-xs font-bold text-slate-400">Aktif</span></p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Pengurus (A20)</p>
            <p className="text-xl sm:text-2xl font-black text-blue-600">{stats.a20Active} <span className="text-xs font-bold text-slate-400">Aktif</span></p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Nonaktif / Keluar</p>
            <p className="text-xl sm:text-2xl font-black text-rose-500">{stats.inactive} <span className="text-xs font-bold text-slate-400">Arsip</span></p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total Database</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.total} <span className="text-xs font-bold text-slate-400">Jiwa</span></p>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-x-auto">
          {[
            { id: 'all', label: `Semua Aktif (${stats.a21Active + stats.a20Active})` },
            { id: 'a21', label: `Adik A21 (${stats.a21Active})` },
            { id: 'a20', label: `Pengurus A20 (${stats.a20Active})` },
            { id: 'inactive', label: `Nonaktif (${stats.inactive})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playPop();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau kelas..."
            className="w-full pl-9 pr-3 py-2 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
          />
        </div>
      </div>

      {/* 4. Members Table / Roster */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider font-black">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Angkatan</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Riwayat Hadir</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    Tidak ditemukan data anggota yang cocok.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => {
                  const attendCount = attendanceCountMap.get(m.id) || 0;
                  const isInactive = m.status === 'inactive';

                  return (
                    <tr 
                      key={m.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isInactive ? 'bg-slate-50/50 text-slate-400' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-black ${isInactive ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {m.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-[11px] border border-slate-200">
                          {m.class_name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-black border ${
                          m.generation === 20 
                            ? 'bg-blue-50 text-blue-800 border-blue-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          Angkatan {m.generation}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-bold">
                        {m.position || 'Anggota'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-extrabold text-slate-900">{attendCount}</span> sesi
                      </td>
                      <td className="py-3 px-4">
                        {isInactive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-black">
                            <span>Nonaktif / Keluar</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Aktif</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(m)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-700 text-xs font-black shadow-sm active:translate-y-0.5 transition-all cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-slate-500" />
                          <span>Atur Status</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: TAMBAH ANGGOTA MANUAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-slate-300 shadow-[0_8px_0_0_#94a3b8] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sound.playPop();
                setIsAddModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Form Anggota Susulan</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Tambah Anggota Manual</h3>
              <p className="text-xs font-medium text-slate-500">
                Data akan langsung aktif dan dapat mengisi presensi pada sesi eskul.
              </p>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Muhammad Bintang Pratama"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  autoFocus
                />
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Kelas *
                </label>
                <select
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                >
                  {SMEGA_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                {newClass === 'Lainnya' && (
                  <input
                    type="text"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="Ketik nama kelas (misal: X TBG 1)..."
                    className="w-full mt-2 px-3.5 py-2 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                )}
              </div>

              {/* Angkatan & Peran */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Angkatan
                  </label>
                  <select
                    value={newGeneration}
                    onChange={(e) => {
                      const gen = Number(e.target.value);
                      setNewGeneration(gen);
                      setNewRole(gen === 20 ? 'mentor' : 'member');
                      setNewPosition(gen === 20 ? 'Pengurus A20' : 'Anggota');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={21}>Angkatan 21 (Adik Kelas)</option>
                    <option value={20}>Angkatan 20 (Pengurus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Posisi / Jabatan
                  </label>
                  <input
                    type="text"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="Anggota / Sie..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-100 text-xs"
                >
                  Batal
                </button>
                <TactileButton
                  type="submit"
                  variant="emerald"
                  size="md"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN ANGGOTA'}</span>
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ATUR STATUS & ANTI-KEPENCET SAFEGUARD ================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-slate-300 shadow-[0_8px_0_0_#94a3b8] p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sound.playPop();
                setEditingMember(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Profil Anggota */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Pengaturan Status Anggota</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">{editingMember.name}</h3>
              <p className="text-xs font-extrabold text-slate-500">
                {editingMember.class_name} • Angkatan {editingMember.generation} • {editingMember.position || 'Anggota'}
              </p>
            </div>

            {/* Riwayat Kehadiran Info Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-700">Total Riwayat Kehadiran Siswa</p>
                <p className="text-[11px] font-medium text-slate-500">
                  Data presensi tersimpan aman di buku besar rapor English Club.
                </p>
              </div>
              <span className="text-base font-black px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-900 shadow-sm">
                {attendanceCountMap.get(editingMember.id) || 0} Kali Hadir
              </span>
            </div>

            {/* Pilih Status */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-slate-700">
                Status Keanggotaan Saat Ini:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setTargetStatus('active');
                  }}
                  className={`p-3 rounded-2xl border-2 text-left font-black transition-all cursor-pointer ${
                    targetStatus === 'active'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className={`w-4 h-4 ${targetStatus === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Aktif Mengikuti Eskul</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 mt-1">
                    Nama muncul di form presensi hari Rabu dan rekap live.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setTargetStatus('inactive');
                  }}
                  className={`p-3 rounded-2xl border-2 text-left font-black transition-all cursor-pointer ${
                    targetStatus === 'inactive'
                      ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <X className={`w-4 h-4 ${targetStatus === 'inactive' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span>Nonaktif / Keluar</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 mt-1">
                    Nama hilang dari form absen, riwayat hadir masa lalu tetap aman.
                  </p>
                </button>
              </div>
            </div>

            {/* Two-Step Checkbox Guard saat Menonaktifkan */}
            {targetStatus === 'inactive' && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 font-bold space-y-1">
                    <p className="font-black">Protokol Pengaman Siswa Keluar</p>
                    <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                      Siswa ini tidak akan bisa mengisi presensi lagi di hari Rabu mendatang. Nilai dan rekap hadir masa lalunya tetap utuh di rapor.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-amber-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmDeactivateChecked}
                    onChange={(e) => {
                      sound.playPop();
                      setConfirmDeactivateChecked(e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs font-black text-amber-950 leading-snug">
                    Saya menyatakan bahwa <span className="underline">{editingMember.name}</span> resmi mengundurkan diri / nonaktif dari English Club SMEGA.
                  </span>
                </label>
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIsDangerZoneOpen(!isDangerZoneOpen);
                }}
                className="text-[11px] font-black text-rose-600 hover:text-rose-800 underline cursor-pointer"
              >
                {isDangerZoneOpen ? 'Tutup Opsi Hapus' : 'Opsi Hapus Permanen ⚠️'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-100 text-xs"
                >
                  Batal
                </button>
                <TactileButton
                  onClick={handleUpdateStatus}
                  variant={targetStatus === 'inactive' ? 'amber' : 'emerald'}
                  size="md"
                  disabled={isSubmitting || (targetStatus === 'inactive' && !confirmDeactivateChecked)}
                  className="px-5 py-2 text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'MEMPROSES...'
                      : targetStatus === 'inactive'
                      ? 'NONAKTIFKAN SISWA'
                      : 'SIMPAN PERUBAHAN'}
                  </span>
                </TactileButton>
              </div>
            </div>

            {/* DANGER ZONE: Hard Delete (GitHub Repository Deletion Safeguard) */}
            {isDangerZoneOpen && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <Trash2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-950 font-bold space-y-1">
                    <p className="font-black text-rose-700">Hapus Permanen dari Database (Hard Delete)</p>
                    <p className="text-[11px] text-rose-900 font-medium leading-relaxed">
                      ⚠️ <span className="font-black">PERINGATAN SAKRAL:</span> Tindakan ini akan menghapus siswa ini secara total dari database beserta seluruh riwayat absensinya. Hanya gunakan ini jika salah ketik nama dobel!
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-rose-800 mb-1">
                    Ketik persis frasa <code className="bg-white px-1.5 py-0.5 rounded border border-rose-300 font-mono text-rose-700">HAPUS SISWA</code> untuk membuka gembok:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationInput}
                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                    placeholder="Ketik HAPUS SISWA..."
                    className="w-full px-3.5 py-2 bg-white border-2 border-rose-300 rounded-xl text-xs font-mono font-bold text-rose-900 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <TactileButton
                  onClick={handleHardDelete}
                  variant="rose"
                  size="md"
                  disabled={deleteConfirmationInput.trim() !== 'HAPUS SISWA' || isSubmitting}
                  className="w-full py-2.5 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'MENGHAPUS DARI DATABASE...'
                      : deleteConfirmationInput.trim() === 'HAPUS SISWA'
                      ? 'HAPUS PERMANEN SEKARANG 🗑️'
                      : 'TERKUNCI (KETIK HAPUS SISWA)'}
                  </span>
                </TactileButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
