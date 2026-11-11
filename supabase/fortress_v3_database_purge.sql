-- ==============================================================================
-- ENGLISH CLUB SMEGA - FORTRESS V3 DATABASE PURGE & SECURITY HARDENING
-- Menambal celah HMAC, mematikan policy zombie, dan membersihkan data sampah
-- ==============================================================================

-- 1. Cabut total hak eksekusi publik dari fungsi rahasia HMAC
REVOKE EXECUTE ON FUNCTION public.get_session_hmac_secret() FROM PUBLIC, anon, authenticated;

-- 2. Hapus secara permanen policy zombie pada tabel members
DROP POLICY IF EXISTS "Allow public insert/update members" ON public.members;

-- 3. Hapus baris konfigurasi sampah masa lalu dari app_settings
DELETE FROM public.app_settings WHERE key IN ('test_ping', 'holiday_config');

-- 4. Tambahkan covering indexes untuk performa relasi kuis
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz_id ON public.quiz_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_member_id ON public.quiz_submissions(member_id);

-- 5. Standardisasi search_path pada seluruh Stored Procedures (Mencegah Search Path Hijacking)
ALTER FUNCTION public.get_session_hmac_secret() SET search_path = public;
ALTER FUNCTION public.validate_superadmin_session(TEXT) SET search_path = public;
ALTER FUNCTION public.validate_mentor_session(TEXT) SET search_path = public;
ALTER FUNCTION public.verify_superadmin_master(TEXT) SET search_path = public;
ALTER FUNCTION public.verify_mentor_pin(TEXT) SET search_path = public;
ALTER FUNCTION public.update_mentor_pin(TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.verify_mentor_token(TEXT) SET search_path = public;
ALTER FUNCTION public.update_mentor_token(TEXT) SET search_path = public;
ALTER FUNCTION public.is_authenticated_admin() SET search_path = public;
ALTER FUNCTION public.submit_student_attendance(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) SET search_path = public;
ALTER FUNCTION public.get_admin_registrations(TEXT) SET search_path = public;
ALTER FUNCTION public.approve_registration_admin(TEXT, UUID, TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.update_registration_status_admin(TEXT, UUID, TEXT) SET search_path = public;
ALTER FUNCTION public.admin_toggle_attendance(UUID, UUID, BOOLEAN) SET search_path = public;
