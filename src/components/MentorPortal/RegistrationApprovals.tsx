import React, { useState } from 'react';
import { UserCheck, Phone, Check, X, RefreshCw, AlertTriangle, ShieldCheck, Edit3, Sparkles } from 'lucide-react';
import { Registration, Member } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { safeStorage } from '../../lib/storage';
import { supabase } from '../../lib/supabase';

interface RegistrationApprovalsProps {
  registrations: Registration[];
  members?: Member[];
  onRefreshRegistrations: () => void;
  onMemberAdded: () => void;
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
  'Lainnya (Ketik Manual)'
];

export const RegistrationApprovals: React.FC<RegistrationApprovalsProps> = ({
  registrations,
  members = [],
  onRefreshRegistrations,
  onMemberAdded,
}) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review & Edit Modal State
  const [reviewTarget, setReviewTarget] = useState<Registration | null>(null);
  const [editName, setEditName] = useState('');
  const [editClass, setEditClass] = useState('X AKL 1');
  const [customClass, setCustomClass] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const filteredList = registrations.filter((r) => r.status === filter);

  // Find existing member by name (case-insensitive & trimmed)
  const getExistingMember = (fullName: string) => {
    const normalized = fullName.toLowerCase().trim();
    return members.find((m) => m.name.toLowerCase().trim() === normalized);
  };

  // Open Review & Edit Modal
  const handleOpenReview = (reg: Registration) => {
    sound.playPop();
    setReviewTarget(reg);
    setEditName(reg.full_name.trim());
    
    // Check if class exists in SMEGA_CLASSES
    const matchedClass = SMEGA_CLASSES.find((c) => c.toLowerCase() === reg.class_name.toLowerCase().trim());
    if (matchedClass) {
      setEditClass(matchedClass);
      setCustomClass('');
    } else {
      setEditClass('Lainnya (Ketik Manual)');
      setCustomClass(reg.class_name.trim());
    }
  };

  // Execute Approval after Human Review & Verification
  const handleConfirmApprove = async () => {
    if (!reviewTarget) return;

    const finalName = editName.trim();
    const finalClass = editClass === 'Lainnya (Ketik Manual)' ? customClass.trim().toUpperCase() : editClass;

    if (!finalName) {
      sound.playError();
      setErrorMessage('Nama lengkap tidak boleh kosong!');
      return;
    }

    if (!finalClass) {
      sound.playError();
      setErrorMessage('Kelas tidak boleh kosong!');
      return;
    }

    // Double-check duplicate prevention
    const existing = members.find((m) => m.name.toLowerCase().trim() === finalName.toLowerCase());
    if (existing) {
      sound.playError();
      setErrorMessage(`Siswa bernama "${finalName}" sudah terdaftar di database (${existing.class_name})! Tidak boleh ada duplikasi nama.`);
      return;
    }

    setIsSubmittingApproval(true);
    try {
      const savedSig = safeStorage.get('ec_superadmin_sig', 'session') || safeStorage.get('ec_superadmin_sig') || '';

      // 1. Prioritize Atomic Server-Side RPC
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('approve_registration_admin', {
        token_input: savedSig,
        reg_id: reviewTarget.id,
        final_name: finalName,
        final_class: finalClass,
      });

      if (!rpcErr && rpcRes && rpcRes.success) {
        sound.playSuccess();
        setReviewTarget(null);
        onRefreshRegistrations();
        onMemberAdded();
        return;
      }

      if (rpcRes && !rpcRes.success && rpcRes.error) {
        throw new Error(rpcRes.error);
      }

      // 2. Fallback to direct tables if RPC is not yet applied
      const { error: insertErr } = await supabase.from('members').insert({
        name: finalName,
        class_name: finalClass,
        generation: 21,
        role: 'member',
        position: 'Anggota',
        status: 'active',
      });

      if (insertErr) throw insertErr;

      const { error: updateErr } = await supabase
        .from('registrations')
        .update({ status: 'approved' })
        .eq('id', reviewTarget.id);

      if (updateErr) throw updateErr;

      sound.playSuccess();
      setReviewTarget(null);
      onRefreshRegistrations();
      onMemberAdded();
    } catch (err: any) {
      console.error('Error approving member:', err);
      sound.playError();
      setErrorMessage('Gagal menyetujui pendaftaran: ' + err.message);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Mark as Already Registered (No Duplicate Insert)
  const handleMarkAlreadyRegistered = async (reg: Registration) => {
    sound.playPop();
    setLoadingId(reg.id);

    try {
      const savedSig = safeStorage.get('ec_superadmin_sig', 'session') || safeStorage.get('ec_superadmin_sig') || '';
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('update_registration_status_admin', {
        token_input: savedSig,
        reg_id: reg.id,
        new_status: 'approved',
      });

      if (!rpcErr && rpcRes && rpcRes.success) {
        sound.playSuccess();
        onRefreshRegistrations();
        return;
      }

      // Fallback
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'approved' })
        .eq('id', reg.id);

      if (error) throw error;

      sound.playSuccess();
      onRefreshRegistrations();
    } catch (err: any) {
      console.error('Error updating status:', err);
      sound.playError();
      setErrorMessage('Gagal memperbarui status: ' + err.message);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (reg: Registration) => {
    sound.playPop();
    setLoadingId(reg.id);

    try {
      const savedSig = safeStorage.get('ec_superadmin_sig', 'session') || safeStorage.get('ec_superadmin_sig') || '';
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('update_registration_status_admin', {
        token_input: savedSig,
        reg_id: reg.id,
        new_status: 'rejected',
      });

      if (!rpcErr && rpcRes && rpcRes.success) {
        sound.playPop();
        onRefreshRegistrations();
        return;
      }

      // Fallback
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'rejected' })
        .eq('id', reg.id);

      if (error) throw error;

      sound.playPop();
      onRefreshRegistrations();
    } catch (err: any) {
      console.error('Error rejecting:', err);
      sound.playError();
      setErrorMessage('Gagal menolak pendaftaran: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm max-w-sm">
        {(['pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              sound.playPop();
              setFilter(tab);
            }}
            className={`flex-1 py-1.5 text-xs font-black rounded-xl capitalize transition-all cursor-pointer ${
              filter === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'pending' ? `Menunggu (${registrations.filter((r) => r.status === 'pending').length})` : tab}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-5 space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-black shadow-[0_2px_0_0_#f43f5e] animate-fade-in flex items-center justify-between gap-2">
            <span>⚠️ {errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-black text-slate-900 text-base">
            {filter === 'pending' ? 'Daftar Calon Anggota yang Menunggu ACC' : `Riwayat Pendaftaran (${filter})`}
          </h3>
          <span className="text-[11px] font-bold text-slate-500">
            Terhubung ke Master Roster ({members.length} Total Anggota di Database)
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto opacity-40 mb-2" />
            <p className="text-xs font-bold">Tidak ada pendaftaran dengan status {filter}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredList.map((reg) => {
              const existingMember = getExistingMember(reg.full_name);

              return (
                <div
                  key={reg.id}
                  className={`p-4 rounded-2xl border-2 shadow-sm space-y-3 transition-all ${
                    existingMember
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-black text-slate-900 text-sm">{reg.full_name}</h4>
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 shrink-0">
                        {reg.class_name}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                      Mendaftar pada: {new Date(reg.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>

                  {/* Duplicate Radar Warning */}
                  {existingMember && (
                    <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold flex items-start gap-2 animate-fade-in">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-black block">Sudah Terdaftar di Database!</span>
                        <p className="text-[11px] font-medium text-amber-800 leading-snug">
                          {existingMember.name} sudah tercatat resmi sebagai siswa {existingMember.class_name} ({existingMember.role === 'mentor' ? 'Pengurus A20' : 'Anggota A21'}).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Link */}
                  <a
                    href={`https://wa.me/${reg.whatsapp_number.replace(/^0/, '62').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WA: {reg.whatsapp_number}</span>
                  </a>

                  {/* Reason */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">Alasan: </span>
                    "{reg.reason}"
                  </div>

                  {/* Action Buttons for Pending */}
                  {filter === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      {existingMember ? (
                        <TactileButton
                          variant="amber"
                          size="sm"
                          disabled={loadingId === reg.id}
                          onClick={() => handleMarkAlreadyRegistered(reg)}
                          className="flex-1 text-amber-900 bg-amber-200 hover:bg-amber-300 border-amber-400"
                        >
                          {loadingId === reg.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />}
                          <span>Tandai Sudah Terdaftar (Anti-Dobel)</span>
                        </TactileButton>
                      ) : (
                        <TactileButton
                          variant="brand"
                          size="sm"
                          disabled={loadingId === reg.id}
                          onClick={() => handleOpenReview(reg)}
                          className="flex-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Review &amp; ACC Anggota</span>
                        </TactileButton>
                      )}

                      <button
                        disabled={loadingId === reg.id}
                        onClick={() => handleReject(reg)}
                        className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Tolak Pendaftaran"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review & Edit Modal Before Adding to Master Database */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-300 shadow-[0_12px_0_0_#0f172a] p-6 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between gap-3 border-b-2 border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Verifikasi &amp; Edit Pra-ACC</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Review Calon Anggota Baru
                </h3>
              </div>
              <button
                onClick={() => setReviewTarget(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Kamu bisa mengoreksi typo nama atau merapikan format kelas pendaftar sebelum nama ini resmi masuk ke daftar presensi dan dokumen laporan bulanan sekolah (.docx).
            </p>

            <div className="space-y-3.5">
              {/* Nama Lengkap Input */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">
                  Nama Lengkap Resmi (Cek Typo &amp; Huruf Kapital):
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama lengkap siswa..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden text-sm font-bold text-slate-900"
                />
              </div>

              {/* Kelas Selector */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">
                  Kelas Resmi SMKN 1 Purbalingga:
                </label>
                <select
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden text-sm font-bold text-slate-900 bg-white"
                >
                  {SMEGA_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {editClass === 'Lainnya (Ketik Manual)' && (
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">Ketik Nama Kelas Manual:</label>
                  <input
                    type="text"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="Misal: X PPLG 1"
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden text-xs font-bold"
                  />
                </div>
              )}

              {/* Info Tambahan Readonly */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Nomor WhatsApp:</span>
                  <span className="font-bold text-slate-800">{reviewTarget.whatsapp_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Alasan Masuk EC:</span>
                  <span className="font-bold text-slate-800 italic line-clamp-1">"{reviewTarget.reason}"</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs border border-slate-300 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Batal
              </button>

              <TactileButton
                variant="emerald"
                size="md"
                disabled={isSubmittingApproval}
                onClick={handleConfirmApprove}
                className="flex-1"
              >
                {isSubmittingApproval ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menerbitkan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ACC &amp; Terbitkan 🚀</span>
                  </>
                )}
              </TactileButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
