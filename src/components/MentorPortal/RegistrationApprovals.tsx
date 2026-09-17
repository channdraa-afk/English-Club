import React, { useState } from 'react';
import { UserCheck, Phone, Check, X, RefreshCw } from 'lucide-react';
import { Registration } from '../../types/database';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';

interface RegistrationApprovalsProps {
  registrations: Registration[];
  onRefreshRegistrations: () => void;
  onMemberAdded: () => void;
}

export const RegistrationApprovals: React.FC<RegistrationApprovalsProps> = ({
  registrations,
  onRefreshRegistrations,
  onMemberAdded,
}) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredList = registrations.filter((r) => r.status === filter);

  const handleApprove = async (reg: Registration) => {
    sound.playPop();
    setLoadingId(reg.id);

    try {
      // 1. Insert into members table
      const { error: insertErr } = await supabase.from('members').insert({
        name: reg.full_name,
        class_name: reg.class_name,
        generation: 21,
        role: 'member',
        position: 'Anggota',
        status: 'active',
      });

      if (insertErr) throw insertErr;

      // 2. Update registration status to approved
      const { error: updateErr } = await supabase
        .from('registrations')
        .update({ status: 'approved' })
        .eq('id', reg.id);

      if (updateErr) throw updateErr;

      sound.playSuccess();
      onRefreshRegistrations();
      onMemberAdded();
    } catch (err: any) {
      console.error('Error approving member:', err);
      sound.playError();
      alert('Gagal menyetujui pendaftaran: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (reg: Registration) => {
    sound.playPop();
    setLoadingId(reg.id);

    try {
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
            {tab === 'pending' ? `Menunggu (${registrations.filter(r => r.status === 'pending').length})` : tab}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-5 space-y-4">
        <h3 className="font-black text-slate-900 text-base">
          {filter === 'pending' ? 'Daftar Calon Anggota yang Menunggu ACC' : `Riwayat Pendaftaran (${filter})`}
        </h3>

        {filteredList.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto opacity-40 mb-2" />
            <p className="text-xs font-bold">Tidak ada pendaftaran dengan status {filter}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredList.map((reg) => (
              <div
                key={reg.id}
                className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 shadow-sm space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm">{reg.full_name}</h4>
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900">
                      {reg.class_name}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                    Mendaftar pada: {new Date(reg.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>

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
                    <TactileButton
                      variant="brand"
                      size="sm"
                      disabled={loadingId === reg.id}
                      onClick={() => handleApprove(reg)}
                      className="flex-1"
                    >
                      {loadingId === reg.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>ACC / Masuk Anggota</span>
                    </TactileButton>

                    <button
                      disabled={loadingId === reg.id}
                      onClick={() => handleReject(reg)}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Tolak"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
