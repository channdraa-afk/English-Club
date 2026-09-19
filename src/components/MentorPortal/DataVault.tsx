import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  RefreshCw, 
  FileJson, 
  Info,
  Layers,
  Sparkles,
  FlaskConical
} from 'lucide-react';
import { Member, Meeting, Attendance, Registration } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { sound } from '../../lib/audio';
import { TactileButton } from '../TactileButton';
import { startSandboxMode, stopSandboxModeAndPurge } from '../../lib/sandbox';

interface DataVaultProps {
  activeMeeting: Meeting | null;
  attendances: Attendance[];
  registrations: Registration[];
  members: Member[];
  isSandboxActive?: boolean;
  onDataChanged: () => void;
}

export const DataVault: React.FC<DataVaultProps> = ({
  activeMeeting,
  attendances,
  registrations,
  members,
  isSandboxActive = false,
  onDataChanged,
}) => {
  const [resetScope, setResetScope] = useState<'session' | 'all'>('session');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSandboxLoading, setIsSandboxLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const TARGET_PHRASE = 'RESET DATA UJI COBA';
  const isPhraseValid = confirmPhrase.trim() === TARGET_PHRASE;

  const handleStartSandbox = async () => {
    setIsSandboxLoading(true);
    setStatusNotice(null);
    try {
      await startSandboxMode();
      setStatusNotice({
        type: 'success',
        text: 'Mode Uji Coba berhasil diaktifkan! Sesi "COBA" siap digunakan untuk simulasi online multi-perangkat.',
      });
      onDataChanged();
    } catch (err: any) {
      setStatusNotice({
        type: 'error',
        text: 'Gagal mengaktifkan mode uji coba: ' + (err?.message || err),
      });
    } finally {
      setIsSandboxLoading(false);
    }
  };

  const handleStopSandbox = async () => {
    if (!confirm('Yakin ingin mematikan Mode Uji Coba? Seluruh data presensi, hasil kuis, dan bintang uji coba akan dihapus bersih 100% dari Supabase.')) {
      return;
    }

    setIsSandboxLoading(true);
    setStatusNotice(null);
    try {
      await stopSandboxModeAndPurge();
      setStatusNotice({
        type: 'success',
        text: 'Mode Uji Coba dinonaktifkan. Seluruh data simulasi berhasil dibersihkan tanpa menyisakan jejak.',
      });
      onDataChanged();
    } catch (err: any) {
      setStatusNotice({
        type: 'error',
        text: 'Gagal membersihkan data uji coba: ' + (err?.message || err),
      });
    } finally {
      setIsSandboxLoading(false);
    }
  };

  // Active meeting stats
  const activeSessionAttCount = activeMeeting
    ? attendances.filter((a) => a.meeting_id === activeMeeting.id).length
    : 0;

  // 1. Trigger Download Backup JSON (Zero Data Loss Safety Net)
  const handleDownloadBackup = () => {
    sound.playPop();
    const backupPayload = {
      exported_at: new Date().toISOString(),
      system: 'English Club SMEGA Portal',
      environment: 'Production / Extracurricular Live OS',
      meta: {
        total_members_roster: members.length,
        total_attendances: attendances.length,
        total_registrations: registrations.length,
        active_meeting: activeMeeting,
      },
      data: {
        attendances,
        registrations,
        active_meeting: activeMeeting,
      },
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `backup_ec_data_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 2. Execute Vault Reset with Triple-Shield
  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhraseValid || isProcessing) return;

    setIsProcessing(true);
    setStatusNotice(null);

    try {
      // Step A: Force auto-backup download first
      handleDownloadBackup();

      // Step B: Execute target delete query
      if (resetScope === 'session') {
        if (!activeMeeting) {
          throw new Error('Tidak ada sesi aktif yang dipilih.');
        }
        const { error } = await supabase
          .from('attendances')
          .delete()
          .eq('meeting_id', activeMeeting.id);
        if (error) throw error;
      } else {
        // Global all test attendances wipe
        const { error } = await supabase
          .from('attendances')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
      }

      sound.playSuccess();
      setStatusNotice({
        type: 'success',
        text:
          resetScope === 'session'
            ? `Berhasil mengosongkan presensi untuk sesi "${activeMeeting?.title || 'Sesi Aktif'}"! File backup JSON otomatis diunduh.`
            : 'Big Reset Berhasil! Seluruh riwayat presensi uji coba telah bersih 0% dan dicadangkan ke JSON.',
      });

      setConfirmPhrase('');
      onDataChanged();
      setTimeout(() => setStatusNotice(null), 6000);
    } catch (err: any) {
      console.error('Error executing reset:', err);
      sound.playError();
      setStatusNotice({
        type: 'error',
        text: 'Gagal melakukan reset: ' + (err?.message || 'Terjadi kesalahan jaringan.'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border-2 border-slate-700 shadow-[0_6px_0_0_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-800">
              Pusat Komando Super Admin
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            Brankas Reset & Keamanan Data
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Kelola kebersihan data uji coba dengan arsitektur pengaman bertingkat (*Triple-Shield Protocol*). Data cadangan JSON otomatis terunduh sebelum tindakan destruktif dieksekusi.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadBackup}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs border-2 border-indigo-700 shadow-[0_3px_0_0_#3730a3] active:translate-y-0.5 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Cadangan JSON Sekarang</span>
        </button>
      </div>

      {/* Live Data Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Master Anggota</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {members.length}
          </div>
          <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5 flex items-center gap-1">
            <Check className="w-3 h-3" /> Dilindungi RLS
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Presensi</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {attendances.length}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
            Di seluruh sesi
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Presensi Sesi Aktif</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {activeSessionAttCount}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
            {activeMeeting ? activeMeeting.title : 'Tidak ada sesi'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Pendaftaran Masuk</span>
            <FileJson className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {registrations.length}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
            {registrations.filter((r) => r.status === 'pending').length} pending
          </p>
        </div>
      </div>

      {/* Notification Banner */}
      {statusNotice && (
        <div
          className={`p-4 rounded-2xl border-2 text-xs font-bold flex items-center gap-2.5 animate-fade-in ${
            statusNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {statusNotice.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusNotice.text}</span>
        </div>
      )}

      {/* Sandbox / Mode Uji Coba Control Card */}
      <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-[0_4px_0_0_#fcd34d] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2 flex-wrap">
                <span>Mode Uji Coba & Pemeliharaan (Sandbox)</span>
                {isSandboxActive && (
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    Aktif
                  </span>
                )}
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Uji coba fitur baru secara terisolasi tanpa mencemari database absensi & kuis asli.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSandboxActive ? (
              <TactileButton
                variant="crimson"
                size="sm"
                disabled={isSandboxLoading}
                onClick={handleStopSandbox}
              >
                <Trash2 className="w-4 h-4" />
                <span>{isSandboxLoading ? 'Membersihkan...' : 'Matikan & Bersihkan Uji Coba'}</span>
              </TactileButton>
            ) : (
              <TactileButton
                variant="brand"
                size="sm"
                disabled={isSandboxLoading}
                onClick={handleStartSandbox}
              >
                <FlaskConical className="w-4 h-4" />
                <span>{isSandboxLoading ? 'Mengaktifkan...' : 'Aktifkan Mode Uji Coba'}</span>
              </TactileButton>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Status Lingkungan</span>
            <span className={`font-black ${isSandboxActive ? 'text-amber-600' : 'text-emerald-600'}`}>
              {isSandboxActive ? '🧪 Simulasi Terisolasi' : '🛡️ Produksi (Data Riil)'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Token Simulasi</span>
            <span className="font-mono font-black text-blue-600">
              {isSandboxActive ? 'COBA' : '-'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Pembersihan Otomatis</span>
            <span className="font-bold text-slate-600">
              100% Zero-Residue saat Off
            </span>
          </div>
        </div>
      </div>

      {/* Vault Reset Control Form */}
      <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-[0_4px_0_0_#fecdd3] p-6 space-y-5">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-black text-base text-slate-900">
            Zona Pembersihan & Reset Data (Danger Zone)
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Perlindungan Master Roster</strong>: Data 104 adik kelas & 59 pengurus tidak dapat dihapus melalui formulir ini.
            </span>
          </p>
          <p className="text-[11px] text-rose-800/80 leading-relaxed">
            Sebelum query penghapusan dikirimkan ke Supabase, sistem akan secara otomatis mengunduh berkas <code>backup_ec_data_[timestamp].json</code> ke folder Downloads perangkatmu sebagai cadangan aman.
          </p>
        </div>

        <form onSubmit={handleExecuteReset} className="space-y-4">
          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Pilih Cakupan Pembersihan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  resetScope === 'session'
                    ? 'bg-amber-50 border-amber-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="reset_scope"
                  value="session"
                  checked={resetScope === 'session'}
                  onChange={() => {
                    sound.playPop();
                    setResetScope('session');
                  }}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-900 block">
                    1. Scoped Sesi Aktif Saja (Opsi B)
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Hanya kosongkan {activeSessionAttCount} presensi pada sesi "{activeMeeting?.title || 'Sesi Aktif'}". Sesi lain tetap aman.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  resetScope === 'all'
                    ? 'bg-rose-50 border-rose-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="reset_scope"
                  value="all"
                  checked={resetScope === 'all'}
                  onChange={() => {
                    sound.playPop();
                    setResetScope('all');
                  }}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-rose-900 block">
                    2. Big Reset Total (Opsi A)
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Kosongkan seluruh {attendances.length} presensi uji coba di seluruh database. Siap 0% untuk hari Rabu perdana.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* GitHub Protocol Phrase Confirmation */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Ketik Frasa Konfirmasi Manual
            </label>
            <p className="text-[11px] font-bold text-slate-500">
              Ketik persis frasa berikut untuk membuka kunci tombol eksekusi:{' '}
              <span className="font-mono font-black text-rose-600 select-all bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {TARGET_PHRASE}
              </span>
            </p>
            <input
              type="text"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              placeholder={`Ketik: ${TARGET_PHRASE}`}
              className={`w-full px-4 py-3 rounded-2xl font-mono text-xs font-black border-2 transition-all outline-hidden ${
                isPhraseValid
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 focus:border-emerald-600'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-rose-400'
              }`}
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {isPhraseValid
                  ? 'Kunci terbuka! File backup akan otomatis diunduh saat tombol diklik.'
                  : 'Tombol eksekusi terkunci hingga frasa diketik dengan benar.'}
              </span>
            </div>

            <TactileButton
              type="submit"
              variant={isPhraseValid ? 'crimson' : 'slate'}
              size="md"
              disabled={!isPhraseValid || isProcessing}
              className="shrink-0"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Reset...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {resetScope === 'session'
                      ? 'Kosongkan Presensi Sesi Ini'
                      : 'Eksekusi Big Reset Sekarang'}
                  </span>
                </>
              )}
            </TactileButton>
          </div>
        </form>
      </div>
    </div>
  );
};
