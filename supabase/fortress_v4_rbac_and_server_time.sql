-- ==============================================================================
-- ENGLISH CLUB SMEGA - FORTRESS V4: RBAC SEPARATION & SERVER-SIDE TIME GATE
-- Memisahkan hak akses Super Admin vs Mentor di RLS serta memindahkan validasi
-- jam 16:10 WIB & token pengurus ke server PostgreSQL (submit_mentor_attendance)
-- ==============================================================================

-- 1. Helper RBAC: Khusus Super Admin (Ketua Chandra)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
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

    RETURN validate_superadmin_session(token_val);
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 2. Perketat RLS Tabel Sensitif (members, meetings, registrations) khusus Super Admin
ALTER POLICY "Fortress: Members Insert Admin Only" ON public.members WITH CHECK (is_superadmin());
ALTER POLICY "Fortress: Members Update Admin Only" ON public.members USING (is_superadmin());
ALTER POLICY "Fortress: Members Delete Admin Only" ON public.members USING (is_superadmin());

ALTER POLICY "Fortress: Meetings Insert Admin Only" ON public.meetings WITH CHECK (is_superadmin());
ALTER POLICY "Fortress: Meetings Update Admin Only" ON public.meetings USING (is_superadmin());
ALTER POLICY "Fortress: Meetings Delete Admin Only" ON public.meetings USING (is_superadmin());

ALTER POLICY "Fortress: Registrations Select Admin Only" ON public.registrations USING (is_superadmin());
ALTER POLICY "Fortress: Registrations Update Admin Only" ON public.registrations USING (is_superadmin());
ALTER POLICY "Fortress: Registrations Delete Admin Only" ON public.registrations USING (is_superadmin());

-- 3. RPC Presensi Pengurus Server-Side (Cek Jam Server >= 16:10 WIB & Token Pengurus)
CREATE OR REPLACE FUNCTION public.submit_mentor_attendance(
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
SET search_path = public, extensions
AS $$
DECLARE
    v_wib_time TIME;
    v_existing_id UUID;
BEGIN
    -- Super Admin kebal dari batas jam 16:10 & token
    IF NOT is_superadmin() THEN
        v_wib_time := (NOW() AT TIME ZONE 'Asia/Jakarta')::TIME;
        IF v_wib_time < TIME '16:10:00' THEN
            RETURN jsonb_build_object(
                'success', false,
                'code', 'BEFORE_1610',
                'message', 'Presensi pengurus baru dibuka pukul 16:10 WIB.'
            );
        END IF;

        IF NOT verify_mentor_token(p_token_input) THEN
            RETURN jsonb_build_object(
                'success', false,
                'code', 'INVALID_TOKEN',
                'message', 'Token Khusus Pengurus salah! Tanyakan token ini ke Ketua / BPH.'
            );
        END IF;
    END IF;

    -- Cek duplikasi
    SELECT id INTO v_existing_id
    FROM attendances
    WHERE meeting_id = p_meeting_id AND member_id = p_member_id;

    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'code', 'DUPLICATE', 'message', 'Kamu sudah tercatat hadir di pertemuan ini!');
    END IF;

    -- Simpan presensi
    INSERT INTO attendances (
        meeting_id, member_id, feedback_rating, critique, next_agenda_suggestion, is_anonymous
    ) VALUES (
        p_meeting_id, p_member_id, p_feedback_rating, p_critique, p_next_agenda, p_is_anonymous
    );

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
