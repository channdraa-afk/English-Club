-- ==============================================================================
-- ENGLISH CLUB SMEGA - COMPLETE RLS FORTRESS LOCKDOWN (VULN-001 & VULN-002)
-- Eksekusi file ini di Supabase SQL Editor untuk menutup total seluruh celah RLS
-- dan mengaktifkan validasi sesi kriptografis server-side (HMAC-SHA256).
-- ==============================================================================

-- 1. Pastikan ekstensi pgcrypto aktif
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Buat tabel internal aman untuk kredensial hash yang terisolasi dari publik
CREATE TABLE IF NOT EXISTS system_secrets (
    key TEXT PRIMARY KEY,
    secret_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kunci TOTAL RLS pada system_secrets agar anonim TIDAK BISA SELECT apapun!
ALTER TABLE system_secrets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny all public access to system_secrets" ON system_secrets;
CREATE POLICY "Deny all public access to system_secrets" ON system_secrets 
    FOR ALL 
    USING (false);

-- 3. Inisialisasi Kredensial & Server HMAC Secret di tabel terisolasi
-- Super Admin Master Hash (Salted SHA-256): 4567180d06a4720b4913a7c361c8235f93b8277deae32b6ecd436247998b8e20
INSERT INTO system_secrets (key, secret_hash) VALUES
    ('mentor_pin_hash', encode(digest('ec_mentor_salt_2026_456654', 'sha256'), 'hex')),
    ('mentor_token_hash', encode(digest('ec_mentor_token_salt_2026_CREW20', 'sha256'), 'hex')),
    ('superadmin_master_hash', '4567180d06a4720b4913a7c361c8235f93b8277deae32b6ecd436247998b8e20')
ON CONFLICT (key) DO UPDATE SET secret_hash = EXCLUDED.secret_hash, updated_at = NOW();

-- Buat session_hmac_secret acak jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM system_secrets WHERE key = 'session_hmac_secret') THEN
        INSERT INTO system_secrets (key, secret_hash)
        VALUES ('session_hmac_secret', encode(gen_random_bytes(32), 'hex'));
    END IF;
END $$;

-- 4. Bersihkan key sensitif lama dari app_settings publik
DELETE FROM app_settings WHERE key IN ('mentor_pin', 'mentor_token', 'superadmin_hash', 'superadmin_sig', 'superadmin_master_hash');

-- ==============================================================================
-- 5. FUNGSI INTERNAL & KRIPTOGRAFIS SESI (SECURITY DEFINER)
-- ==============================================================================

