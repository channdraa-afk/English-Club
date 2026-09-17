import React, { useState, useMemo } from 'react';
import { Crown, Star, Award, Shield } from 'lucide-react';
import { Member } from '../../types/database';
import { sound } from '../../lib/audio';

interface StructureViewProps {
  members: Member[];
  isSuperAdmin?: boolean;
  onRequestSuperAdmin?: () => void;
}

export const StructureView: React.FC<StructureViewProps> = ({ 
  members,
  isSuperAdmin = false,
  onRequestSuperAdmin,
}) => {
  const [ketuaTapCount, setKetuaTapCount] = useState(0);

  const handleKetuaTap = () => {
    if (isSuperAdmin) return;
    sound.playPop();
    const next = ketuaTapCount + 1;
    if (next >= 3) {
      setKetuaTapCount(0);
      onRequestSuperAdmin?.();
    } else {
      setKetuaTapCount(next);
      setTimeout(() => setKetuaTapCount(0), 2500);
    }
  };

  const a20Mentors = useMemo(() => {
    return members.filter((m) => m.generation === 20 && m.status === 'active');
  }, [members]);

  const getDisplayPosition = (m: Member) => {
    if (m.name.toLowerCase().includes('hanan aditya')) return 'Ketua Divisi Speaking';
    if (m.name.toLowerCase().includes('amirah nur fairuza')) return 'Ketua Divisi Writing';
    return m.position;
  };

  // Section categories strictly ordered according to Chandra's instruction:
  // 1. Ketua
  // 2. Wakil Ketua (di bawah Ketua, tidak berdampingan)
  // 3. Sekretaris
  // 4. Bendahara
  // 5. Ketua Divisi (Hanan = Speaking, Ami = Writing)
  // 6. Baru semua sie lainnya
  const sections = [
    {
      title: '👑 Ketua Umum',
      filter: (m: Member) => m.position === 'Ketua',
      isSolo: true,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      title: '🛡️ Wakil Ketua',
      filter: (m: Member) => m.position === 'Wakil Ketua',
      isSolo: true,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      title: '📋 Sekretaris',
      filter: (m: Member) => m.position === 'Sekretaris',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      title: '💰 Bendahara',
      filter: (m: Member) => m.position === 'Bendahara',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    },
    {
      title: '✨ Ketua Divisi',
      filter: (m: Member) =>
        m.position.includes('Ketua Divisi') ||
        m.name.toLowerCase().includes('hanan aditya') ||
        m.name.toLowerCase().includes('amirah nur fairuza'),
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      title: 'Sie PDD',
      filter: (m: Member) => m.position.includes('PDD') && !m.position.includes('Pengajar'),
      note: 'Sie PDD turut diperkuat oleh Reisya Saumi Agatha (merangkap Sie Pengajar).',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'Sie Sarpras',
      filter: (m: Member) => m.position.includes('Sarpras'),
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'Sie Humas',
      filter: (m: Member) => m.position.includes('Humas'),
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'Sie Kedisiplinan',
      filter: (m: Member) => m.position.includes('Kedisiplinan'),
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'Sie Pengajar & Pendamping',
      filter: (m: Member) => m.position.includes('Pengajar'),
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'Sie Operasional',
      filter: (m: Member) => m.position.includes('Operasional'),
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'Sie Kurikulum',
      filter: (m: Member) => m.position.includes('Kurikulum'),
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-2 border-emerald-900 shadow-[0_6px_0_0_#14532d]">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
            Struktur & Pembagian Sie Kerja
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          English Club SMEGA — Angkatan 20
        </h2>
        <p className="text-xs sm:text-sm font-bold text-emerald-100 mt-1 max-w-xl leading-relaxed">
          Total 59 pengurus berdedikasi mengayomi adik kelas Angkatan 21 di SMK Negeri 1 Purbalingga.
        </p>
      </div>

      {/* Sections breakdown */}
      <div className="space-y-4">
        {sections.map((sec) => {
          const rawList = a20Mentors.filter(sec.filter);
          if (rawList.length === 0) return null;

          // Put Koordinator first in each section
          const list = [...rawList].sort((a, b) => {
            const aKoor = a.position.includes('Koordinator') ? 1 : 0;
            const bKoor = b.position.includes('Koordinator') ? 1 : 0;
            return bKoor - aKoor;
          });

          return (
            <div
              key={sec.title}
              className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-5 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>{sec.title}</span>
                </h3>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${sec.badgeColor}`}>
                  {list.length} Orang
                </span>
              </div>

              {sec.note && (
                <p className="text-[11px] font-bold text-slate-500 italic">
                  * {sec.note}
                </p>
              )}

              <div
                className={
                  sec.isSolo
                    ? 'grid grid-cols-1 max-w-md mx-auto'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5'
                }
              >
                {list.map((m) => {
                  const isKetua = m.position === 'Ketua';
                  const isKoor = m.position.includes('Koordinator');
                  const isDouble = m.position.includes('&');
                  const displayPos = getDisplayPosition(m);

                  return (
                    <div
                      key={m.id}
                      onClick={isKetua ? handleKetuaTap : undefined}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isKetua
                          ? 'bg-amber-50 border-amber-400 shadow-[0_4px_0_0_#f59e0b] cursor-pointer hover:bg-amber-100/70 select-none active:translate-y-0.5'
                          : m.position === 'Wakil Ketua'
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-[0_3px_0_0_#10b981]'
                          : isKoor
                          ? 'bg-blue-50/70 border-blue-300 shadow-[0_2px_0_0_#93c5fd]'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                      title={
                        isKetua
                          ? isSuperAdmin
                            ? '👑 Super Admin Aktif'
                            : 'Tap 3x untuk Akses Rahasia Ketua'
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                          {m.name}
                        </h4>
                        {isKetua && (
                          <div className="flex items-center gap-1">
                            {isSuperAdmin ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 border border-amber-400 flex items-center gap-1 shadow-sm">
                                <Crown className="w-3 h-3 text-amber-700" />
                                <span>Ketua (Admin)</span>
                              </span>
                            ) : (
                              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors">
                                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                              </span>
                            )}
                          </div>
                        )}
                        {isKoor && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-300">
                            <Star className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>Koor</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1.5 text-[11px] font-bold text-slate-500">
                        <span className="truncate font-extrabold text-emerald-800">
                          {displayPos}
                        </span>
                        <span className="shrink-0 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[10px] font-black">
                          {m.class_name}
                        </span>
                      </div>

                      {isDouble && (
                        <span className="mt-2 inline-block text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-300">
                          🌟 Double Job
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
