-- ==============================================================================
-- ENGLISH CLUB SMK NEGERI 1 PURBALINGGA (SMEGA) - SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- 3. Master Data Members (Anggota & Pengurus)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    generation INT NOT NULL, -- 20 (Pengurus/Mentor) atau 21 (Peserta/Adik Kelas)
    role TEXT NOT NULL DEFAULT 'member', -- 'member' atau 'mentor'
    position TEXT NOT NULL DEFAULT 'Anggota', -- 'Ketua', 'Koordinator Sie...', dll
    status TEXT NOT NULL DEFAULT 'active', -- 'active' atau 'inactive'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast autocomplete lookup
CREATE INDEX idx_members_search ON members (name, class_name, status);
CREATE INDEX idx_members_gen ON members (generation, role);

-- 4. Meetings / Sessions
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL DEFAULT 'Weekly English Session',
    token TEXT NOT NULL, -- Token fisik di papan tulis (e.g. 'EAGLE21')
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    word_of_the_day TEXT DEFAULT 'Break a leg! (Semoga sukses!)',
    word_meaning TEXT DEFAULT 'Idiom yang digunakan untuk mendoakan seseorang agar sukses dan memberikan performa terbaik.',
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetings_token ON meetings (token, is_active);

-- 5. Attendances (Presensi & Feedback)
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    feedback_rating TEXT DEFAULT 'super_fun', -- 'boring', 'okay', 'super_fun'
    next_agenda_suggestion TEXT,
    critique TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_meeting_member UNIQUE (meeting_id, member_id)
);

CREATE INDEX idx_attendances_meeting ON attendances (meeting_id);
CREATE INDEX idx_attendances_member ON attendances (member_id);

-- 6. Pendaftaran Calon Anggota Baru (Online Registration)
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registrations_status ON registrations (status);

-- 7. App Settings
CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Radar Bibit Lomba (Talent Scout Stars A21)
CREATE TABLE IF NOT EXISTS talent_stars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'speech', -- speech, storytelling, debate, newscasting, scrabble, spelling_bee, read_aloud, general_active
    notes TEXT NOT NULL,
    awarded_by TEXT NOT NULL DEFAULT 'Mentor SMEGA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_meeting_member_star UNIQUE (meeting_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_talent_stars_member ON talent_stars (member_id);
CREATE INDEX IF NOT EXISTS idx_talent_stars_meeting ON talent_stars (meeting_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_stars ENABLE ROW LEVEL SECURITY;

-- Allow public read & manage talent_stars
CREATE POLICY "Allow public read talent_stars" ON talent_stars FOR SELECT USING (true);
CREATE POLICY "Allow public insert talent_stars" ON talent_stars FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete talent_stars" ON talent_stars FOR DELETE USING (true);

-- Allow public read access to active members (Hardened: Read-Only)
CREATE POLICY "Allow public read members" ON members FOR SELECT USING (true);

-- Allow public read & manage meetings
CREATE POLICY "Allow public read meetings" ON meetings FOR SELECT USING (true);
CREATE POLICY "Allow public manage meetings" ON meetings FOR ALL USING (true) WITH CHECK (true);

-- Allow public insert & read attendances
CREATE POLICY "Allow public insert attendances" ON attendances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read attendances" ON attendances FOR SELECT USING (true);
CREATE POLICY "Allow public delete attendances" ON attendances FOR DELETE USING (true);

-- Allow public register and manage registrations
CREATE POLICY "Allow public insert registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read registrations" ON registrations FOR SELECT USING (true);
CREATE POLICY "Allow public update registrations" ON registrations FOR UPDATE USING (true) WITH CHECK (true);

-- Allow public read & update app_settings
CREATE POLICY "Allow public read settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public manage settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL DEFAULT SETTINGS
-- ==============================================================================
INSERT INTO app_settings (key, value) VALUES 
('mentor_pin', '"123321"'::jsonb),
('registration_open', 'true'::jsonb),
('club_info', '{
  "name": "English Club SMK Negeri 1 Purbalingga",
  "short_name": "EC SMEGA",
  "academic_year": "2026/2027",
  "schedule": "Setiap Rabu, 15:40 WIB - Selesai"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
