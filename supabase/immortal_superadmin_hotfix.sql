-- ==============================================================================
-- ENGLISH CLUB SMEGA - IMMORTAL SUPER ADMIN HOTFIX
-- Menjadikan sesi Super Admin (Ketua Chandra) abadi & kebal kedaluwarsa (100 tahun)
-- Memperbaiki Stored Procedure validasi HMAC dan menambahkan RPC admin_toggle_attendance
-- ==============================================================================

-- 1. Validasi Ephemeral Session Token Super Admin (Kekal tanpa batas waktu)
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

    -- Super Admin: Validasi murni role & signature (Kebal kedaluwarsa / Zero Auto-Logout)
    IF v_role <> 'superadmin' THEN
        RETURN FALSE;
    END IF;

    v_secret := get_session_hmac_secret();
    expected_sig := encode(hmac(v_data, v_secret, 'sha256'), 'hex');

    RETURN v_sig = expected_sig;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 2. Validasi Ephemeral Session Token Mentor & Super Admin
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

    -- Super Admin abadi tanpa expiry; Mentor reguler dicek masa aktifnya
    IF v_role = 'superadmin' THEN
        NULL; -- Lanjut cek signature HMAC
    ELSIF v_role = 'mentor' THEN
        v_expiry := data_parts[2]::BIGINT;
        IF EXTRACT(EPOCH FROM NOW())::BIGINT > v_expiry THEN
            RETURN FALSE;
        END IF;
    ELSE
        RETURN FALSE;
    END IF;

    v_secret := get_session_hmac_secret();
    expected_sig := encode(hmac(v_data, v_secret, 'sha256'), 'hex');

    RETURN v_sig = expected_sig;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 3. Verifikasi Master Password Super Admin (Generate Sesi 100 Tahun)
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

    -- Generate Kriptografis HMAC-SHA256 Token Abadi (100 Tahun / Th 2126)
    v_expiry := (EXTRACT(EPOCH FROM (NOW() + INTERVAL '100 years')))::BIGINT;
    v_data := 'superadmin:' || v_expiry::TEXT || ':' || gen_random_uuid()::TEXT;
    v_secret := get_session_hmac_secret();
    v_sig := encode(hmac(v_data, v_secret, 'sha256'), 'hex');
    v_token := v_sig || '.' || v_data;

    RETURN jsonb_build_object(
        'success', true,
        'session_token', v_token,
        'expires_at', (NOW() + INTERVAL '100 years')
    );
END;
$$;

-- 4. Stored Procedure Baru: admin_toggle_attendance (Atomic & Bebas Hambatan)
CREATE OR REPLACE FUNCTION admin_toggle_attendance(
    p_meeting_id UUID,
    p_member_id UUID,
    p_state BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Pastikan pemanggil membawa sesi Admin/SuperAdmin yang sah
    IF NOT is_authenticated_admin() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Sesi admin tidak valid');
    END IF;

    -- Hapus presensi lama jika ada (idempotent)
    DELETE FROM attendances
    WHERE meeting_id = p_meeting_id AND member_id = p_member_id;

    -- Jika nextState adalah hadir (true), sisipkan data baru
    IF p_state THEN
        INSERT INTO attendances (
            meeting_id,
            member_id,
            feedback_rating,
            critique,
            next_agenda_suggestion,
            is_anonymous
        ) VALUES (
            p_meeting_id,
            p_member_id,
            'super_fun',
            NULL,
            NULL,
            false
        );
    END IF;

    RETURN jsonb_build_object('success', true, 'state', p_state);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
