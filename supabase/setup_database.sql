-- ==============================================================================
-- ENGLISH CLUB SMK NEGERI 1 PURBALINGGA (SMEGA) - SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS talent_stars CASCADE;
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

-- 8. Radar Bibit Lomba (Talent Scout A21)
CREATE TABLE talent_stars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    notes TEXT NOT NULL,
    evaluator_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_session_star_per_member UNIQUE (member_id, meeting_id)
);

CREATE INDEX idx_talent_stars_member ON talent_stars (member_id);
CREATE INDEX idx_talent_stars_meeting ON talent_stars (meeting_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_stars ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active members (Hardened: Read-Only Protection)
CREATE POLICY "Allow public read members" ON members FOR SELECT USING (true);

-- Allow public read & manage meetings
CREATE POLICY "Allow public read meetings" ON meetings FOR SELECT USING (true);
CREATE POLICY "Allow public manage meetings" ON meetings FOR ALL USING (true) WITH CHECK (true);

-- Allow public read & manage talent_stars
CREATE POLICY "Allow public read talent_stars" ON talent_stars FOR SELECT USING (true);
CREATE POLICY "Allow public insert talent_stars" ON talent_stars FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete talent_stars" ON talent_stars FOR DELETE USING (true);

-- Allow public insert, read, update & delete attendances
CREATE POLICY "Allow public insert attendances" ON attendances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read attendances" ON attendances FOR SELECT USING (true);
CREATE POLICY "Allow public update attendances" ON attendances FOR UPDATE USING (true) WITH CHECK (true);
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


-- ==============================================================================
-- SEED DATA: 165 ANGGOTA & PENGURUS ENGLISH CLUB SMK NEGERI 1 PURBALINGGA
-- ==============================================================================

INSERT INTO members (name, class_name, generation, role, position, status) VALUES
('Alvian Yusuf Herlangga', 'X AKL 1', 21, 'member', 'Anggota', 'active'),
('Bisma Ali Satari', 'X AKL 1', 21, 'member', 'Anggota', 'active'),
('Doni Saputra', 'X AKL 1', 21, 'member', 'Anggota', 'active'),
('Noura Zahra Safira', 'X AKL 1', 21, 'member', 'Anggota', 'active'),
('Roudah Khoirunnisa', 'X AKL 1', 21, 'member', 'Anggota', 'active'),
('Arini Nur Zahira', 'X AKL 2', 21, 'member', 'Anggota', 'active'),
('Khavita Mardani Putri', 'X AKL 2', 21, 'member', 'Anggota', 'active'),
('Kevin Ibrahim Al Barr', 'X AKL 2', 21, 'member', 'Anggota', 'active'),
('Nur Anzaini', 'X AKL 2', 21, 'member', 'Anggota', 'active'),
('Qonita Aprilia Chasanah', 'X AKL 2', 21, 'member', 'Anggota', 'active'),
('Sefiliya Nadiya Maghfiroh', 'X AKL 2', 21, 'member', 'Anggota', 'active'),
('Zazkia Savina Ferndita', 'X AKL 2', 21, 'member', 'Anggota', 'active'),
('Alleira Dwi Hania', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Angel Lita Permata Sari', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Ayuanita Ramadani', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Daiva Titiyan Wulandari', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Dwi Nur Azizah', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Karen Saputri', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Nabila Rizki Priauto', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Nikita Aulia Senadewa', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Reva Arum Devia Affani', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Syarifah Nur Aini', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Yasmin Ayuningtyas', 'X AKL 3', 21, 'member', 'Anggota', 'active'),
('Alika Anindya Velani', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Anindita Putri H.', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Asifa Nur Hikmah', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Ceria Elysia Rahma', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Deanara Agatha Ramadhani', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Ferlina Amelia', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Indah Dwi Setyaningrum', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Kaninda Larasati', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Kharisma Ajeng Winahyu', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Najmi Salsabilah Syakira', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Safa Minhatul Maula', 'X MPLB 1', 21, 'member', 'Anggota', 'active'),
('Diona Stefa Korneli', 'X MPLB 2', 21, 'member', 'Anggota', 'active'),
('Gladisty Prasetyo', 'X MPLB 2', 21, 'member', 'Anggota', 'active'),
('Nazilla Nurbaety', 'X MPLB 2', 21, 'member', 'Anggota', 'active'),
('Nur Mardhatillah', 'X MPLB 2', 21, 'member', 'Anggota', 'active'),
('Qinantya Nur Anaszwa', 'X MPLB 2', 21, 'member', 'Anggota', 'active'),
('Afizah Eliska', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Alisa Keisya Latif', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Annisa Keysha Rahayu', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Decy Nur Afni Yuliani', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Deyna Novinza Pincen Chien', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Diandra Adonia Rakhman', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Fina Ruchama', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Ghevira Noor Fatimah', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Helga Silla Imania', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Kaifa Afita Najwa', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Kanaya Priska Mulia', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Kenzora Maharani Timur', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Lesti Safira', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Meiza Nur Faustina', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Naysila Chaerunisa', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Saila Nur Wahdati', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Sekar Ayu Nursabrina', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Selviana Qyla', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Syafira Dwi Ariani', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Syifa Nur Khofifah', 'X MPLB 3', 21, 'member', 'Anggota', 'active'),
('Annisa Pratiwi Maulida', 'X PM 1', 21, 'member', 'Anggota', 'active'),
('Elifa Sefitri', 'X PM 1', 21, 'member', 'Anggota', 'active'),
('Nadia Ardelia', 'X PM 1', 21, 'member', 'Anggota', 'active'),
('Yofii'' Mozha Chezilya', 'X PM 1', 21, 'member', 'Anggota', 'active'),
('Aisha Fahma Arkana', 'X PM 2', 21, 'member', 'Anggota', 'active'),
('Ajeng Wulan Purnami', 'X PM 2', 21, 'member', 'Anggota', 'active'),
('Melinda Putri Nirmala', 'X PM 2', 21, 'member', 'Anggota', 'active'),
('Alhadi Zain Saryono', 'X PPLG 1', 21, 'member', 'Anggota', 'active'),
('Arsil Insanun Nafi', 'X PPLG 1', 21, 'member', 'Anggota', 'active'),
('Asyifa Nurrizkya', 'X PPLG 1', 21, 'member', 'Anggota', 'active'),
('Farrel Ismena Indrasta', 'X PPLG 1', 21, 'member', 'Anggota', 'active'),
('Ferryzal Maheswara Farraas Putra Nugroho', 'X PPLG 1', 21, 'member', 'Anggota', 'active'),
('Novita Nur Cahyani', 'X PPLG 1', 21, 'member', 'Anggota', 'active'),
('Arkaan Ibnu Imam', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Ayatul Husna', 'X PPLG 2', 21, 'member', 'Anggota', 'inactive'),
('Danendra Rifnandy Ramadhan', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Fadhilah Rizqi Ar Rafi', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Fela Ayudhita Putri', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Ezedin Anabil', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Karindra Aryabumi', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Laura Guntoro', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Muhammad Dinejad', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Mutsbita Shofiyati', 'X PPLG 2', 21, 'member', 'Anggota', 'inactive'),
('Rayhan Farendra Wijaya', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Sahkilah Dwi Apriyani', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Samarta Nala Indrastata', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Tegar Gilang Pamungkas', 'X PPLG 2', 21, 'member', 'Anggota', 'active'),
('Adam Fahrun Sya''bani', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Afnan Fauzi Al Haris', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Aziz Fajar Triono', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Devin Dwi Avrilianto', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Dias Dwi Pramana', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Dwi Rani', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Feldy Gibsen Perdana', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Gaffar Ardhian', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Idz''an Azka ''Izztan', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Muhammad Faiz Ar Rafi', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Nazwa Aisyah', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Rizkian Nur Enjang Wati', 'X TJKT 1', 21, 'member', 'Anggota', 'active'),
('Azami Fadhilah Firly', 'X TJKT 2', 21, 'member', 'Anggota', 'active'),
('Eka Adi P', 'X TJKT 2', 21, 'member', 'Anggota', 'active'),
('Fatah Arya Pandika', 'X TJKT 2', 21, 'member', 'Anggota', 'active'),
('Haikal Rouf Firmansyah', 'X TJKT 2', 21, 'member', 'Anggota', 'active'),
('Rayhan Alif Cahyo Nugroho', 'X TJKT 2', 21, 'member', 'Anggota', 'active'),
('Alyssa Rosenawa Ramadhani', 'X KLN', 21, 'member', 'Anggota', 'active'),
('Faiza Jannatun Uzlifah', 'X KLN', 21, 'member', 'Anggota', 'active'),
('Putri Eka Novianti', 'X KDS', 21, 'member', 'Anggota', 'active'),
('Chandra Darmawan Jhon', 'XI RPL 2', 20, 'mentor', 'Ketua', 'active'),
('Farij Anggi Permana', 'XI RPL 2', 20, 'mentor', 'Wakil Ketua', 'active'),
('Naila Soraya Candeli', 'XI MP 2', 20, 'mentor', 'Sekretaris', 'active'),
('Faradina Aulia Dewi', 'XI MP 2', 20, 'mentor', 'Sekretaris', 'active'),
('Zahira Aqila Putri', 'XI MP 1', 20, 'mentor', 'Bendahara', 'active'),
('Nurhana', 'XI MP 1', 20, 'mentor', 'Bendahara', 'active'),
('Hanan Aditya Zahid', 'XI RPL 2', 20, 'mentor', 'Ketua Divisi Speaking', 'active'),
('Amirah Nur Fairuza', 'XI AK 1', 20, 'mentor', 'Ketua Divisi Writing', 'active'),
('Kevin Veda Raihan', 'XI RPL 1', 20, 'mentor', 'Koordinator Sie PDD', 'active'),
('Septianika Azzahra', 'XI MP 3', 20, 'mentor', 'Anggota Sie PDD', 'active'),
('Nafid Rifa''i Zen', 'XI RPL 2', 20, 'mentor', 'Anggota Sie PDD', 'active'),
('Vanesa Ramadhani', 'XI BD', 20, 'mentor', 'Anggota Sie PDD', 'active'),
('Aluna Nada Cinta', 'XI MP 2', 20, 'mentor', 'Anggota Sie PDD', 'active'),
('Asyifa Arif Yuniar', 'XI BD', 20, 'mentor', 'Anggota Sie PDD', 'active'),
('Tatas Kesuma Jati', 'XI RPL 1', 20, 'mentor', 'Anggota Sie Sarpras', 'active'),
('Haidar Abqori Windraya', 'XI RPL 2', 20, 'mentor', 'Anggota Sie Sarpras', 'active'),
('Farah Nuralifa', 'XI RPL 1', 20, 'mentor', 'Anggota Sie Sarpras', 'active'),
('Ayu Anissa', 'XI BD', 20, 'mentor', 'Anggota Sie Sarpras', 'active'),
('Dyna Tri Rahayu', 'XI KLN', 20, 'mentor', 'Anggota Sie Sarpras', 'active'),
('Leony Asa Puteri', 'XI KLN', 20, 'mentor', 'Anggota Sie Sarpras', 'active'),
('Karistyana Eka Agustina', 'XI KLN', 20, 'mentor', 'Anggota Sie Sarpras', 'active'),
('Erniesya Kurniasih', 'XI RPL 1', 20, 'mentor', 'Koordinator Sie Sarpras', 'active'),
('Aprilia Wulandari', 'XI BD', 20, 'mentor', 'Anggota Sie Humas', 'active'),
('Amelia Candraningtyas Sunarko', 'XI MP 3', 20, 'mentor', 'Anggota Sie Humas', 'active'),
('Zahwa Az-Zahra Novaliana', 'XI MP 3', 20, 'mentor', 'Anggota Sie Humas', 'active'),
('Rayhanah Salsabila Kamal', 'XI RPL 2', 20, 'mentor', 'Koordinator Sie Humas', 'active'),
('Prisa Aztasyah', 'XI AK 2', 20, 'mentor', 'Koordinator Sie Kedisiplinan', 'active'),
('Titis Alifia', 'XI RPL 1', 20, 'mentor', 'Anggota Sie Kedisiplinan', 'active'),
('Kamila Miladia Rahma', 'XI MP 3', 20, 'mentor', 'Anggota Sie Kedisiplinan', 'active'),
('Asyalea Farahanita', 'XI MP 3', 20, 'mentor', 'Anggota Sie Kedisiplinan', 'active'),
('Nadela Putri Indrianti', 'XI KLN', 20, 'mentor', 'Anggota Sie Kedisiplinan', 'active'),
('Nadila Putri Andrianti', 'XI AK 3', 20, 'mentor', 'Anggota Sie Kedisiplinan', 'active'),
('Genie Alfa Nur Aini', 'XI MP 2', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Janet Najwa As Shifa', 'XI MP 2', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Reisya Saumi Agatha', 'XI BD', 20, 'mentor', 'Sie Pengajar & Sie PDD', 'active'),
('Almira Widhianeta Syafarani', 'XI AK 1', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Faryndha Trihapsari', 'XI MP 3', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Ayra Cania Rizon', 'XI AK 1', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Izaaz Dhiya Afaniin', 'XI AK 1', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Novel Ningtyas Andriani', 'XI MP 3', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Safa Cahya Calya', 'XI MP 3', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Erwina Widya Nariswari', 'XI RPL 1', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Ariska Novita Sari', 'XI KLN', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Anindya Meisya Rizqi', 'XI AK 2', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Robi Febrian', 'XI BD', 20, 'mentor', 'Koordinator Sie Pengajar', 'active'),
('AryaSatya Fattakhu Putra', 'XI BR', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Amirah Khansa Nur Afifah', 'XI AK 3', 20, 'mentor', 'Anggota Sie Pengajar / Pendamping', 'active'),
('Ananda Nauval Bagaskara', 'XI RPL 1', 20, 'mentor', 'Koordinator Sie Operasional', 'active'),
('Firza Nasyaul Zikra', 'XI AK 2', 20, 'mentor', 'Anggota Sie Operasional', 'active'),
('Aprilia Indriani', 'XI AK 2', 20, 'mentor', 'Anggota Sie Operasional', 'active'),
('Tania Alya Nur Rahma', 'XI MP 2', 20, 'mentor', 'Anggota Sie Operasional', 'active'),
('Annisa Nur Na''ifah', 'XI MP 1', 20, 'mentor', 'Koordinator Sie Kurikulum', 'active'),
('Rizka Tasa Yaziyah', 'XI BD', 20, 'mentor', 'Anggota Sie Kurikulum', 'active'),
('Nofita Putri Pratama', 'XI BD', 20, 'mentor', 'Anggota Sie Kurikulum', 'active'),
('Andini Aulia Nurgiantika', 'XI AK 3', 20, 'mentor', 'Anggota Sie Kurikulum', 'active'),
('Arin Nurul Aini', 'XI MP 3', 20, 'mentor', 'Anggota Sie Kurikulum', 'active'),
('Egel Mutazam Munawa', 'XI RPL 2', 20, 'mentor', 'Anggota Sie Kurikulum', 'active'),
('Salsabila Nafalia Fatmah', 'XI KLN', 20, 'mentor', 'Anggota Sie Kurikulum', 'active'),
('Khalil Abdul Ghani', 'XI RPL 2', 20, 'mentor', 'Anggota Sie Kurikulum', 'active');

-- ==============================================================================
-- SAMPLE PERTEMUAN AKTIF PERDANA
-- ==============================================================================
INSERT INTO meetings (meeting_date, title, token, is_active, word_of_the_day, word_meaning, starts_at, expires_at) VALUES
(CURRENT_DATE, 'First Gathering & Speaking Icebreaker', 'EAGLE21', true, 'Break a leg! (Semoga sukses!)', 'Idiom penyemangat yang digunakan untuk mendoakan seseorang agar sukses dan memberikan performa terbaik tanpa gugup.', NOW(), NOW() + INTERVAL '4 hours');
