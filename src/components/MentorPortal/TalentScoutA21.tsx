import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Trophy, 
  Sparkles, 
  Search, 
  Calendar, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Member, Meeting, TalentStar, CompetitionCategory } from '../../types/database';
import { sound } from '../../lib/audio';

export const COMPETITION_CATEGORIES: { 
  id: CompetitionCategory; 
  label: string; 
  icon: string; 
  color: string;
  badgeBg: string;
}[] = [
  { id: 'speech', label: 'Speech Contest', icon: '🎙️', color: 'text-purple-700 bg-purple-100 border-purple-300', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'storytelling', label: 'Storytelling', icon: '📖', color: 'text-blue-700 bg-blue-100 border-blue-300', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'debate', label: 'English Debate', icon: '⚔️', color: 'text-rose-700 bg-rose-100 border-rose-300', badgeBg: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'newscasting', label: 'Newscasting', icon: '📺', color: 'text-amber-800 bg-amber-100 border-amber-300', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'scrabble', label: 'Scrabble', icon: '🔠', color: 'text-emerald-700 bg-emerald-100 border-emerald-300', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'spelling_bee', label: 'Spelling Bee', icon: '🐝', color: 'text-yellow-800 bg-yellow-100 border-yellow-300', badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { id: 'read_aloud', label: 'Read Aloud', icon: '🗣️', color: 'text-cyan-700 bg-cyan-100 border-cyan-300', badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'general_active', label: 'Lain-lainnya', icon: '✨', color: 'text-indigo-700 bg-indigo-100 border-indigo-300', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

export const getTierInfo = (starCount: number) => {
  if (starCount >= 6) {
    return {
      title: 'Champion Talent',
      badge: '🥇 Prioritas Delegasi SMEGA',
      color: 'bg-amber-500 text-white border-amber-600 shadow-[0_2px_0_0_#b45309]',
      textGrad: 'text-amber-700'
    };
  }
  if (starCount >= 3) {
    return {
      title: 'Active Speaker',
      badge: '🥈 Kandidat Delegasi',
      color: 'bg-indigo-500 text-white border-indigo-600 shadow-[0_2px_0_0_#4338ca]',
      textGrad: 'text-indigo-700'
    };
  }
  if (starCount >= 1) {
    return {
      title: 'Rising Star',
      badge: '🥉 Bibit Potensial',
      color: 'bg-emerald-500 text-white border-emerald-600 shadow-[0_2px_0_0_#047857]',
      textGrad: 'text-emerald-700'
    };
  }
  return {
    title: 'Belum Berbintang',
    badge: 'Belum ada bintang',
    color: 'bg-slate-200 text-slate-600 border-slate-300 shadow-[0_2px_0_0_#94a3b8]',
    textGrad: 'text-slate-500'
  };
};

interface TalentScoutA21Props {
  members: Member[];
  meetings: Meeting[];
  talentStars: TalentStar[];
  onAddStar: (star: Omit<TalentStar, 'id' | 'created_at'>) => Promise<void>;
  onRemoveStar: (starId: string) => Promise<void>;
  activeMeeting: Meeting | null;
}

export const TalentScoutA21: React.FC<TalentScoutA21Props> = ({
  members,
  meetings,
  talentStars,
  onAddStar,
  onRemoveStar,
  activeMeeting
}) => {
  // Active A21 members
  const a21Members = useMemo(() => {
    return members.filter((m) => m.generation === 21 && m.status === 'active');
  }, [members]);

  // Meeting selector (default: active meeting or the newest meeting)
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(() => {
    return activeMeeting?.id || meetings[0]?.id || '';
  });

  const selectedMeeting = useMemo(() => {
    return meetings.find((m) => m.id === selectedMeetingId) || null;
  }, [meetings, selectedMeetingId]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'stars_desc' | 'name_asc' | 'class_asc'>('stars_desc');

  // Modal State for Giving Star
  const [modalMember, setModalMember] = useState<Member | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategory>('speech');
  const [reviewNotes, setReviewNotes] = useState('');
  const [mentorNameInput, setMentorNameInput] = useState(() => {
    return localStorage.getItem('ec_mentor_scout_name') || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal State for Viewing Star History
  const [historyMember, setHistoryMember] = useState<Member | null>(null);

  // State for Custom Tactile Confirmation Modal (Revoke Star)
  const [revokeTarget, setRevokeTarget] = useState<{ starId: string; memberName: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Classes list for filter
  const classList = useMemo(() => {
    const classes = new Set(a21Members.map((m) => m.class_name));
    return Array.from(classes).sort();
  }, [a21Members]);

  // Star aggregation per member
  const starsByMemberId = useMemo(() => {
    const map = new Map<string, TalentStar[]>();
    talentStars.forEach((star) => {
      const existing = map.get(star.member_id) || [];
      existing.push(star);
      map.set(star.member_id, existing);
    });
    return map;
  }, [talentStars]);

  // Star map for the currently selected meeting: memberId -> TalentStar
  const sessionStarsByMemberId = useMemo(() => {
    const map = new Map<string, TalentStar>();
    talentStars
      .filter((s) => s.meeting_id === selectedMeetingId)
      .forEach((s) => {
        map.set(s.member_id, s);
      });
    return map;
  }, [talentStars, selectedMeetingId]);

  // Leaderboard: Top 3 members with highest stars
  const leaderboardTop3 = useMemo(() => {
    const membersWithCount = a21Members.map((m) => {
      const count = starsByMemberId.get(m.id)?.length || 0;
      return { member: m, count };
    });
    return membersWithCount
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [a21Members, starsByMemberId]);

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return a21Members
      .filter((m) => {
        const matchesSearch = 
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.class_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = selectedClass === 'ALL' || m.class_name === selectedClass;
        return matchesSearch && matchesClass;
      })
      .sort((a, b) => {
        const starsA = starsByMemberId.get(a.id)?.length || 0;
        const starsB = starsByMemberId.get(b.id)?.length || 0;
        if (sortBy === 'stars_desc') {
          if (starsB !== starsA) return starsB - starsA;
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return a.class_name.localeCompare(b.class_name);
      });
  }, [a21Members, searchQuery, selectedClass, sortBy, starsByMemberId]);

  // Handlers for modal
  const handleOpenGiveStar = (m: Member) => {
    sound.playPop();
    setModalMember(m);
    setSelectedCategory('speech');
    setReviewNotes('');
    const savedName = localStorage.getItem('ec_mentor_scout_name') || '';
    if (savedName) {
      setMentorNameInput(savedName);
    }
    setFormError(null);
  };

  const handleCloseModal = () => {
    sound.playPop();
    setModalMember(null);
    setFormError(null);
  };

  const handleSubmitStar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!modalMember) return;
    if (!selectedMeetingId) {
      setFormError('Pilih sesi pertemuan terlebih dahulu!');
      sound.playError();
      return;
    }

    if (!reviewNotes.trim()) {
      setFormError('Wajib menuliskan catatan alasan kenapa adik ini menonjol!');
      sound.playError();
      return;
    }

    if (!mentorNameInput.trim()) {
      setFormError('Wajib menuliskan nama kamu sebagai mentor penilai!');
      sound.playError();
      return;
    }

    // Double check: anti-double star on the same meeting
    if (sessionStarsByMemberId.has(modalMember.id)) {
      setFormError('Adik ini sudah mendapatkan bintang pada pertemuan ini!');
      sound.playError();
      return;
    }

    const trimmedMentorName = mentorNameInput.trim();
    localStorage.setItem('ec_mentor_scout_name', trimmedMentorName);

    try {
      setIsSubmitting(true);
      await onAddStar({
        member_id: modalMember.id,
        meeting_id: selectedMeetingId,
        category: selectedCategory,
        notes: reviewNotes.trim(),
        awarded_by: trimmedMentorName,
      });
      sound.playSuccess();
      setModalMember(null);
    } catch (err: any) {
      sound.playError();
      setFormError(err.message || 'Gagal menyimpan bintang.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRevokeModal = (starId: string, memberName: string) => {
    sound.playPop();
    setRevokeError(null);
    setRevokeTarget({ starId, memberName });
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;
    try {
      setIsRevoking(true);
      setRevokeError(null);
      await onRemoveStar(revokeTarget.starId);
      sound.playPop();
      setRevokeTarget(null);
    } catch (err: any) {
      sound.playError();
      setRevokeError(err.message || 'Gagal mencopot bintang.');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-[0_4px_0_0_#b45309] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/30 text-amber-100 text-xs font-black uppercase tracking-wider mb-2 border border-amber-300/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Talent Scout & Radar Delegasi Lomba</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              ⭐ Radar Bibit Lomba Angkatan 21
            </h2>
            <p className="text-xs md:text-sm text-amber-100 font-bold mt-1 max-w-xl leading-relaxed">
              Tandai adik kelas yang aktif, vokal, dan potensial untuk dibina menjadi delegasi lomba bahasa Inggris SMEGA. 
              Maksimal 1 bintang per anak per sesi!
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-amber-900/30 backdrop-blur-sm p-3 rounded-2xl border border-amber-300/30 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center text-amber-200">
              <Star className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-200">Total Bintang Diberikan</div>
              <div className="text-lg font-black text-white">{talentStars.length} Bintang</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Leaderboard */}
      {leaderboardTop3.length > 0 && (
        <div className="p-5 rounded-3xl bg-white border-2 border-amber-200 shadow-[0_4px_0_0_#fde68a] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-800">Podium Bibit Teraktif (Top 3)</h3>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              🔥 Kandidat Delegasi Terkuat
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {leaderboardTop3.map((item, idx) => {
              const rankIcons = ['🥇', '🥈', '🥉'];
              const borderColors = [
                'border-amber-400 bg-amber-50/60 shadow-[0_3px_0_0_#fcd34d]',
                'border-slate-300 bg-slate-50 shadow-[0_3px_0_0_#cbd5e1]',
                'border-orange-300 bg-orange-50/50 shadow-[0_3px_0_0_#fdba74]'
              ];
              const tier = getTierInfo(item.count);

              return (
                <div 
                  key={item.member.id}
                  onClick={() => {
                    sound.playPop();
                    setHistoryMember(item.member);
                  }}
                  className={`p-4 rounded-2xl border-2 ${borderColors[idx] || 'border-slate-200'} flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{rankIcons[idx]}</span>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 leading-tight">
                        {item.member.name}
                      </h4>
                      <div className="text-xs font-bold text-slate-500 mt-0.5">
                        {item.member.class_name} • <span className={`font-black ${tier.textGrad}`}>{tier.title}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-xs shadow-[0_2px_0_0_#b45309]">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>{item.count}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Panel: Meeting Session Selector + Search & Filter */}
      <div className="p-4 md:p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-4">
        {/* Meeting Selector Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Sesi Pertemuan Yang Dinilai:
            </label>
          </div>
          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <select
              value={selectedMeetingId}
              onChange={(e) => {
                sound.playPop();
                setSelectedMeetingId(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.is_active ? '🟢 [AKTIF] ' : ''}{m.title} ({new Date(m.meeting_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Class Filter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama adik kelas atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-800 focus:outline-none focus:border-amber-500 placeholder:text-slate-400 transition-colors"
            />
          </div>

          {/* Class Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="ALL">Semua Kelas ({a21Members.length})</option>
              {classList.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="stars_desc">⭐ Bintang Terbanyak</option>
              <option value="name_asc">🔤 Nama (A - Z)</option>
              <option value="class_asc">🏫 Urut Kelas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-2 text-xs font-black text-slate-500">
          <span>MENAMPILKAN {filteredStudents.length} SISWA ANGKATAN 21</span>
          <span>STATUS SESI: {selectedMeeting?.title || 'Sesi Dipilih'}</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border-2 border-slate-200 text-slate-400 font-bold text-xs">
            Tidak ada siswa A21 yang sesuai dengan pencarian.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const allStars = starsByMemberId.get(student.id) || [];
            const sessionStar = sessionStarsByMemberId.get(student.id);
            const tier = getTierInfo(allStars.length);
            const categoryInfo = sessionStar 
              ? COMPETITION_CATEGORIES.find((c) => c.id === sessionStar.category)
              : null;

            return (
              <div
                key={student.id}
                className="p-3.5 md:p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_2px_0_0_#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                {/* Left: Info Siswa & Badge Bintang Akumulasi */}
                <div className="flex items-center gap-3">
                  {/* Badge Bintang Total Taktil (Klik untuk Riwayat) */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setHistoryMember(student);
                    }}
                    title="Klik untuk melihat seluruh riwayat ulasan bintang anak ini"
                    className={`shrink-0 px-2.5 py-1.5 rounded-xl font-black text-xs border-2 flex items-center gap-1.5 transition-transform active:translate-y-0.5 ${
                      allStars.length > 0 
                        ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-[0_2px_0_0_#fcd34d]' 
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${allStars.length > 0 ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                    <span>{allStars.length}</span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-slate-800">
                        {student.name}
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {student.class_name}
                      </span>
                      {allStars.length > 0 && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${tier.color}`}>
                          {tier.title}
                        </span>
                      )}
                    </div>

                    {/* Jika di sesi ini sudah ada bintang, tampilkan cuplikan catatan */}
                    {sessionStar && (
                      <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${categoryInfo?.badgeBg || 'bg-slate-100 text-slate-700'}`}>
                          <span>{categoryInfo?.icon || '⭐'}</span>
                          <span>{categoryInfo?.label || sessionStar.category}</span>
                        </span>
                        <span className="text-slate-600 italic line-clamp-1 max-w-xs md:max-w-md font-medium text-[11px]">
                          “{sessionStar.notes}”
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          — {sessionStar.awarded_by}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Tombol Aksi Bintang Sesi Terpilih */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {sessionStar ? (
                    // Sudah punya bintang di sesi ini -> Tombol Copot / Status
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border-2 border-emerald-200 text-xs font-black">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Berbintang Sesi Ini</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenRevokeModal(sessionStar.id, student.name)}
                        title="Copot bintang dari sesi ini jika salah input"
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 border-2 border-rose-200 text-xs font-black shadow-[0_2px_0_0_#fecdd3] active:translate-y-0.5 hover:bg-rose-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    // Belum punya bintang di sesi ini -> Tombol Beri Bintang
                    <button
                      type="button"
                      onClick={() => handleOpenGiveStar(student)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black border-2 border-amber-600 shadow-[0_2px_0_0_#b45309] active:translate-y-0.5 transition-all"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>+ Beri Bintang</span>
                    </button>
                  )}

                  {/* Tombol Lihat Riwayat Lengkap */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setHistoryMember(student);
                    }}
                    title="Lihat seluruh ulasan"
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= MODAL 1: FORM PEMBERIAN BINTANG ================= */}
      {modalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border-2 border-amber-300 shadow-2xl overflow-hidden p-6 space-y-5 animate-scale-up">
            {/* Header Modal */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-200 mb-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>Sematkan Bintang Keaktifan A21</span>
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  {modalMember.name}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  Kelas {modalMember.class_name} • Sesi: {selectedMeeting?.title || 'Pertemuan EC'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitStar} className="space-y-4">
              {/* Pilihan Cabang Lomba */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-600 tracking-wider block">
                  1. Pilih Cabang Lomba / Bidang Keunggulan: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COMPETITION_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setSelectedCategory(cat.id);
                        }}
                        className={`p-2 rounded-xl text-left font-black text-xs border-2 flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-[0_2px_0_0_#b45309]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Textarea Catatan Ulasan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider block">
                    2. Catatan Alasan / Kelebihan: <span className="text-rose-500">* (Wajib)</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    Bakal dibaca mentor lain
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Contoh: Pronunciation sangat fasih, intonasinya berani saat adu argumen di sesi debat kelompok..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Nama Mentor Penilai */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-600 tracking-wider block">
                  3. Nama Mentor / Penilai: <span className="text-rose-500">* (Wajib)</span>
                </label>
                <input
                  type="text"
                  value={mentorNameInput}
                  onChange={(e) => setMentorNameInput(e.target.value)}
                  placeholder="Misal: Kak Chandra"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 placeholder:text-slate-400 transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black border border-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Sematkan Bintang ⭐'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: DETAIL RIWAYAT BINTANG SISWA ================= */}
      {historyMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border-2 border-slate-300 shadow-2xl overflow-hidden p-6 space-y-5 animate-scale-up max-h-[85vh] flex flex-col">
            {/* Header Riwayat */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-[0_2px_0_0_#fcd34d]">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {historyMember.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-500">Kelas {historyMember.class_name}</span>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      ⭐ {(starsByMemberId.get(historyMember.id) || []).length} Bintang
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setHistoryMember(null);
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Ulasan & Bintang */}
            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {(starsByMemberId.get(historyMember.id) || []).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 font-bold text-xs space-y-1">
                  <p>Adik ini belum pernah mendapatkan bintang keaktifan.</p>
                  <p className="text-[11px] text-slate-400">Pilih pertemuannya di daftar depan dan klik "+ Beri Bintang"!</p>
                </div>
              ) : (
                (starsByMemberId.get(historyMember.id) || []).map((star) => {
                  const meeting = meetings.find((m) => m.id === star.meeting_id);
                  const cat = COMPETITION_CATEGORIES.find((c) => c.id === star.category);

                  return (
                    <div
                      key={star.id}
                      className="p-4 rounded-2xl bg-amber-50/40 border-2 border-amber-200 shadow-[0_2px_0_0_#fde68a] space-y-2 relative"
                    >
                      {/* Baris Atas: Tanggal Sesi & Cabang Lomba */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border ${cat?.badgeBg || 'bg-white text-slate-700'}`}>
                          <span>{cat?.icon || '⭐'}</span>
                          <span>{cat?.label || star.category}</span>
                        </span>

                        <span className="text-[11px] font-bold text-slate-400">
                          {meeting ? new Date(meeting.meeting_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sesi Pertemuan'}
                        </span>
                      </div>

                      {/* Catatan Ulasan */}
                      <div className="text-xs font-semibold text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-200/60">
                        “{star.notes}”
                      </div>

                      {/* Baris Bawah: Penilai & Tombol Hapus */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-amber-800">
                          Dinilai oleh: <span className="font-black">{star.awarded_by}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenRevokeModal(star.id, historyMember.name)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Copot</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setHistoryMember(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-black text-xs active:translate-y-0.5 shadow-[0_2px_0_0_#0f172a]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: KONFIRMASI COPOT BINTANG TAKTIL ================= */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white border-2 border-rose-300 shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-rose-600 shadow-[0_3px_0_0_#fecdd3]">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800">
                Copot Bintang Keaktifan?
              </h3>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                Apakah kamu yakin ingin mencopot bintang untuk <strong className="text-slate-800">{revokeTarget.memberName}</strong> pada sesi ini?
              </p>
              <p className="text-[11px] text-rose-500 font-bold">
                Catatan keaktifan pada sesi ini akan dihapus dari riwayat.
              </p>
            </div>

            {revokeError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                {revokeError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setRevokeTarget(null);
                }}
                disabled={isRevoking}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black border border-slate-200 transition-colors active:translate-y-0.5"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={isRevoking}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black border-2 border-rose-700 shadow-[0_3px_0_0_#9f1239] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRevoking ? 'Mencopot...' : 'Ya, Copot'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
