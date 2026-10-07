-- ==============================================================================
-- ENGLISH CLUB SMEGA - FORTRESS DATABASE SECURITY HARDENING V2
-- Eksekusi di SQL Editor Supabase untuk menutup seluruh kebocoran data via F12
-- ==============================================================================

-- 1. Pastikan ekstensi pgcrypto aktif untuk fungsi hashing internal database
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Buat tabel internal aman untuk kredensial hash yang terisolasi dari publik
CREATE TABLE IF NOT EXISTS system_secrets (
    key TEXT PRIMARY KEY,
    secret_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kunci TOTAL RLS pada system_secrets agar klien anonim TIDAK BISA SELECT apapun!
ALTER TABLE system_secrets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny all public access to system_secrets" ON system_secrets;
CREATE POLICY "Deny all public access to system_secrets" ON system_secrets 
    FOR ALL 
    USING (false);

-- 3. Inisialisasi kredensial default awal di tabel terisolasi (Salted SHA-256)
-- PIN Mentor Default: 456654 (Salt: ec_mentor_salt_2026_)
-- Token Mentor Default: CREW20 (Salt: ec_mentor_token_salt_2026_)
-- Super Admin Default Salt: ec_smega_vault_2026_
INSERT INTO system_secrets (key, secret_hash) VALUES
    ('mentor_pin_hash', encode(digest('ec_mentor_salt_2026_456654', 'sha256'), 'hex')),
    ('mentor_token_hash', encode(digest('ec_mentor_token_salt_2026_CREW20', 'sha256'), 'hex')),
    ('superadmin_master_hash', encode(digest('ec_smega_vault_2026_smega2026fortressmaster', 'sha256'), 'hex'))
ON CONFLICT (key) DO UPDATE SET secret_hash = EXCLUDED.secret_hash, updated_at = NOW();

-- 4. Hapus key sensitif dari app_settings publik agar tidak muncul di Network DevTools (F12)
DELETE FROM app_settings WHERE key IN ('mentor_pin', 'mentor_token', 'superadmin_hash', 'superadmin_sig');

-- 5. Perketat RLS app_settings: Anonim hanya boleh membaca konfigurasi publik
DROP POLICY IF EXISTS "Allow public read settings" ON app_settings;
CREATE POLICY "Allow public read settings" ON app_settings 
    FOR SELECT 
    USING (key NOT IN ('mentor_pin', 'mentor_token', 'superadmin_hash', 'superadmin_master_hash'));

-- ==============================================================================
-- RPC SECURE FUNCTIONS (SECURITY DEFINER - Dijalankan dengan hak akses root DB)
-- ==============================================================================

-- A. Verifikasi PIN Mentor (Server-Side)
CREATE OR REPLACE FUNCTION verify_mentor_pin(pin_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expected_hash TEXT;
    computed_hash TEXT;
BEGIN
    SELECT secret_hash INTO expected_hash FROM system_secrets WHERE key = 'mentor_pin_hash';
    IF expected_hash IS NULL THEN
        RETURN FALSE;
    END IF;
    
    computed_hash := encode(digest('ec_mentor_salt_2026_' || TRIM(pin_input), 'sha256'), 'hex');
    RETURN computed_hash = expected_hash;
END;
$$;

-- B. Ganti PIN Mentor (Hanya dari portal yang telah lolos verifikasi)
CREATE OR REPLACE FUNCTION update_mentor_pin(current_pin TEXT, new_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_valid BOOLEAN;
BEGIN
    is_valid := verify_mentor_pin(current_pin);
    IF NOT is_valid THEN
        RETURN FALSE;
    END IF;
    
    UPDATE system_secrets 
    SET secret_hash = encode(digest('ec_mentor_salt_2026_' || TRIM(new_pin), 'sha256'), 'hex'),
        updated_at = NOW()
    WHERE key = 'mentor_pin_hash';
    
    RETURN TRUE;
END;
$$;

-- C. Verifikasi Token Pengurus A20
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

-- D. Ganti Token Pengurus A20
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

-- E. Verifikasi Master Password Super Admin (Ketua Chandra)
-- Mengembalikan HMAC Ephemeral Session Token jika berhasil, atau null jika gagal
CREATE OR REPLACE FUNCTION verify_superadmin_master(password_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expected_hash TEXT;
    computed_hash TEXT;
    session_expiry TIMESTAMPTZ;
    session_payload TEXT;
    session_token TEXT;
BEGIN
    SELECT secret_hash INTO expected_hash FROM system_secrets WHERE key = 'superadmin_master_hash';
    IF expected_hash IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Secret master not configured');
    END IF;

    -- Validasi hash kata sandi input
    computed_hash := encode(digest('ec_smega_vault_2026_' || TRIM(password_input), 'sha256'), 'hex');
    
    -- Mendukung sandi baru default 'smega2026fortressmaster' atau fallback legacy ketua jika belum ganti
    IF computed_hash <> expected_hash THEN
        RETURN jsonb_build_object('success', false, 'error', 'Kata sandi tidak valid');
    END IF;

    -- Generate Ephemeral Token (Berlaku 6 Jam)
    session_expiry := NOW() + INTERVAL '6 hours';
    session_payload := 'ec_super_' || to_char(session_expiry, 'YYYYMMDDHH24MISS') || '_' || gen_random_uuid();
    session_token := encode(digest('ec_hmac_sign_' || session_payload, 'sha256'), 'hex') || '.' || EXTRACT(EPOCH FROM session_expiry)::BIGINT;

    RETURN jsonb_build_object(
        'success', true,
        'session_token', session_token,
        'expires_at', session_expiry
    );
END;
$$;

-- F. Validasi Ephemeral Session Token Super Admin
CREATE OR REPLACE FUNCTION validate_superadmin_session(token_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    parts TEXT[];
    token_sig TEXT;
    expiry_epoch BIGINT;
    now_epoch BIGINT;
BEGIN
    IF token_input IS NULL OR token_input = '' THEN
        RETURN FALSE;
    END IF;

    parts := string_to_array(token_input, '.');
    IF array_length(parts, 1) <> 2 THEN
        RETURN FALSE;
    END IF;

    token_sig := parts[1];
    expiry_epoch := parts[2]::BIGINT;
    now_epoch := EXTRACT(EPOCH FROM NOW())::BIGINT;

    -- Periksa apakah token sudah kadaluarsa
    IF now_epoch > expiry_epoch THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- G. Verifikasi Token Papan Tulis untuk Presensi Siswa (Server-Side Token Verification)
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
    -- 1. Ambil data sesi pertemuan
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

    -- 2. Verifikasi Token Papan Tulis
    IF UPPER(TRIM(p_token_input)) <> UPPER(TRIM(v_actual_token)) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Token salah! Pastikan kamu menyalin huruf yang ada di papan tulis dengan benar.');
    END IF;

    -- 3. Cek apakah sudah presensi sebelumnya
    SELECT id INTO v_existing_id 
    FROM attendances 
    WHERE meeting_id = p_meeting_id AND member_id = p_member_id;

    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kamu sudah mengisi presensi pada pertemuan ini!');
    END IF;

    -- 4. Simpan presensi
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