-- Bersihkan fungsi lama terlebih dahulu jika tipe return berbeda (Mencegah PostgreSQL Error 42P13)
DROP FUNCTION IF EXISTS verify_mentor_pin(TEXT);
DROP FUNCTION IF EXISTS verify_superadmin_master(TEXT);
DROP FUNCTION IF EXISTS validate_superadmin_session(TEXT);
DROP FUNCTION IF EXISTS validate_mentor_session(TEXT);
DROP FUNCTION IF EXISTS update_mentor_pin(TEXT, TEXT);
DROP FUNCTION IF EXISTS verify_mentor_token(TEXT);
DROP FUNCTION IF EXISTS update_mentor_token(TEXT);
DROP FUNCTION IF EXISTS is_authenticated_admin();
DROP FUNCTION IF EXISTS submit_student_attendance(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS get_admin_registrations(TEXT);
DROP FUNCTION IF EXISTS approve_registration_admin(TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_registration_status_admin(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS get_session_hmac_secret();
CREATE OR REPLACE FUNCTION get_session_hmac_secret()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_secret TEXT;
BEGIN
    SELECT secret_hash INTO v_secret FROM system_secrets WHERE key = 'session_hmac_secret';
    IF v_secret IS NULL THEN
        v_secret := 'ec_smega_fallback_secret_key_2026';
    END IF;
    RETURN v_secret;
END;
$$;

-- A. Validasi Ephemeral Session Token Super Admin
CREATE OR REPLACE FUNCTION validate_superadmin_session(token_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    parts TEXT[];
    data_parts TEXT[];
    v_sig TEXT;
    v_data TEXT;
    v_role TEXT;
    v_expiry BIGINT;
    v_secret TEXT;
    expected_sig TEXT;
BEGIN
    IF token_input IS NULL OR length(token_input) < 32 THEN
        RETURN FALSE;
    END IF;

    parts := string_to_array(token_input, '.');
    IF array_length(parts, 1) <> 2 THEN
        RETURN FALSE;
    END IF;

    v_sig := parts[1];
    v_data := parts[2];

    data_parts := string_to_array(v_data, ':');
    IF array_length(data_parts, 1) < 2 THEN
        RETURN FALSE;
    END IF;

    v_role := data_parts[1];
    v_expiry := data_parts[2]::BIGINT;

    -- Validasi role & masa aktif
    IF v_role <> 'superadmin' OR EXTRACT(EPOCH FROM NOW())::BIGINT > v_expiry THEN
        RETURN FALSE;
    END IF;

    v_secret := get_session_hmac_secret();
    expected_sig := encode(hmac(v_data, v_secret, 'sha256'), 'hex');

    RETURN v_sig = expected_sig;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- B. Validasi Ephemeral Session Token Mentor
CREATE OR REPLACE FUNCTION validate_mentor_session(token_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    parts TEXT[];
    data_parts TEXT[];
    v_sig TEXT;
    v_data TEXT;
    v_role TEXT;
    v_expiry BIGINT;
    v_secret TEXT;
    expected_sig TEXT;
BEGIN
    IF token_input IS NULL OR length(token_input) < 32 THEN
        RETURN FALSE;
    END IF;

    parts := string_to_array(token_input, '.');
    IF array_length(parts, 1) <> 2 THEN
        RETURN FALSE;
    END IF;

    v_sig := parts[1];
    v_data := parts[2];

    data_parts := string_to_array(v_data, ':');
    IF array_length(data_parts, 1) < 2 THEN
        RETURN FALSE;
    END IF;

    v_role := data_parts[1];
    v_expiry := data_parts[2]::BIGINT;

    -- Mentor session valid jika role adalah 'mentor' atau 'superadmin'
    IF v_role NOT IN ('mentor', 'superadmin') OR EXTRACT(EPOCH FROM NOW())::BIGINT > v_expiry THEN
        RETURN FALSE;
    END IF;

    v_secret := get_session_hmac_secret();
    expected_sig := encode(hmac(v_data, v_secret, 'sha256'), 'hex');

    RETURN v_sig = expected_sig;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- C. Verifikasi Master Password Super Admin (Ketua Chandra)
CREATE OR REPLACE FUNCTION verify_superadmin_master(password_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expected_hash TEXT;
    computed_hash TEXT;
    v_expiry BIGINT;
    v_secret TEXT;
    v_data TEXT;
    v_sig TEXT;
    v_token TEXT;
BEGIN
    SELECT secret_hash INTO expected_hash FROM system_secrets WHERE key = 'superadmin_master_hash';
    IF expected_hash IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Master secret not configured');
    END IF;

    computed_hash := encode(digest('ec_smega_vault_2026_' || TRIM(password_input), 'sha256'), 'hex');
    IF computed_hash <> expected_hash THEN
        RETURN jsonb_build_object('success', false, 'error', 'Kata sandi tidak valid');
    END IF;

    -- Generate Kriptografis HMAC-SHA256 Token (Berlaku 12 Jam)
    v_expiry := (EXTRACT(EPOCH FROM (NOW() + INTERVAL '12 hours')))::BIGINT;
    v_data := 'superadmin:' || v_expiry::TEXT || ':' || gen_random_uuid()::TEXT;
    v_secret := get_session_hmac_secret();
    v_sig := encode(hmac(v_data, v_secret, 'sha256'), 'hex');
    v_token := v_sig || '.' || v_data;

    RETURN jsonb_build_object(
        'success', true,
        'session_token', v_token,
        'expires_at', (NOW() + INTERVAL '12 hours')
    );
END;
$$;

-- D. Verifikasi PIN Mentor & Generate Signed Mentor Token
CREATE OR REPLACE FUNCTION verify_mentor_pin(pin_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expected_hash TEXT;
    computed_hash TEXT;
    v_expiry BIGINT;
    v_secret TEXT;
    v_data TEXT;
    v_sig TEXT;
    v_token TEXT;
BEGIN
    SELECT secret_hash INTO expected_hash FROM system_secrets WHERE key = 'mentor_pin_hash';
    IF expected_hash IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'PIN mentor belum dikonfigurasi');
    END IF;

    computed_hash := encode(digest('ec_mentor_salt_2026_' || TRIM(pin_input), 'sha256'), 'hex');
    IF computed_hash <> expected_hash THEN
        RETURN jsonb_build_object('success', false, 'error', 'PIN tidak valid');
    END IF;

    -- Generate Signed Mentor Token (Berlaku 24 Jam)
    v_expiry := (EXTRACT(EPOCH FROM (NOW() + INTERVAL '24 hours')))::BIGINT;
    v_data := 'mentor:' || v_expiry::TEXT || ':' || gen_random_uuid()::TEXT;
    v_secret := get_session_hmac_secret();
    v_sig := encode(hmac(v_data, v_secret, 'sha256'), 'hex');
    v_token := v_sig || '.' || v_data;

    RETURN jsonb_build_object(
        'success', true,
        'session_token', v_token,
        'expires_at', (NOW() + INTERVAL '24 hours')
    );
END;
$$;

-- E. Ganti PIN Mentor
CREATE OR REPLACE FUNCTION update_mentor_pin(current_pin TEXT, new_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    verify_res JSONB;
BEGIN
    verify_res := verify_mentor_pin(current_pin);
    IF NOT (verify_res->>'success')::BOOLEAN THEN
        RETURN FALSE;
    END IF;

    UPDATE system_secrets 
    SET secret_hash = encode(digest('ec_mentor_salt_2026_' || TRIM(new_pin), 'sha256'), 'hex'),
        updated_at = NOW()
    WHERE key = 'mentor_pin_hash';

    RETURN TRUE;
END;
$$;

-- F. Verifikasi Token Pengurus A20
CREATE OR REPLACE FUNCTION verify_mentor_token(token_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expected_hash TEXT;
    computed_hash TEXT;
BEGIN
    SELECT secret_hash INTO expected_hash FROM system_secrets WHERE key = 'mentor_token_hash';
    IF expected_hash IS NULL THEN
        RETURN FALSE;
    END IF;

    computed_hash := encode(digest('ec_mentor_token_salt_2026_' || UPPER(TRIM(token_input)), 'sha256'), 'hex');
    RETURN computed_hash = expected_hash;
END;
$$;

-- G. Ganti Token Pengurus A20
CREATE OR REPLACE FUNCTION update_mentor_token(new_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE system_secrets 
    SET secret_hash = encode(digest('ec_mentor_token_salt_2026_' || UPPER(TRIM(new_token)), 'sha256'), 'hex'),
        updated_at = NOW()
    WHERE key = 'mentor_token_hash';

    RETURN TRUE;
END;
$$;

-- H. Helper: Memeriksa apakah request berasal dari Admin/Mentor yang terautentikasi via HTTP Header
CREATE OR REPLACE FUNCTION is_authenticated_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    req_headers JSON;
    token_val TEXT;
BEGIN
    req_headers := NULLIF(current_setting('request.headers', true), '')::json;
    IF req_headers IS NULL THEN
        RETURN FALSE;
    END IF;

    token_val := req_headers->>'x-session-token';
    IF token_val IS NULL OR token_val = '' THEN
        RETURN FALSE;
    END IF;

    RETURN validate_mentor_session(token_val);
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- I. Presensi Siswa Resmi (Server-Side Whiteboard Token Verification)
CREATE OR REPLACE FUNCTION submit_student_attendance(
    p_meeting_id UUID,
    p_member_id UUID,
    p_token_input TEXT,
    p_feedback_rating TEXT DEFAULT 'super_fun',
    p_critique TEXT DEFAULT NULL,
    p_next_agenda TEXT DEFAULT NULL,
    p_is_anonymous BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_actual_token TEXT;
    v_is_active BOOLEAN;
    v_is_holiday BOOLEAN;
    v_existing_id UUID;
    v_inserted_id UUID;
BEGIN
    SELECT token, is_active, is_holiday 
    INTO v_actual_token, v_is_active, v_is_holiday
    FROM meetings
    WHERE id = p_meeting_id;

    IF v_actual_token IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sesi pertemuan tidak ditemukan.');
    END IF;

    IF v_is_holiday THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pertemuan ini sedang libur.');
    END IF;

    IF UPPER(TRIM(p_token_input)) <> UPPER(TRIM(v_actual_token)) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Token salah! Pastikan kamu menyalin huruf yang ada di papan tulis dengan benar.');
    END IF;

    SELECT id INTO v_existing_id 
    FROM attendances 
    WHERE meeting_id = p_meeting_id AND member_id = p_member_id;

    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kamu sudah mengisi presensi pada pertemuan ini!');
    END IF;

    INSERT INTO attendances (
        meeting_id,
        member_id,
        feedback_rating,
        critique,
        next_agenda_suggestion,
        is_anonymous,
        submitted_at
    ) VALUES (
        p_meeting_id,
        p_member_id,
        p_feedback_rating,
        p_critique,
        p_next_agenda,
        p_is_anonymous,
        NOW()
    ) RETURNING id INTO v_inserted_id;

    RETURN jsonb_build_object('success', true, 'attendance_id', v_inserted_id);
END;
$$;

-- J. RPC Khusus Registrasi Super Admin
CREATE OR REPLACE FUNCTION get_admin_registrations(token_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT validate_superadmin_session(token_input) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sesi Super Admin tidak valid atau kedaluwarsa.');
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'registrations', (
            SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
            FROM (
                SELECT * FROM registrations ORDER BY created_at DESC
            ) r
        )
    );
END;
$$;

CREATE OR REPLACE FUNCTION approve_registration_admin(
    token_input TEXT,
    reg_id UUID,
    final_name TEXT,
    final_class TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_id UUID;
BEGIN
    IF NOT validate_superadmin_session(token_input) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sesi Super Admin tidak valid.');
    END IF;

    SELECT id INTO v_existing_id FROM members WHERE lower(trim(name)) = lower(trim(final_name));
    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Siswa dengan nama ini sudah terdaftar di database.');
    END IF;

    INSERT INTO members (name, class_name, generation, role, position, status)
    VALUES (trim(final_name), trim(final_class), 21, 'member', 'Anggota', 'active');

    UPDATE registrations SET status = 'approved' WHERE id = reg_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION update_registration_status_admin(
    token_input TEXT,
    reg_id UUID,
    new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT validate_superadmin_session(token_input) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sesi Super Admin tidak valid.');
    END IF;

    UPDATE registrations SET status = new_status WHERE id = reg_id;
    RETURN jsonb_build_object('success', true);
END;
$$;

-- ==============================================================================
-- 6. CABUT TOTAL SELURUH POLICY LAMA PADA SEMUA 8 TABEL
-- ==============================================================================

-- A. attendances
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert attendances" ON attendances;
DROP POLICY IF EXISTS "Allow public read attendances" ON attendances;
DROP POLICY IF EXISTS "Allow public update attendances" ON attendances;
DROP POLICY IF EXISTS "Allow public delete attendances" ON attendances;
DROP POLICY IF EXISTS "Allow public manage attendances" ON attendances;

-- B. members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read members" ON members;
DROP POLICY IF EXISTS "Allow public insert members" ON members;
DROP POLICY IF EXISTS "Allow public update members" ON members;
DROP POLICY IF EXISTS "Allow public delete members" ON members;
DROP POLICY IF EXISTS "Allow public manage members" ON members;

-- C. meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read meetings" ON meetings;
DROP POLICY IF EXISTS "Allow public manage meetings" ON meetings;
DROP POLICY IF EXISTS "Allow public insert meetings" ON meetings;
DROP POLICY IF EXISTS "Allow public update meetings" ON meetings;
DROP POLICY IF EXISTS "Allow public delete meetings" ON meetings;

-- D. registrations
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public read registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public update registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public delete registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public manage registrations" ON registrations;
DROP POLICY IF EXISTS "Deny public select registrations" ON registrations;

-- E. app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read settings" ON app_settings;
DROP POLICY IF EXISTS "Allow public manage settings" ON app_settings;
DROP POLICY IF EXISTS "Allow public insert settings" ON app_settings;
DROP POLICY IF EXISTS "Allow public update settings" ON app_settings;
DROP POLICY IF EXISTS "Allow public delete settings" ON app_settings;

-- F. quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read quizzes" ON quizzes;
DROP POLICY IF EXISTS "Allow public manage quizzes" ON quizzes;
DROP POLICY IF EXISTS "Allow public insert quizzes" ON quizzes;
DROP POLICY IF EXISTS "Allow public update quizzes" ON quizzes;
DROP POLICY IF EXISTS "Allow public delete quizzes" ON quizzes;

-- G. quiz_sessions
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read quiz_sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Allow public manage quiz_sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Allow public insert quiz_sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Allow public update quiz_sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Allow public delete quiz_sessions" ON quiz_sessions;

-- H. quiz_submissions
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read quiz_submissions" ON quiz_submissions;
DROP POLICY IF EXISTS "Allow public insert quiz_submissions" ON quiz_submissions;
DROP POLICY IF EXISTS "Allow public update quiz_submissions" ON quiz_submissions;
DROP POLICY IF EXISTS "Allow public delete quiz_submissions" ON quiz_submissions;
DROP POLICY IF EXISTS "Allow public manage quiz_submissions" ON quiz_submissions;

-- I. talent_stars (jika ada)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'talent_stars') THEN
        ALTER TABLE talent_stars ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read talent_stars" ON talent_stars;
        DROP POLICY IF EXISTS "Allow public insert talent_stars" ON talent_stars;
        DROP POLICY IF EXISTS "Allow public delete talent_stars" ON talent_stars;
        DROP POLICY IF EXISTS "Allow public manage talent_stars" ON talent_stars;
    END IF;
END $$;

-- ==============================================================================
-- 7. PASANG KEBIJAKAN BENTENG BAJA BARU (ZERO COMPROMISE RLS POLICIES)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [1] TABEL: registrations (Privasi Data Calon Anggota)
-- ------------------------------------------------------------------------------
-- Publik HANYA boleh INSERT pendaftaran baru
CREATE POLICY "Fortress: Registrations Insert Public" ON registrations
    FOR INSERT
    WITH CHECK (
        full_name IS NOT NULL AND length(trim(full_name)) > 0 AND
        class_name IS NOT NULL AND length(trim(class_name)) > 0 AND
        whatsapp_number IS NOT NULL AND length(trim(whatsapp_number)) > 0
    );

-- SELECT hanya untuk admin terotentikasi (Cegah kebocoran nomor WhatsApp calon siswa)
CREATE POLICY "Fortress: Registrations Select Admin Only" ON registrations
    FOR SELECT
    USING (is_authenticated_admin());

-- UPDATE & DELETE hanya untuk admin terotentikasi
CREATE POLICY "Fortress: Registrations Update Admin Only" ON registrations
    FOR UPDATE
    USING (is_authenticated_admin());

CREATE POLICY "Fortress: Registrations Delete Admin Only" ON registrations
    FOR DELETE
    USING (is_authenticated_admin());

-- ------------------------------------------------------------------------------
-- [2] TABEL: attendances (Integritas Rekap Presensi)
-- ------------------------------------------------------------------------------
-- SELECT diizinkan publik agar daftar hadir pertemuan & rekap statistik tampil di UI
CREATE POLICY "Fortress: Attendances Select Public" ON attendances
    FOR SELECT
    USING (true);

-- INSERT langsung via REST API diblokir untuk publik! Siswa WAJIB lewat RPC submit_student_attendance
-- Admin/Mentor dengan signed session boleh insert jika membantu siswa
CREATE POLICY "Fortress: Attendances Insert Authenticated Only" ON attendances
    FOR INSERT
    WITH CHECK (is_authenticated_admin());

-- UPDATE dilarang untuk publik, hanya admin terotentikasi
CREATE POLICY "Fortress: Attendances Update Admin Only" ON attendances
    FOR UPDATE
    USING (is_authenticated_admin());

-- DELETE dilarang untuk publik, hanya admin terotentikasi
CREATE POLICY "Fortress: Attendances Delete Admin Only" ON attendances
    FOR DELETE
    USING (is_authenticated_admin());

-- ------------------------------------------------------------------------------
-- [3] TABEL: members (Roster Siswa & Pengurus)
-- ------------------------------------------------------------------------------
-- Publik hanya boleh membaca siswa aktif untuk dropdown absensi
CREATE POLICY "Fortress: Members Select Active" ON members
    FOR SELECT
    USING (status = 'active' OR is_authenticated_admin());

-- INSERT, UPDATE, DELETE hanya boleh dilakukan oleh admin terotentikasi
CREATE POLICY "Fortress: Members Insert Admin Only" ON members
    FOR INSERT
    WITH CHECK (is_authenticated_admin());

CREATE POLICY "Fortress: Members Update Admin Only" ON members
    FOR UPDATE
    USING (is_authenticated_admin());

CREATE POLICY "Fortress: Members Delete Admin Only" ON members
    FOR DELETE
    USING (is_authenticated_admin());

-- ------------------------------------------------------------------------------
-- [4] TABEL: meetings (Sesi Pertemuan)
-- ------------------------------------------------------------------------------
CREATE POLICY "Fortress: Meetings Select Public" ON meetings
    FOR SELECT
    USING (true);

CREATE POLICY "Fortress: Meetings Insert Admin Only" ON meetings
    FOR INSERT
    WITH CHECK (is_authenticated_admin());

CREATE POLICY "Fortress: Meetings Update Admin Only" ON meetings
    FOR UPDATE
    USING (is_authenticated_admin());

CREATE POLICY "Fortress: Meetings Delete Admin Only" ON meetings
    FOR DELETE
    USING (is_authenticated_admin());

-- ------------------------------------------------------------------------------
-- [5] TABEL: app_settings (Konfigurasi Aplikasi)
-- ------------------------------------------------------------------------------
-- Publik hanya boleh membaca pengaturan non-rahasia
CREATE POLICY "Fortress: Settings Select Public" ON app_settings
    FOR SELECT
    USING (key NOT IN (
        'mentor_pin',
        'mentor_token',
        'superadmin_hash',
        'superadmin_master_hash',
        'session_hmac_secret',
        'system_secrets'
    ));

CREATE POLICY "Fortress: Settings Insert Admin Only" ON app_settings
    FOR INSERT
    WITH CHECK (is_authenticated_admin());

CREATE POLICY "Fortress: Settings Update Admin Only" ON app_settings
    FOR UPDATE
    USING (is_authenticated_admin());

CREATE POLICY "Fortress: Settings Delete Admin Only" ON app_settings
    FOR DELETE
    USING (is_authenticated_admin());

-- ------------------------------------------------------------------------------
-- [6] TABEL: quizzes (Bank Soal & Kunci Jawaban Kuis)
-- ------------------------------------------------------------------------------
-- Publik hanya boleh membaca kuis yang sedang memiliki sesi aktif atau admin
CREATE POLICY "Fortress: Quizzes Select Protected" ON quizzes
    FOR SELECT
    USING (
        is_authenticated_admin() OR 
        id IN (SELECT quiz_id FROM quiz_sessions WHERE status = 'active')
    );

CREATE POLICY "Fortress: Quizzes Insert Admin Only" ON quizzes
    FOR INSERT
    WITH CHECK (is_authenticated_admin());

CREATE POLICY "Fortress: Quizzes Update Admin Only" ON quizzes
    FOR UPDATE
    USING (is_authenticated_admin());

CREATE POLICY "Fortress: Quizzes Delete Admin Only" ON quizzes
    FOR DELETE
    USING (is_authenticated_admin());

-- ------------------------------------------------------------------------------
-- [7] TABEL: quiz_sessions (Sesi Live Kuis)
-- ------------------------------------------------------------------------------
CREATE POLICY "Fortress: Quiz Sessions Select Public" ON quiz_sessions
    FOR SELECT
    USING (true);

CREATE POLICY "Fortress: Quiz Sessions Insert Admin Only" ON quiz_sessions
    FOR INSERT
    WITH CHECK (is_authenticated_admin());

CREATE POLICY "Fortress: Quiz Sessions Update Admin Only" ON quiz_sessions
    FOR UPDATE
    USING (is_authenticated_admin());

CREATE POLICY "Fortress: Quiz Sessions Delete Admin Only" ON quiz_sessions
    FOR DELETE
    USING (is_authenticated_admin());

-- ------------------------------------------------------------------------------
-- [8] TABEL: quiz_submissions (Papan Skor Kuis)
-- ------------------------------------------------------------------------------
-- Siswa boleh melihat skor kuis (leaderboard)
CREATE POLICY "Fortress: Quiz Submissions Select Public" ON quiz_submissions
    FOR SELECT
    USING (true);

-- Siswa boleh memasukkan hasil jawaban kuis mereka
CREATE POLICY "Fortress: Quiz Submissions Insert Public" ON quiz_submissions
    FOR INSERT
    WITH CHECK (
        session_id IS NOT NULL AND
        member_id IS NOT NULL AND
        score >= 0
    );

-- Siswa DILARANG mengedit atau menghapus papan skor! Hanya admin.
CREATE POLICY "Fortress: Quiz Submissions Update Admin Only" ON quiz_submissions
    FOR UPDATE
    USING (is_authenticated_admin());

CREATE POLICY "Fortress: Quiz Submissions Delete Admin Only" ON quiz_submissions
    FOR DELETE
    USING (is_authenticated_admin());

-- ------------------------------------------------------------------------------
-- [9] TABEL: talent_stars (Bintang Bakat)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'talent_stars') THEN
        CREATE POLICY "Fortress: Talent Stars Select Public" ON talent_stars FOR SELECT USING (true);
        CREATE POLICY "Fortress: Talent Stars Insert Admin Only" ON talent_stars FOR INSERT WITH CHECK (is_authenticated_admin());
        CREATE POLICY "Fortress: Talent Stars Update Admin Only" ON talent_stars FOR UPDATE USING (is_authenticated_admin());
        CREATE POLICY "Fortress: Talent Stars Delete Admin Only" ON talent_stars FOR DELETE USING (is_authenticated_admin());
    END IF;
END $$;
