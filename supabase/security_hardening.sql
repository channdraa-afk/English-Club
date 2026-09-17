-- ==============================================================================
-- ENGLISH CLUB SMEGA - SUPABASE DATABASE SECURITY HARDENING & DDL EXTENSION
-- Jalankan skrip ini di SQL Editor Supabase untuk memperkuat keamanan database.
-- ==============================================================================

-- 1. Tabel Resmi: talent_stars (Radar Bibit Lomba A21)
CREATE TABLE IF NOT EXISTS talent_stars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    notes TEXT NOT NULL,
    evaluator_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_session_star_per_member UNIQUE (member_id, meeting_id)
);

CREATE INDEX IF NOT EXISTS idx_talent_stars_member ON talent_stars (member_id);
CREATE INDEX IF NOT EXISTS idx_talent_stars_meeting ON talent_stars (meeting_id);

-- Enable RLS pada talent_stars
ALTER TABLE talent_stars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read talent_stars" ON talent_stars;
CREATE POLICY "Allow public read talent_stars" ON talent_stars FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert talent_stars" ON talent_stars;
CREATE POLICY "Allow public insert talent_stars" ON talent_stars FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete talent_stars" ON talent_stars;
CREATE POLICY "Allow public delete talent_stars" ON talent_stars FOR DELETE USING (true);

-- ==============================================================================
-- 2. PENGUATAN TABEL MASTER: members (Read-Only Protection)
-- Mencegah manipulasi/penghapusan master data 165 siswa lewat REST API publik
-- ==============================================================================

-- Hapus policy permissive insert/update lama jika ada
DROP POLICY IF EXISTS "Allow public insert/update members" ON members;

-- Kunci tabel members murni SELECT (baca saja) untuk public client
DROP POLICY IF EXISTS "Allow public read members" ON members;
CREATE POLICY "Allow public read members" ON members FOR SELECT USING (true);
