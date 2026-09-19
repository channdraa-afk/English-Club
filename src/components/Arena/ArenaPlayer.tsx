import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Gamepad2, ArrowLeft, Trophy, Flame, UserCheck, AlertCircle, Search, Sparkles, RotateCcw, Play 
} from 'lucide-react';
import { TactileButton } from '../TactileButton';
import { sound } from '../../lib/audio';
import { safeStorage } from '../../lib/storage';
import { supabase } from '../../lib/supabase';
import { Quiz, QuizSession, QuizSubmission, Member } from '../../types/database';
import confetti from 'canvas-confetti';

interface ArenaPlayerProps {
  members: Member[];
  onBackToHome: () => void;
}

interface SavePointData {
  sessionData: QuizSession;
  quizData: Quiz;
  currentIdx: number;
  score: number;
  streak: number;
  correctCount: number;
  savedAt: number;
}

export const ArenaPlayer: React.FC<ArenaPlayerProps> = ({ members, onBackToHome }) => {
  // Join Form State
  const [tokenInput, setTokenInput] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [pendingSavePoint, setPendingSavePoint] = useState<SavePointData | null>(null);

  // Active Game State
  const [session, setSession] = useState<QuizSession | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);

  // Zero Stale Closure Refs
  const scoreRef = useRef(0);
  const correctCountRef = useRef(0);
  const streakRef = useRef(0);

  // Per-Question Timer & Interaction State
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong' | 'timeout'>('idle');
  const [earnedPoints, setEarnedPoints] = useState(0);
  const questionStartMs = useRef(Date.now());
  const timerRef = useRef<any>(null);

  // Completed State & Leaderboard
  const [isCompleted, setIsCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<QuizSubmission[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);

  // Filter A21 members for selection
  const a21Members = useMemo(() => {
    return members.filter((m) => m.generation === 21 && m.status === 'active');
  }, [members]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return a21Members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.class_name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [a21Members, searchQuery]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // QUESTION TIMER ENGINE
  useEffect(() => {
    if (!session || !quiz || isCompleted) return;

    const currentQ = quiz.questions[currentIdx];
    if (!currentQ) return;

    // Reset question state
    setSelectedOption(null);
    setAnswerState('idle');
    setEarnedPoints(0);
    setTimeLeft(currentQ.time_limit || 20);
    questionStartMs.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        if (prev <= 5) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, session, quiz, isCompleted]);

  // Handle Timeout (time ran out)
  const handleTimeout = () => {
    sound.playWrong();
    setAnswerState('timeout');
    setStreak(0);
    streakRef.current = 0;

    setTimeout(() => {
      advanceToNextQuestion(scoreRef.current, correctCountRef.current, 0);
    }, 1500);
  };

  // Advance to next question or complete
  const advanceToNextQuestion = (latestScore?: number, latestCorrect?: number, latestStreak?: number) => {
    if (!quiz) return;
    const finalScore = typeof latestScore === 'number' ? latestScore : scoreRef.current;
    const finalCorrect = typeof latestCorrect === 'number' ? latestCorrect : correctCountRef.current;
    const finalStreak = typeof latestStreak === 'number' ? latestStreak : streakRef.current;

    const nextIdx = currentIdx + 1;
    if (nextIdx < quiz.questions.length) {
      setCurrentIdx(nextIdx);
      // Auto-save save point to local safeStorage
      if (session && selectedMember) {
        safeStorage.set(`ec_arena_save_${session.id}_${selectedMember.id}`, JSON.stringify({
          currentIdx: nextIdx,
          score: finalScore,
          streak: finalStreak,
          correctCount: finalCorrect,
          savedAt: Date.now()
        }));
      }
    } else {
      handleFinishQuiz(finalScore, finalCorrect);
    }
  };

  // Handle student clicking one of the 4 options (0: Red, 1: Blue, 2: Yellow, 3: Green)
  const handleSelectOption = (optIdx: number) => {
    if (selectedOption !== null || answerState !== 'idle' || !quiz) return;

    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(optIdx);
    const currentQ = quiz.questions[currentIdx];
    const isCorrect = optIdx === currentQ.correct_option;
    const elapsedSec = (Date.now() - questionStartMs.current) / 1000;
    const timeLimit = currentQ.time_limit || 20;

    let newScore = scoreRef.current;
    let newCorrect = correctCountRef.current;
    let newStreak = streakRef.current;

    if (isCorrect) {
      sound.playCorrect();
      setAnswerState('correct');
      // Kahoot Formula: 1000 * (1 - (elapsed / (limit * 2))) + streak bonus
      const speedFraction = Math.min(1, Math.max(0, elapsedSec / (timeLimit * 2)));
      const basePoints = Math.round(1000 * (1 - speedFraction));
      const streakBonus = streakRef.current * 100;
      const totalForThisQ = basePoints + streakBonus;

      newScore = scoreRef.current + totalForThisQ;
      newCorrect = correctCountRef.current + 1;
      newStreak = streakRef.current + 1;

      scoreRef.current = newScore;
      correctCountRef.current = newCorrect;
      streakRef.current = newStreak;

      setEarnedPoints(totalForThisQ);
      setScore(newScore);
      setStreak(newStreak);
      setCorrectCount(newCorrect);
    } else {
      sound.playWrong();
      setAnswerState('wrong');
      newStreak = 0;
      streakRef.current = 0;
      setStreak(0);
    }

    setTimeout(() => {
      advanceToNextQuestion(newScore, newCorrect, newStreak);
    }, 1300);
  };

  // Resume from existing save point
  const handleResumeFromSavePoint = (save: SavePointData) => {
    sound.playSuccess();
    setSession(save.sessionData);
    setQuiz(save.quizData);
    setCurrentIdx(save.currentIdx);
    setScore(save.score);
    scoreRef.current = save.score;
    setStreak(save.streak);
    streakRef.current = save.streak;
    setCorrectCount(save.correctCount);
    correctCountRef.current = save.correctCount;
    setStartTime(Date.now() - (save.currentIdx * 20000));
    setIsCompleted(false);
    setPendingSavePoint(null);
  };

  // Discard save point and start from Q1
  const handleRestartFresh = (sessionData: QuizSession, quizData: Quiz) => {
    sound.playPop();
    if (selectedMember) {
      safeStorage.remove(`ec_arena_save_${sessionData.id}_${selectedMember.id}`);
    }
    setSession(sessionData);
    setQuiz(quizData);
    setCurrentIdx(0);
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    streakRef.current = 0;
    setCorrectCount(0);
    correctCountRef.current = 0;
    setStartTime(Date.now());
    setIsCompleted(false);
    setPendingSavePoint(null);
  };

  // Handle finish quiz & save to Supabase
  const handleFinishQuiz = async (finalScore?: number, finalCorrect?: number) => {
    if (!session || !quiz || !selectedMember) return;

    const resolvedScore = typeof finalScore === 'number' ? finalScore : scoreRef.current;
    const resolvedCorrect = typeof finalCorrect === 'number' ? finalCorrect : correctCountRef.current;

    // Clear save point when quiz is completed
    safeStorage.remove(`ec_arena_save_${session.id}_${selectedMember.id}`);

    setIsCompleted(true);
    sound.playFanfare();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    const totalTime = Math.round((Date.now() - startTime) / 1000);

    try {
      // 1. Insert submission to Supabase
      await supabase
        .from('quiz_submissions')
        .upsert({
          session_id: session.id,
          member_id: selectedMember.id,
          member_name: selectedMember.name,
          class_name: selectedMember.class_name,
          score: resolvedScore,
          correct_answers: resolvedCorrect,
          total_questions: quiz.questions.length,
          time_spent_seconds: totalTime,
          completed_at: new Date().toISOString()
        }, { onConflict: 'session_id,member_id' });

      // 2. Fetch leaderboard
      const { data: leadData } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('session_id', session.id)
        .order('score', { ascending: false });

      if (leadData) {
        setLeaderboard(leadData);
        const myIndex = leadData.findIndex((s) => s.member_id === selectedMember.id);
        setMyRank(myIndex !== -1 ? myIndex + 1 : null);
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  // Handle Join Form Submit
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    const cleanToken = tokenInput.trim().toUpperCase();
    if (!cleanToken) {
      sound.playError();
      setJoinError('Silakan masukkan Token Ruangan yang tertera di papan tulis!');
      return;
    }

    if (!selectedMember) {
      sound.playError();
      setJoinError('Silakan pilih namamu terlebih dahulu!');
      return;
    }

    setIsJoining(true);
    try {
      // 1. Find active session with this room code
      const { data: sessionData, error: sessionErr } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('room_code', cleanToken)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sessionErr || !sessionData) {
        sound.playError();
        setJoinError(`Token "${cleanToken}" tidak ditemukan atau sesi kuis belum dibuka oleh kakak mentor!`);
        return;
      }

      // 2. Check if student already submitted for this session
      const { data: existingSub } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('session_id', sessionData.id)
        .eq('member_id', selectedMember.id)
        .maybeSingle();

      if (existingSub) {
        // Already submitted: show completed screen immediately
        sound.playSuccess();
        setSession(sessionData);
        setScore(existingSub.score);
        scoreRef.current = existingSub.score;
        setCorrectCount(existingSub.correct_answers);
        correctCountRef.current = existingSub.correct_answers;
        setIsCompleted(true);

        // Fetch leaderboard
        const { data: leadData } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('session_id', sessionData.id)
          .order('score', { ascending: false });

        if (leadData) {
          setLeaderboard(leadData);
          const myIndex = leadData.findIndex((s) => s.member_id === selectedMember.id);
          setMyRank(myIndex !== -1 ? myIndex + 1 : null);
        }
        return;
      }

      // 3. Fetch the quiz data
      const { data: quizData, error: quizErr } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', sessionData.quiz_id)
        .single();

      if (quizErr || !quizData || !quizData.questions || quizData.questions.length === 0) {
        sound.playError();
        setJoinError('Paket kuis ini belum memiliki soal. Harap beritahu kakak mentor!');
        return;
      }

      // 4. Check for existing Save Point recovery
      const saveKey = `ec_arena_save_${sessionData.id}_${selectedMember.id}`;
      const rawSave = safeStorage.get(saveKey);
      if (rawSave) {
        try {
          const parsed = JSON.parse(rawSave);
          if (
            parsed &&
            typeof parsed.currentIdx === 'number' &&
            parsed.currentIdx > 0 &&
            parsed.currentIdx < quizData.questions.length &&
            Date.now() - (parsed.savedAt || 0) < 3 * 3600 * 1000
          ) {
            sound.playPop();
            setPendingSavePoint({
              sessionData,
              quizData,
              currentIdx: parsed.currentIdx,
              score: parsed.score || 0,
              streak: parsed.streak || 0,
              correctCount: parsed.correctCount || 0,
              savedAt: parsed.savedAt
            });
            return;
          }
        } catch {
          safeStorage.remove(saveKey);
        }
      }

      sound.playSuccess();
      setSession(sessionData);
      setQuiz(quizData);
      setCurrentIdx(0);
      setScore(0);
      scoreRef.current = 0;
      setStreak(0);
      streakRef.current = 0;
      setCorrectCount(0);
      correctCountRef.current = 0;
      setStartTime(Date.now());
      setIsCompleted(false);
    } catch (err: any) {
      sound.playError();
      setJoinError('Terjadi kendala jaringan: ' + (err.message || err));
    } finally {
      setIsJoining(false);
    }
  };

  // VIEW 1: JOIN FORM (LOBBY ENTRANCE)
  if (!session || !quiz) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8 animate-fade-in relative">
        {/* MODAL PEMULIHAN SAVE POINT */}
        {pendingSavePoint && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-[0_8px_0_0_#059669] max-w-sm w-full p-6 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  Save Point Kuis Ditemukan! 💾
                </h4>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Hai <strong className="text-slate-900 font-black">{selectedMember.name}</strong>, kuis kamu sebelumnya terhenti di 
                  <strong className="text-blue-600 font-black"> Soal ke-{pendingSavePoint.currentIdx + 1}</strong> dengan perolehan 
                  <strong className="text-emerald-700 font-black"> {pendingSavePoint.score} Poin</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>Progres Soal:</span>
                  <span className="font-black text-slate-900">Nomor {pendingSavePoint.currentIdx + 1} dari {pendingSavePoint.quizData.questions.length}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>Skor Sementara:</span>
                  <span className="font-black text-blue-600">{pendingSavePoint.score} Poin</span>
                </div>
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>Jawaban Benar:</span>
                  <span className="font-black text-emerald-700">{pendingSavePoint.correctCount} Soal</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <TactileButton
                  variant="emerald"
                  size="md"
                  className="w-full"
                  onClick={() => handleResumeFromSavePoint(pendingSavePoint)}
                >
                  <Play className="w-4 h-4" />
                  <span>Lanjutkan Soal ke-{pendingSavePoint.currentIdx + 1}</span>
                </TactileButton>

                <TactileButton
                  variant="white"
                  size="sm"
                  className="w-full text-slate-500"
                  onClick={() => handleRestartFresh(pendingSavePoint.sessionData, pendingSavePoint.quizData)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi dari Awal (Soal 1)</span>
                </TactileButton>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-600 text-white flex items-center justify-center border-2 border-blue-800 shadow-[0_6px_0_0_#1e3a8a]">
            <Gamepad2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            EC Arena — Kuis Live
          </h2>
          <p className="text-xs font-bold text-slate-500">
            English Club SMKN 1 Purbalingga (Pekan Praktek)
          </p>
        </div>

        {/* Join Box */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#e2e8f0] p-6 space-y-4">
          <form onSubmit={handleJoin} className="space-y-4">
            {/* Token Input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 text-center">
                1. Masukkan Token Ruangan
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="Contoh: SMEGA"
                maxLength={8}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center font-mono font-black text-xl text-blue-600 tracking-widest uppercase focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 font-medium text-center mt-1">
                *Lihat token yang ditulis kakak mentor di papan tulis kelasmu
              </p>
            </div>

            {/* Member Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 text-center">
                2. Cari & Pilih Namamu (A21)
              </label>

              {selectedMember ? (
                <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-300 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-900">{selectedMember.name}</p>
                      <p className="text-[11px] font-bold text-blue-700">{selectedMember.class_name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setSelectedMember(null);
                      setSearchQuery('');
                    }}
                    className="text-xs font-black text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ketik minimal 2 huruf namamu..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Suggestions list only when query >= 2 */}
                  {searchQuery.trim().length >= 2 && (
                    <div className="mt-2 max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-2xl border-2 border-blue-500 bg-white shadow-lg">
                      {filteredMembers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400 font-bold">
                          Nama tidak ditemukan di Angkatan 21
                        </div>
                      ) : (
                        <>
                          <div className="px-3 py-1.5 bg-blue-50 text-[10px] font-black text-blue-900 border-b border-blue-200">
                            Klik namamu untuk memilih:
                          </div>
                          {filteredMembers.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                sound.playPop();
                                setSelectedMember(m);
                                setSearchQuery('');
                              }}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between"
                            >
                              <span className="text-xs font-black text-slate-800">{m.name}</span>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                                {m.class_name}
                              </span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {joinError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            {/* Submit Button */}
            <TactileButton
              type="submit"
              variant="brand"
              size="lg"
              className="w-full py-3.5 text-base"
              disabled={!tokenInput.trim() || !selectedMember || isJoining}
            >
              <Gamepad2 className="w-5 h-5" />
              <span>{isJoining ? 'MENGHUBUNGKAN...' : 'MASUK ARENA'}</span>
            </TactileButton>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onBackToHome();
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-700 pt-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Presensi</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // VIEW 2: COMPLETED SCREEN (SCORE & LEADERBOARD)
  if (isCompleted) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8 animate-fade-in space-y-6">
        {/* Victory Card */}
        <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-[0_8px_0_0_#d97706] p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center border-2 border-amber-700 shadow-[0_4px_0_0_#b45309]">
            <Trophy className="w-9 h-9" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Kuis Selesai! Luar Biasa!
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-2">
              {selectedMember?.name}
            </h3>
            <p className="text-xs font-bold text-slate-500">{selectedMember?.class_name}</p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                Skor Akhir
              </span>
              <span className="text-lg font-black text-blue-600">{score}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                Benar
              </span>
              <span className="text-lg font-black text-emerald-600">
                {correctCount} <span className="text-xs text-slate-400">/ {quiz?.questions.length}</span>
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                Peringkat
              </span>
              <span className="text-lg font-black text-amber-600">
                {myRank ? `#${myRank}` : '-'}
              </span>
            </div>
          </div>

          {/* Encouraging message */}
          <p className="text-xs font-medium text-slate-600 leading-relaxed pt-1">
            Skormu telah tercatat di papan peringkat gabungan seluruh 3 ruangan!
          </p>
        </div>

        {/* Live Leaderboard */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#e2e8f0] p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Klasemen Sementara (Seluruh Ruangan)</span>
            </h4>
            <span className="text-[11px] font-bold text-slate-400">
              {leaderboard.length} Siswa Selesai
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">Nama</th>
                  <th className="py-2.5 px-3 text-center">Benar</th>
                  <th className="py-2.5 px-3 text-right">Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                {leaderboard.map((sub, idx) => {
                  const isMe = sub.member_id === selectedMember?.id;
                  return (
                    <tr
                      key={sub.id || idx}
                      className={
                        isMe
                          ? 'bg-blue-50/80 font-black border-l-4 border-blue-600'
                          : idx === 0
                          ? 'bg-amber-50/50'
                          : 'hover:bg-slate-50'
                      }
                    >
                      <td className="py-2.5 px-3 text-center font-black">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span>{sub.member_name}</span>
                          {isMe && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black uppercase">
                              Kamu
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-700 font-black">
                        {sub.correct_answers}/{sub.total_questions}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-blue-600">
                        {sub.score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TactileButton
            variant="brand"
            size="md"
            className="w-full mt-3"
            onClick={() => {
              sound.playPop();
              onBackToHome();
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Utama</span>
          </TactileButton>
        </div>
      </div>
    );
  }

  // VIEW 3: ACTIVE QUESTION PLAYING SCREEN
  const currentQ = quiz.questions[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / quiz.questions.length) * 100);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 min-h-screen flex flex-col justify-between animate-fade-in">
      {/* Top Header: Progress, Score & Streak */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-900 text-white">
              {currentIdx + 1} / {quiz.questions.length}
            </span>
            {streak > 1 && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 flex items-center gap-1 animate-bounce">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Streak x{streak}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
            <span>{score} PTS</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Center: Timer & Question Text */}
      <div className="my-auto py-6 space-y-4">
        {/* Circular Countdown Display */}
        <div className="flex items-center justify-center">
          <div
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-2xl transition-all shadow-md ${
              timeLeft <= 5
                ? 'border-rose-500 text-rose-600 bg-rose-50 animate-pulse scale-110'
                : 'border-blue-500 text-blue-600 bg-white'
            }`}
          >
            {timeLeft}
          </div>
        </div>

        {/* Question Box */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#e2e8f0] p-6 text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
            Pertanyaan Bahasa Inggris
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* Feedback Badge on Answer */}
        {answerState !== 'idle' && (
          <div
            className={`p-3 rounded-2xl border-2 text-center text-sm font-black animate-bounce ${
              answerState === 'correct'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : answerState === 'wrong'
                ? 'bg-rose-50 border-rose-400 text-rose-800'
                : 'bg-amber-50 border-amber-400 text-amber-800'
            }`}
          >
            {answerState === 'correct' && `✓ BENAR! +${earnedPoints} Poin! 🔥`}
            {answerState === 'wrong' && '✕ YAH, KURANG TEPAT!'}
            {answerState === 'timeout' && '⏰ WAKTU HABIS!'}
          </div>
        )}
      </div>

      {/* Bottom: 4 Chunky 3D Tactile Buttons */}
      <div className="grid grid-cols-2 gap-3 pb-6">
        {/* Option A (Red) */}
        <button
          type="button"
          disabled={selectedOption !== null || answerState !== 'idle'}
          onClick={() => handleSelectOption(0)}
          className={`h-28 rounded-2xl border-2 p-3 text-left font-black transition-all flex flex-col justify-between select-none ${
            selectedOption === 0
              ? answerState === 'correct'
                ? 'bg-emerald-500 border-emerald-700 text-white shadow-none translate-y-1'
                : 'bg-rose-700 border-rose-900 text-white shadow-none translate-y-1'
              : 'bg-rose-600 hover:bg-rose-500 border-rose-800 text-white shadow-[0_5px_0_0_#9f1239] active:shadow-none active:translate-y-1'
          }`}
        >
          <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs font-black">
            🔺 A
          </span>
          <span className="text-xs sm:text-sm leading-tight line-clamp-3">
            {currentQ.option_a}
          </span>
        </button>

        {/* Option B (Blue) */}
        <button
          type="button"
          disabled={selectedOption !== null || answerState !== 'idle'}
          onClick={() => handleSelectOption(1)}
          className={`h-28 rounded-2xl border-2 p-3 text-left font-black transition-all flex flex-col justify-between select-none ${
            selectedOption === 1
              ? answerState === 'correct'
                ? 'bg-emerald-500 border-emerald-700 text-white shadow-none translate-y-1'
                : 'bg-blue-800 border-blue-950 text-white shadow-none translate-y-1'
              : 'bg-blue-600 hover:bg-blue-500 border-blue-800 text-white shadow-[0_5px_0_0_#1e3a8a] active:shadow-none active:translate-y-1'
          }`}
        >
          <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs font-black">
            🔷 B
          </span>
          <span className="text-xs sm:text-sm leading-tight line-clamp-3">
            {currentQ.option_b}
          </span>
        </button>

        {/* Option C (Yellow) */}
        <button
          type="button"
          disabled={selectedOption !== null || answerState !== 'idle'}
          onClick={() => handleSelectOption(2)}
          className={`h-28 rounded-2xl border-2 p-3 text-left font-black transition-all flex flex-col justify-between select-none ${
            selectedOption === 2
              ? answerState === 'correct'
                ? 'bg-emerald-500 border-emerald-700 text-white shadow-none translate-y-1'
                : 'bg-amber-700 border-amber-900 text-white shadow-none translate-y-1'
              : 'bg-amber-500 hover:bg-amber-400 border-amber-700 text-slate-950 shadow-[0_5px_0_0_#b45309] active:shadow-none active:translate-y-1'
          }`}
        >
          <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs font-black text-white">
            🟡 C
          </span>
          <span className="text-xs sm:text-sm leading-tight line-clamp-3 text-slate-900">
            {currentQ.option_c}
          </span>
        </button>

        {/* Option D (Green) */}
        <button
          type="button"
          disabled={selectedOption !== null || answerState !== 'idle'}
          onClick={() => handleSelectOption(3)}
          className={`h-28 rounded-2xl border-2 p-3 text-left font-black transition-all flex flex-col justify-between select-none ${
            selectedOption === 3
              ? answerState === 'correct'
                ? 'bg-emerald-500 border-emerald-700 text-white shadow-none translate-y-1'
                : 'bg-emerald-800 border-emerald-950 text-white shadow-none translate-y-1'
              : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800 text-white shadow-[0_5px_0_0_#15803d] active:shadow-none active:translate-y-1'
          }`}
        >
          <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs font-black">
            🟩 D
          </span>
          <span className="text-xs sm:text-sm leading-tight line-clamp-3">
            {currentQ.option_d}
          </span>
        </button>
      </div>
    </div>
  );
};
