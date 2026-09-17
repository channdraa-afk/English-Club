import React, { useMemo } from 'react';
import { Crown, Star, Award, Shield } from 'lucide-react';
import { Member } from '../../types/database';

interface StructureViewProps {
  members: Member[];
}

export const StructureView: React.FC<StructureViewProps> = ({ members }) => {
  const a20Mentors = useMemo(() => {
    return members.filter((m) => m.generation === 20 && m.status === 'active');
  }, [members]);

  // Section categories
  const sections = [
    { title: 'BPH Inti (Ketua & Wakil)', filter: (m: Member) => m.position === 'Ketua' || m.position === 'Wakil Ketua' },
    { title: 'Ketua Divisi', filter: (m: Member) => m.position === 'Ketua Divisi' },
    { title: 'Sekretaris & Bendahara', filter: (m: Member) => m.position === 'Sekretaris' || m.position === 'Bendahara' },
    { title: 'Koordinator Sie Kerja', filter: (m: Member) => m.position.includes('Koordinator') },
    { title: 'Sie Pengajar & Pendamping', filter: (m: Member) => m.position.includes('Pengajar') },
    { title: 'Sie PDD', filter: (m: Member) => m.position.includes('PDD') },
    { title: 'Sie Sarpras', filter: (m: Member) => m.position.includes('Sarpras') },
    { title: 'Sie Humas', filter: (m: Member) => m.position.includes('Humas') },
    { title: 'Sie Kedisiplinan', filter: (m: Member) => m.position.includes('Kedisiplinan') },
    { title: 'Sie Operasional', filter: (m: Member) => m.position.includes('Operasional') },
    { title: 'Sie Kurikulum', filter: (m: Member) => m.position.includes('Kurikulum') },
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
          const list = a20Mentors.filter(sec.filter);
          if (list.length === 0) return null;

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
                <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                  {list.length} Orang
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {list.map((m) => {
                  const isKetua = m.position === 'Ketua';
                  const isKoor = m.position.includes('Koordinator');
                  const isDouble = m.position.includes('&');

                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isKetua
                          ? 'bg-amber-50 border-amber-400 shadow-[0_3px_0_0_#f59e0b]'
                          : isKoor
                          ? 'bg-blue-50/70 border-blue-300 shadow-[0_2px_0_0_#93c5fd]'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">{m.name}</h4>
                        {isKetua && <Crown className="w-4 h-4 text-amber-600 shrink-0" />}
                        {isKoor && <Star className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1 text-[11px] font-bold text-slate-500">
                        <span className="truncate text-emerald-800">{m.position}</span>
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[10px]">
                          {m.class_name}
                        </span>
                      </div>

                      {isDouble && (
                        <span className="mt-1.5 inline-block text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
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
