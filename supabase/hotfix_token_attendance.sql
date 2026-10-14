-- ==============================================================================
-- ENGLISH CLUB SMEGA - HOTFIX TOKEN ATTENDANCE & SCHEMA ALIGNMENT
-- Menambahkan kolom is_holiday dan memperbaiki Stored Procedure submit_student_attendance
-- ==============================================================================

-- 1. Pastikan kolom is_holiday dan holiday_reason tersedia di tabel meetings
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS is_holiday BOOLEAN DEFAULT false;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS holiday_reason TEXT;

-- 2. Bersihkan dan buat ulang Stored Procedure submit_student_attendance
DROP FUNCTION IF EXISTS submit_student_attendance(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN);

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
    SELECT token, is_active, COALESCE(is_holiday, false)
    INTO v_actual_token, v_is_active, v_is_holiday
    FROM meetings
    WHERE id = p_meeting_id;

    IF v_actual_token IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sesi pertemuan tidak ditemukan.');
    END IF;

    IF v_is_holiday THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pertemuan ini sedang libur.');
    END IF;

    IF NOT v_is_active THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sesi pertemuan ini sudah ditutup atau tidak aktif.');
    END IF;

    -- 2. Verifikasi Token Papan Tulis (Case-Insensitive & Trimmed)
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

    -- 4. Simpan presensi (SECURITY DEFINER bypass RLS untuk insert presensi valid)
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
