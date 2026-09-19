-- ==============================================================================
-- ENGLISH CLUB SMEGA - EC ARENA QUIZ SYSTEM DATABASE SCHEMA
-- ==============================================================================

-- 1. Table quizzes (Master bank soal per paket)
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table quiz_sessions (Sesi live multi-ruangan)
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    room_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'closed'
    created_by TEXT NOT NULL DEFAULT 'Mentor SMEGA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_room ON quiz_sessions (room_code, status);

-- 3. Table quiz_submissions (Papan skor hasil kuis per anak)
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    time_spent_seconds NUMERIC NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_session_member UNIQUE (session_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_session ON quiz_submissions (session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_score ON quiz_submissions (session_id, score DESC);

-- 4. Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Allow public read quizzes" ON quizzes;
CREATE POLICY "Allow public read quizzes" ON quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public manage quizzes" ON quizzes;
CREATE POLICY "Allow public manage quizzes" ON quizzes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read quiz_sessions" ON quiz_sessions;
CREATE POLICY "Allow public read quiz_sessions" ON quiz_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public manage quiz_sessions" ON quiz_sessions;
CREATE POLICY "Allow public manage quiz_sessions" ON quiz_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read quiz_submissions" ON quiz_submissions;
CREATE POLICY "Allow public read quiz_submissions" ON quiz_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert quiz_submissions" ON quiz_submissions;
CREATE POLICY "Allow public insert quiz_submissions" ON quiz_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update quiz_submissions" ON quiz_submissions;
CREATE POLICY "Allow public update quiz_submissions" ON quiz_submissions FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete quiz_submissions" ON quiz_submissions;
CREATE POLICY "Allow public delete quiz_submissions" ON quiz_submissions FOR DELETE USING (true);
