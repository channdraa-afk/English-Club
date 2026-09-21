import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Gamepad2, Plus, Trash2, Edit3, Play, Square, Trophy, Users, 
  CheckCircle2, XCircle, Clock, 
  Flame, ArrowLeft, RefreshCw, AlertTriangle, Check, Sparkles, RotateCcw
} from 'lucide-react';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { supabase } from '../../lib/supabase';
import { Quiz, QuizQuestion, QuizSession, QuizSubmission, TalentStar } from '../../types/database';
import confetti from 'canvas-confetti';

interface QuizManagerProps {
  activeMeetingId?: string;
  onAwardTalentStar?: (star: Omit<TalentStar, 'id' | 'created_at'>) => Promise<void>;
  totalA21Count?: number;
  onSessionChanged?: (session: QuizSession | null) => void;
}

export const QuizManager: React.FC<QuizManagerProps> = ({ 
  activeMeetingId, 
  onAwardTalentStar, 
  totalA21Count = 103,
  onSessionChanged
}) => {
  const liveMonitorRef = useRef<HTMLDivElement>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeSession, setActiveSession] = useState<QuizSession | null>(null);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editQuizId, setEditQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Safety Confirmation Modals
  const [startConfirmQuiz, setStartConfirmQuiz] = useState<Quiz | null>(null);
  const [tokenInput, setTokenInput] = useState('SMEGA');
  const [isStarting, setIsStarting] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const [questionToDeleteIdx, setQuestionToDeleteIdx] = useState<number | null>(null);
  const [subToReset, setSubToReset] = useState<QuizSubmission | null>(null);
  const [isResettingSub, setIsResettingSub] = useState(false);

  // Podium View
  const [showPodium, setShowPodium] = useState(false);
  const [savedStarIds, setSavedStarIds] = useState<string[]>([]);

  // Fetch data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch quizzes
      const { data: qData } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      setQuizzes(qData || []);

      // 2. Fetch active session
      const { data: sData } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setActiveSession(sData || null);

      // 3. If active session, fetch submissions
      if (sData) {
        const { data: subData } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('session_id', sData.id)
          .order('score', { ascending: false });

        setSubmissions(subData || []);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to load quiz data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription for submissions when a session is active
  useEffect(() => {
    if (!activeSession) return;

    const channel = supabase
      .channel('realtime_quiz_session_' + activeSession.id)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_submissions', filter: `session_id=eq.${activeSession.id}` },
        () => {
          // Re-fetch submissions on any change
          supabase
            .from('quiz_submissions')
            .select('*')
            .eq('session_id', activeSession.id)
            .order('score', { ascending: false })
            .then(({ data }) => {
              if (data) setSubmissions(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession]);

  // Start new quiz creation
  const handleNewQuiz = () => {
    sound.playPop();
    setEditQuizId(null);
    setQuizTitle('');
    setQuizDesc('');
    setQuestions([
      {
        id: 'q_' + Date.now(),
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 0,
        time_limit: 20
      }
    ]);
    setIsEditing(true);
  };

  // Edit existing quiz
  const handleEditQuiz = (q: Quiz) => {
    sound.playPop();
    setEditQuizId(q.id);
    setQuizTitle(q.title);
    setQuizDesc(q.description || '');
    setQuestions(q.questions || []);
    setIsEditing(true);
  };

  // Add question to editor
  const handleAddQuestion = () => {
    sound.playPop();
    setQuestions([
      ...questions,
      {
        id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 0,
        time_limit: 20
      }
    ]);
  };

  // Remove question from editor with safety check
  const promptRemoveQuestion = (idx: number) => {
    sound.playPop();
    const targetQ = questions[idx];
    if (!targetQ) return;
    // If question has no text and options are blank, remove silently
    if (!targetQ.question.trim() && !targetQ.option_a.trim() && !targetQ.option_b.trim()) {
      setQuestions((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    // Otherwise require confirmation
    setQuestionToDeleteIdx(idx);
  };

  const handleConfirmRemoveQuestion = () => {
    if (questionToDeleteIdx === null) return;
    sound.playPop();
    setQuestions((prev) => prev.filter((_, i) => i !== questionToDeleteIdx));
    setQuestionToDeleteIdx(null);
  };

  // Save quiz
  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      sound.playError();
      alert('Judul kuis tidak boleh kosong!');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        sound.playError();
        alert(`Soal nomor ${i + 1} belum lengkap! Harap isi pertanyaan dan semua 4 pilihan jawaban.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      if (editQuizId) {
        // Update
        const { error } = await supabase
          .from('quizzes')
          .update({
            title: quizTitle.trim(),
            description: quizDesc.trim(),
            questions: questions,
            updated_at: new Date().toISOString()
          })
          .eq('id', editQuizId);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('quizzes')
          .insert({
            title: quizTitle.trim(),
            description: quizDesc.trim(),
            questions: questions
          });

        if (error) throw error;
      }

      sound.playSuccess();
      setIsEditing(false);
      loadData();
    } catch (err: any) {
      sound.playError();
      alert('Gagal menyimpan kuis: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete quiz (Safe 3D Tactile Modal)
  const promptDeleteQuiz = (q: Quiz) => {
    sound.playPop();
    setQuizToDelete(q);
  };

  const handleConfirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    setIsDeletingQuiz(true);
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', quizToDelete.id);
      if (error) throw error;
      sound.playSuccess();
      setQuizToDelete(null);
      loadData();
    } catch (err: any) {
      sound.playError();
      alert('Gagal menghapus kuis: ' + (err.message || err));
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  // Start live session (Two-Step Verification)
  const handleConfirmStartSession = async () => {
    if (!startConfirmQuiz) return;
    const cleanToken = tokenInput.trim().toUpperCase() || 'SMEGA';

    setIsStarting(true);
    try {
      // 1. Close any existing active session first
      await supabase
        .from('quiz_sessions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('status', 'active');

      // 2. Create new session
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          quiz_id: startConfirmQuiz.id,
          room_code: cleanToken,
          status: 'active',
          created_by: 'Mentor SMEGA'
        })
        .select()
        .single();

      if (error) throw error;

      sound.playSuccess();
      setActiveSession(data);
      onSessionChanged?.(data);

      // Instant cross-tab & cross-device broadcast
      try {
        supabase.channel('arena_global').send({
          type: 'broadcast',
          event: 'quiz_session_state',
          payload: { session: data },
        });
      } catch {
        // Fallback
      }

      setStartConfirmQuiz(null);
      setSubmissions([]);
      loadData();
    } catch (err: any) {
      sound.playError();
      alert('Gagal memulai sesi kuis: ' + (err.message || err));
    } finally {
      setIsStarting(false);
    }
  };

  // Close live session
  const handleCloseSession = async () => {
    if (!activeSession) return;
    setIsClosing(true);
    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', activeSession.id);

      if (error) throw error;

      sound.playSuccess();
      setShowCloseConfirm(false);
      setActiveSession(null);
      onSessionChanged?.(null);

      // Instant cross-tab & cross-device broadcast
      try {
        supabase.channel('arena_global').send({
          type: 'broadcast',
          event: 'quiz_session_state',
          payload: { session: null },
        });
      } catch {
        // Fallback
      }

      loadData();
    } catch (err: any) {
      sound.playError();
      alert('Gagal menutup sesi kuis: ' + (err.message || err));
    } finally {
      setIsClosing(false);
    }
  };

  // Reset student submission (Safe 3D Tactile Modal)
  const promptResetSubmission = (sub: QuizSubmission) => {
    sound.playPop();
    setSubToReset(sub);
  };

  const handleConfirmResetSubmission = async () => {
    if (!subToReset) return;
    setIsResettingSub(true);
    try {
      const { error } = await supabase
        .from('quiz_submissions')
        .delete()
        .eq('id', subToReset.id);

      if (error) throw error;

      sound.playSuccess();
      setSubmissions((prev) => prev.filter((s) => s.id !== subToReset.id));
      setSubToReset(null);
    } catch (err: any) {
      sound.playError();
      alert('Gagal mereset pengerjaan: ' + (err.message || err));
    } finally {
      setIsResettingSub(false);
    }
  };

  // Open podium celebration
  const handleOpenPodium = () => {
    sound.playFanfare();
    setShowPodium(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Award Talent Star to Podium Winner
  const handleSaveToTalentScout = async (sub: QuizSubmission, rank: number) => {
    if (!onAwardTalentStar || savedStarIds.includes(sub.member_id)) return;
    sound.playSuccess();
    const rankTitle = rank === 1 ? 'Juara 1' : rank === 2 ? 'Juara 2' : 'Juara 3';
    await onAwardTalentStar({
      member_id: sub.member_id,
      meeting_id: activeMeetingId || sub.session_id,
      category: 'general_active',
      notes: `${rankTitle} Kuis EC Arena (${sub.score} Poin, ${sub.correct_answers}/${sub.total_questions} Benar)`,
      awarded_by: 'Mentor SMEGA'
    });
    setSavedStarIds([...savedStarIds, sub.member_id]);
  };

  // RENDER: EDITOR FORM
  if (isEditing) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header Editor */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playPop();
                setIsEditing(false);
              }}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {editQuizId ? 'Edit Paket Kuis' : 'Buat Paket Kuis Baru'}
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Dirancang untuk kuis seru mandiri di HP adik-adik kelas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TactileButton
              variant="white"
              size="sm"
              onClick={() => {
                sound.playPop();
                setIsEditing(false);
              }}
            >
              Batal
            </TactileButton>
            <TactileButton
              variant="brand"
              size="sm"
              onClick={handleSaveQuiz}
              disabled={isSaving}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Paket Kuis'}</span>
            </TactileButton>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Judul Kuis (Wajib)
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Contoh: Pekan 2: Daily Idioms & Vocab Clash"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Deskripsi Singkat (Opsional)
            </label>
            <input
              type="text"
              value={quizDesc}
              onChange={(e) => setQuizDesc(e.target.value)}
              placeholder="Contoh: Pendalaman materi pertemuan pertama Divisi Speaking & Writing"
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Daftar Pertanyaan</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
                {questions.length} Soal
              </span>
            </h4>
            <TactileButton variant="emerald" size="sm" onClick={handleAddQuestion}>
              <Plus className="w-4 h-4" />
              <span>Tambah Soal</span>
            </TactileButton>
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={q.id || qIdx}
              className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] space-y-4 relative animate-fade-in"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-sm">
                    {qIdx + 1}
                  </span>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                    Pertanyaan Nomor {qIdx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Timer Picker */}
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={q.time_limit}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[qIdx].time_limit = Number(e.target.value);
                        setQuestions(newQ);
                      }}
                      className="bg-transparent font-black text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value={10}>10 Detik</option>
                      <option value={15}>15 Detik</option>
                      <option value={20}>20 Detik</option>
                      <option value={30}>30 Detik</option>
                      <option value={45}>45 Detik</option>
                    </select>
                  </div>

                  {/* Delete Button */}
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => promptRemoveQuestion(qIdx)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Hapus soal ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  Teks Pertanyaan Bahasa Inggris
                </label>
                <textarea
                  rows={2}
                  value={q.question}
                  onChange={(e) => {
                    const newQ = [...questions];
                    newQ[qIdx].question = e.target.value;
                    setQuestions(newQ);
                  }}
                  placeholder="Contoh: What is the meaning of the idiom 'Break a leg'?"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* 4 Options Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-600 px-1">
                  <span>4 Pilihan Jawaban</span>
                  <span className="text-emerald-700 font-bold">
                    *Pilih bulatan di sebelah kiri opsi yang BENAR
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A (Red) */}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      q.correct_option === 0
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct_${qIdx}`}
                      checked={q.correct_option === 0}
                      onChange={() => {
                        const newQ = [...questions];
                        newQ[qIdx].correct_option = 0;
                        setQuestions(newQ);
                      }}
                      className="w-5 h-5 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <div className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      A
                    </div>
                    <input
                      type="text"
                      value={q.option_a}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[qIdx].option_a = e.target.value;
                        setQuestions(newQ);
                      }}
                      placeholder="Pilihan A (Merah)"
                      className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Option B (Blue) */}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      q.correct_option === 1
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct_${qIdx}`}
                      checked={q.correct_option === 1}
                      onChange={() => {
                        const newQ = [...questions];
                        newQ[qIdx].correct_option = 1;
                        setQuestions(newQ);
                      }}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      B
                    </div>
                    <input
                      type="text"
                      value={q.option_b}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[qIdx].option_b = e.target.value;
                        setQuestions(newQ);
                      }}
                      placeholder="Pilihan B (Biru)"
                      className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Option C (Yellow) */}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      q.correct_option === 2
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct_${qIdx}`}
                      checked={q.correct_option === 2}
                      onChange={() => {
                        const newQ = [...questions];
                        newQ[qIdx].correct_option = 2;
                        setQuestions(newQ);
                      }}
                      className="w-5 h-5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      C
                    </div>
                    <input
                      type="text"
                      value={q.option_c}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[qIdx].option_c = e.target.value;
                        setQuestions(newQ);
                      }}
                      placeholder="Pilihan C (Kuning)"
                      className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Option D (Green) */}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      q.correct_option === 3
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct_${qIdx}`}
                      checked={q.correct_option === 3}
                      onChange={() => {
                        const newQ = [...questions];
                        newQ[qIdx].correct_option = 3;
                        setQuestions(newQ);
                      }}
                      className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      D
                    </div>
                    <input
                      type="text"
                      value={q.option_d}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[qIdx].option_d = e.target.value;
                        setQuestions(newQ);
                      }}
                      placeholder="Pilihan D (Hijau)"
                      className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Bottom Add & Save */}
          <div className="flex items-center justify-between pt-4">
            <TactileButton variant="emerald" size="md" onClick={handleAddQuestion}>
              <Plus className="w-4 h-4" />
              <span>Tambah Soal Berikutnya</span>
            </TactileButton>

            <TactileButton
              variant="brand"
              size="md"
              onClick={handleSaveQuiz}
              disabled={isSaving}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Soal'}</span>
            </TactileButton>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: MAIN QUIZ DASHBOARD
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Friendly Guide Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-5 shadow-sm flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-[0_4px_0_0_#1d4ed8]">
          <Gamepad2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>EC Arena — Kuis Seru Multi-Ruangan</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">
              Self-Paced
            </span>
          </h3>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Dirancang khusus untuk kondisi English Club SMEGA yang terbagi ke <strong>2 sampai 3 ruangan</strong>. 
            Soal dan tombol taktil muncul langsung di HP tiap anak. Mentor cukup membuka sesi kuis dari HP, tulis token ruangan di papan tulis, 
            dan adik-adik bisa langsung berkompetisi di satu papan skor bersama lintas ruangan!
          </p>
        </div>
      </div>

      {/* Active Session Card (If Any) */}
      {activeSession && (
        <div ref={liveMonitorRef} className="bg-white rounded-3xl border-2 border-emerald-500 shadow-[0_6px_0_0_#059669] p-6 space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Sesi Kuis Sedang Berlangsung
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">
                  Token Ruangan:{' '}
                  <span className="font-mono text-2xl font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 ml-1">
                    {activeSession.room_code}
                  </span>
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <TactileButton
                variant="white"
                size="sm"
                onClick={() => {
                  sound.playPop();
                  loadData();
                }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Segarkan</span>
              </TactileButton>

              <TactileButton
                variant="amber"
                size="sm"
                onClick={handleOpenPodium}
                disabled={submissions.length === 0}
              >
                <Trophy className="w-4 h-4" />
                <span>Podium Juara</span>
              </TactileButton>

              <TactileButton
                variant="crimson"
                size="sm"
                onClick={() => {
                  sound.playPop();
                  setShowCloseConfirm(true);
                }}
              >
                <Square className="w-4 h-4" />
                <span>Tutup Sesi</span>
              </TactileButton>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Peserta Selesai
              </span>
              <span className="text-2xl font-black text-slate-900">
                {submissions.length} <span className="text-xs text-slate-400 font-bold">/ {totalA21Count || 103} Siswa</span>
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Skor Tertinggi
              </span>
              <span className="text-2xl font-black text-amber-600">
                {submissions[0]?.score || 0}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Rata-rata Skor
              </span>
              <span className="text-2xl font-black text-blue-600">
                {submissions.length > 0
                  ? Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length)
                  : 0}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Pimpinan Klasemen
              </span>
              <span className="text-sm font-black text-slate-900 truncate block mt-1">
                {submissions[0]?.member_name || '-'}
              </span>
            </div>
          </div>

          {/* Live Submissions Table */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between px-1">
              <span>Papan Skor Live (Seluruh Ruangan)</span>
              <span className="text-slate-400 text-[11px] font-bold">
                Terupdate otomatis secara realtime
              </span>
            </h5>

            {submissions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2 animate-pulse" />
                <p className="text-xs font-bold text-slate-500">
                  Belum ada siswa yang mengumpulkan kuis. Pastikan token <strong>{activeSession.room_code}</strong> sudah ditulis di papan tulis kelas!
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border-2 border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b-2 border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">#</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3 text-center">Benar</th>
                      <th className="py-2.5 px-3 text-center">Waktu</th>
                      <th className="py-2.5 px-3 text-right font-black">Skor</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                    {submissions.map((sub, idx) => (
                      <tr
                        key={sub.id || idx}
                        className={
                          idx === 0
                            ? 'bg-amber-50/70 font-black'
                            : idx === 1
                            ? 'bg-slate-50/70'
                            : idx === 2
                            ? 'bg-orange-50/50'
                            : 'hover:bg-slate-50'
                        }
                      >
                        <td className="py-2.5 px-3 text-center">
                          {idx === 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-sm">
                              1
                            </span>
                          ) : idx === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs">
                              2
                            </span>
                          ) : idx === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-400">{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span>{sub.member_name}</span>
                            {idx === 0 && <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{sub.class_name}</td>
                        <td className="py-2.5 px-3 text-center text-emerald-700 font-black">
                          {sub.correct_answers} / {sub.total_questions}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                          {Math.round(sub.time_spent_seconds)}s
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-sm text-blue-600">
                          {sub.score}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => promptResetSubmission(sub)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition-colors"
                            title="Hapus riwayat & izinkan siswa mengulang kuis"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Reset</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
          <div>
            <h4 className="text-base font-black text-slate-900">Paket Kuis Tersedia</h4>
            <p className="text-xs font-bold text-slate-500">
              Pilih paket kuis untuk dimainkan pada Pekan Praktek
            </p>
          </div>
          <TactileButton variant="brand" size="sm" onClick={handleNewQuiz}>
            <Plus className="w-4 h-4" />
            <span>Buat Paket Kuis Baru</span>
          </TactileButton>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400">
            Memuat daftar kuis...
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
            <Gamepad2 className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-500">
              Belum ada paket kuis yang dibuat.
            </p>
            <TactileButton variant="brand" size="sm" onClick={handleNewQuiz}>
              <Plus className="w-4 h-4" />
              <span>Buat Kuis Pertama Sekarang</span>
            </TactileButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((q) => {
              const isCurrentlyActive = activeSession?.quiz_id === q.id;
              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                    isCurrentlyActive
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-black text-slate-900 leading-snug">{q.title}</h5>
                        {isCurrentlyActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Sedang Aktif
                          </span>
                        )}
                      </div>
                      {q.description && (
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{q.description}</p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 text-[11px] font-black shrink-0">
                      {q.questions?.length || 0} Soal
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditQuiz(q)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Edit soal"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptDeleteQuiz(q)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Hapus paket kuis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {isCurrentlyActive ? (
                      <TactileButton
                        variant="emerald"
                        size="sm"
                        onClick={() => {
                          sound.playPop();
                          liveMonitorRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Sesi Berlangsung</span>
                      </TactileButton>
                    ) : (
                      <TactileButton
                        variant="emerald"
                        size="sm"
                        onClick={() => {
                          sound.playPop();
                          setStartConfirmQuiz(q);
                          setTokenInput('SMEGA');
                        }}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Luncurkan Kuis</span>
                      </TactileButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: KONFIRMASI MULAI SESI (2-Step Verification) */}
      {startConfirmQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-[0_8px_0_0_#059669] max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                <Play className="w-6 h-6 ml-0.5" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Konfirmasi Peluncuran Kuis
              </h4>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Apakah kamu yakin ingin meluncurkan paket kuis:
                <br />
                <strong className="text-slate-900 font-black">"{startConfirmQuiz.title}"</strong> ({startConfirmQuiz.questions?.length || 0} Soal)?
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                Tentukan Token Ruangan (Papan Tulis)
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="SMEGA"
                maxLength={8}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center font-mono font-black text-lg text-blue-600 tracking-wider focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 font-medium mt-1 text-center">
                Tulis token ini di papan tulis kelas agar adik-adik bisa bergabung
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <TactileButton
                variant="white"
                size="md"
                className="w-1/2"
                onClick={() => {
                  sound.playPop();
                  setStartConfirmQuiz(null);
                }}
              >
                Batal
              </TactileButton>
              <TactileButton
                variant="emerald"
                size="md"
                className="w-1/2"
                onClick={handleConfirmStartSession}
                disabled={isStarting}
              >
                <Check className="w-4 h-4" />
                <span>{isStarting ? 'Membuka...' : 'Ya, Buka Kuis!'}</span>
              </TactileButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: KONFIRMASI TUTUP SESI */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-rose-500 shadow-[0_8px_0_0_#e11d48] max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900">Tutup Sesi Kuis?</h4>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Setelah ditutup, adik-adik tidak bisa lagi mengirimkan jawaban. Papan skor akan dibekukan sebagai hasil akhir.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <TactileButton
                variant="white"
                size="md"
                className="w-1/2"
                onClick={() => {
                  sound.playPop();
                  setShowCloseConfirm(false);
                }}
              >
                Batal
              </TactileButton>
              <TactileButton
                variant="crimson"
                size="md"
                className="w-1/2"
                onClick={handleCloseSession}
                disabled={isClosing}
              >
                <Square className="w-4 h-4" />
                <span>{isClosing ? 'Menutup...' : 'Ya, Tutup Sesi'}</span>
              </TactileButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PODIUM JUARA 1, 2, 3 */}
      {showPodium && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-[0_8px_0_0_#d97706] max-w-md w-full p-6 space-y-5 text-center relative">
            <button
              onClick={() => {
                sound.playPop();
                setShowPodium(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_4px_0_0_#b45309]">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Podium Juara EC Arena</h3>
              <p className="text-xs font-bold text-amber-700">
                Pemenang Kuis Bahasa Inggris Pekan Praktek
              </p>
            </div>

            {/* 3D Podium Display */}
            <div className="flex items-end justify-center gap-2 pt-4 pb-2">
              {/* Rank 2 (Silver) */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-xs font-black text-slate-700 mb-1">
                  2
                </div>
                <p className="text-[11px] font-black text-slate-800 line-clamp-1">
                  {submissions[1]?.member_name || '-'}
                </p>
                <span className="text-[10px] font-bold text-slate-500">
                  {submissions[1]?.score || 0} pts
                </span>
                <div className="w-full h-20 bg-slate-200 rounded-t-2xl border-2 border-b-0 border-slate-300 mt-2 flex items-center justify-center font-black text-slate-500">
                  SILVER
                </div>
              </div>

              {/* Rank 1 (Gold) */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-lg mb-1">👑</span>
                <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-amber-500 flex items-center justify-center text-sm font-black text-slate-950 mb-1 shadow-md">
                  1
                </div>
                <p className="text-xs font-black text-slate-900 line-clamp-1">
                  {submissions[0]?.member_name || '-'}
                </p>
                <span className="text-[11px] font-black text-amber-700">
                  {submissions[0]?.score || 0} pts
                </span>
                <div className="w-full h-28 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-2xl border-2 border-b-0 border-amber-500 mt-2 flex items-center justify-center font-black text-amber-900 shadow-sm">
                  GOLD
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-700/20 border-2 border-amber-700/30 flex items-center justify-center text-xs font-black text-amber-800 mb-1">
                  3
                </div>
                <p className="text-[11px] font-black text-slate-800 line-clamp-1">
                  {submissions[2]?.member_name || '-'}
                </p>
                <span className="text-[10px] font-bold text-slate-500">
                  {submissions[2]?.score || 0} pts
                </span>
                <div className="w-full h-14 bg-amber-100 rounded-t-2xl border-2 border-b-0 border-amber-300 mt-2 flex items-center justify-center font-black text-amber-800">
                  BRONZE
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {onAwardTalentStar && submissions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500">
                    Simpan peraih podium ke Radar Bibit Lomba A21:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {submissions.slice(0, 3).map((sub, i) => (
                      <button
                        key={sub.id}
                        disabled={savedStarIds.includes(sub.member_id)}
                        onClick={() => handleSaveToTalentScout(sub, i + 1)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          savedStarIds.includes(sub.member_id)
                            ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        }`}
                      >
                        {savedStarIds.includes(sub.member_id) ? '✓ Tersimpan' : `+ Bintang Juara ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <TactileButton
                variant="brand"
                size="md"
                className="w-full mt-2"
                onClick={() => {
                  sound.playPop();
                  setShowPodium(false);
                }}
              >
                Tutup Podium
              </TactileButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS PAKET KUIS */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-rose-500 shadow-[0_8px_0_0_#e11d48] max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900">Hapus Paket Kuis?</h4>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-left">
                <p className="text-xs font-black text-rose-950 line-clamp-2">
                  {quizToDelete.title}
                </p>
                <p className="text-[11px] font-bold text-rose-700 mt-1">
                  📦 {quizToDelete.questions?.length || 0} butir soal
                </p>
              </div>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Tindakan ini permanen. Seluruh butir soal dan data pengerjaan terkait paket kuis ini akan terhapus bersih dari sistem.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <TactileButton
                variant="white"
                size="md"
                className="w-1/2"
                onClick={() => {
                  sound.playPop();
                  setQuizToDelete(null);
                }}
              >
                Batal
              </TactileButton>
              <TactileButton
                variant="crimson"
                size="md"
                className="w-1/2"
                onClick={handleConfirmDeleteQuiz}
                disabled={isDeletingQuiz}
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingQuiz ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </TactileButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS BUTIR SOAL DI EDITOR */}
      {questionToDeleteIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-rose-500 shadow-[0_8px_0_0_#e11d48] max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Hapus Soal Nomor {questionToDeleteIdx + 1}?
              </h4>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left">
                <p className="text-xs font-bold text-slate-800 line-clamp-3 italic">
                  "{questions[questionToDeleteIdx]?.question || 'Teks soal kosong'}"
                </p>
              </div>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Teks pertanyaan dan 4 pilihan jawaban pada nomor ini akan dihapus dari paket kuis.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <TactileButton
                variant="white"
                size="md"
                className="w-1/2"
                onClick={() => {
                  sound.playPop();
                  setQuestionToDeleteIdx(null);
                }}
              >
                Batal
              </TactileButton>
              <TactileButton
                variant="crimson"
                size="md"
                className="w-1/2"
                onClick={handleConfirmRemoveQuestion}
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Soal</span>
              </TactileButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI RESET PENGERJAAN SISWA */}
      {subToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-amber-500 shadow-[0_8px_0_0_#d97706] max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900">Izinkan Mengulang Kuis?</h4>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left space-y-1">
                <p className="text-xs font-black text-amber-950">
                  {subToReset.member_name} ({subToReset.class_name})
                </p>
                <p className="text-[11px] font-bold text-amber-800">
                  Skor saat ini: {subToReset.score} PTS ({subToReset.correct_answers}/{subToReset.total_questions} Benar)
                </p>
              </div>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Skor dan riwayat jawaban siswa ini akan dihapus dari leaderboard agar ia dapat bergabung dan mengerjakan kuis kembali dari awal.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <TactileButton
                variant="white"
                size="md"
                className="w-1/2"
                onClick={() => {
                  sound.playPop();
                  setSubToReset(null);
                }}
              >
                Batal
              </TactileButton>
              <TactileButton
                variant="brand"
                size="md"
                className="w-1/2"
                onClick={handleConfirmResetSubmission}
                disabled={isResettingSub}
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isResettingSub ? 'Mereset...' : 'Ya, Izinkan'}</span>
              </TactileButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
