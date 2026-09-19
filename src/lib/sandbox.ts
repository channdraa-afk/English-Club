import { supabase } from './supabase';
import { sound } from './audio';

export interface SandboxState {
  is_active: boolean;
  meeting_id?: string;
  quiz_session_id?: string;
  token?: string;
  activated_at?: string;
  deactivated_at?: string;
}

export interface SandboxStats {
  testAttendances: number;
  testQuizSubmissions: number;
  testStars: number;
}

export const SANDBOX_MEETING_TITLE = '🧪 [UJI COBA] Simulasi Eskul English Club';
export const SANDBOX_TOKEN = 'COBA';

/**
 * Start Sandbox Mode:
 * 1. Creates/activates test meeting with token 'COBA'
 * 2. Creates/activates test quiz session with room code 'COBA' if a quiz exists
 * 3. Updates 'sandbox_mode' in app_settings to broadcast active state to all devices
 */
export async function startSandboxMode(): Promise<SandboxState> {
  try {
    // 1. Check or create sandbox meeting
    let sandboxMeetingId = '';
    const { data: existingMeeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('token', SANDBOX_TOKEN)
      .maybeSingle();

    const todayStr = new Date().toISOString().split('T')[0];

    if (existingMeeting) {
      sandboxMeetingId = existingMeeting.id;
      await supabase
        .from('meetings')
        .update({
          title: SANDBOX_MEETING_TITLE,
          meeting_date: todayStr,
          word_of_the_day: 'Simulation',
          word_meaning: 'Mode Uji Coba & Pemeliharaan Sistem Terisolasi',
          is_active: true,
          is_holiday: false,
        })
        .eq('id', sandboxMeetingId);
    } else {
      const { data: newMeeting, error: meetErr } = await supabase
        .from('meetings')
        .insert({
          meeting_date: todayStr,
          title: SANDBOX_MEETING_TITLE,
          token: SANDBOX_TOKEN,
          word_of_the_day: 'Simulation',
          word_meaning: 'Mode Uji Coba & Pemeliharaan Sistem Terisolasi',
          is_active: true,
          is_holiday: false,
        })
        .select('id')
        .single();

      if (meetErr) throw meetErr;
      sandboxMeetingId = newMeeting.id;
    }

    // 2. Check or create test quiz session with room code 'COBA'
    let sandboxQuizSessionId = '';
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (quizzes && quizzes.length > 0) {
      const targetQuizId = quizzes[0].id;
      // Close any old test sessions with room_code 'COBA'
      await supabase
        .from('quiz_sessions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('room_code', SANDBOX_TOKEN);

      // Create a fresh test quiz session
      const { data: newQSession } = await supabase
        .from('quiz_sessions')
        .insert({
          quiz_id: targetQuizId,
          room_code: SANDBOX_TOKEN,
          status: 'active',
          created_by: 'Super Admin (Uji Coba)',
        })
        .select('id')
        .single();

      if (newQSession) {
        sandboxQuizSessionId = newQSession.id;
      }
    }

    // 3. Save sandbox state to app_settings
    const statePayload: SandboxState = {
      is_active: true,
      meeting_id: sandboxMeetingId,
      quiz_session_id: sandboxQuizSessionId,
      token: SANDBOX_TOKEN,
      activated_at: new Date().toISOString(),
    };

    await supabase
      .from('app_settings')
      .upsert({ key: 'sandbox_mode', value: statePayload });

    sound.playSuccess();
    return statePayload;
  } catch (err: any) {
    sound.playError();
    console.error('Failed to start sandbox mode:', err);
    throw err;
  }
}

/**
 * Fetch stats of test data currently in sandbox
 */
export async function getSandboxStats(): Promise<SandboxStats> {
  try {
    // 1. Get test meeting IDs
    const { data: testMeetings } = await supabase
      .from('meetings')
      .select('id')
      .eq('token', SANDBOX_TOKEN);

    const testMeetIds = (testMeetings || []).map((m) => m.id);

    let testAttendances = 0;
    let testStars = 0;

    if (testMeetIds.length > 0) {
      const { count: attCount } = await supabase
        .from('attendances')
        .select('*', { count: 'exact', head: true })
        .in('meeting_id', testMeetIds);
      testAttendances = attCount || 0;

      try {
        const { count: starCount } = await supabase
          .from('talent_stars')
          .select('*', { count: 'exact', head: true })
          .in('meeting_id', testMeetIds);
        testStars = starCount || 0;
      } catch {
        // Ignored if table not created
      }
    }

    // 2. Get test quiz submissions
    const { data: testSessions } = await supabase
      .from('quiz_sessions')
      .select('id')
      .eq('room_code', SANDBOX_TOKEN);

    const testSessionIds = (testSessions || []).map((s) => s.id);
    let testQuizSubmissions = 0;

    if (testSessionIds.length > 0) {
      const { count: subCount } = await supabase
        .from('quiz_submissions')
        .select('*', { count: 'exact', head: true })
        .in('session_id', testSessionIds);
      testQuizSubmissions = subCount || 0;
    }

    return {
      testAttendances,
      testQuizSubmissions,
      testStars,
    };
  } catch (err) {
    console.error('Failed to fetch sandbox stats:', err);
    return { testAttendances: 0, testQuizSubmissions: 0, testStars: 0 };
  }
}

/**
 * Stop Sandbox Mode & Auto-Purge All Simulation Data (100% Zero Residue):
 * 1. Deletes all attendances for test meetings
 * 2. Deletes all quiz submissions for test quiz sessions
 * 3. Deletes test quiz sessions
 * 4. Deletes test talent stars
 * 5. Deletes test meetings
 * 6. Sets 'sandbox_mode' in app_settings to { is_active: false }
 */
export async function stopSandboxModeAndPurge(): Promise<void> {
  try {
    // 1. Find all test meetings with token 'COBA' or title containing '[UJI COBA]'
    const { data: testMeetings } = await supabase
      .from('meetings')
      .select('id')
      .or(`token.eq.${SANDBOX_TOKEN},title.ilike.%[UJI COBA]%`);

    const testMeetingIds = (testMeetings || []).map((m) => m.id);

    if (testMeetingIds.length > 0) {
      // A. Delete test attendances
      await supabase
        .from('attendances')
        .delete()
        .in('meeting_id', testMeetingIds);

      // B. Delete test talent stars
      try {
        await supabase
          .from('talent_stars')
          .delete()
          .in('meeting_id', testMeetingIds);
      } catch (e) {
        console.warn('Talent stars cleanup notice:', e);
      }

      // C. Also clean fallback talent_stars from app_settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'talent_stars')
        .maybeSingle();

      if (settingsData && Array.isArray(settingsData.value)) {
        const cleanedStars = settingsData.value.filter(
          (s: any) => !testMeetingIds.includes(s.meeting_id)
        );
        await supabase
          .from('app_settings')
          .upsert({ key: 'talent_stars', value: cleanedStars });
      }

      // D. Delete the test meetings entirely
      await supabase
        .from('meetings')
        .delete()
        .in('id', testMeetingIds);
    }

    // 2. Find and purge test quiz sessions & submissions
    const { data: testQuizSessions } = await supabase
      .from('quiz_sessions')
      .select('id')
      .or(`room_code.eq.${SANDBOX_TOKEN},created_by.ilike.%Uji Coba%`);

    const testSessionIds = (testQuizSessions || []).map((s) => s.id);

    if (testSessionIds.length > 0) {
      await supabase
        .from('quiz_submissions')
        .delete()
        .in('session_id', testSessionIds);

      await supabase
        .from('quiz_sessions')
        .delete()
        .in('id', testSessionIds);
    }

    // 3. Deactivate sandbox_mode in app_settings
    await supabase
      .from('app_settings')
      .upsert({
        key: 'sandbox_mode',
        value: {
          is_active: false,
          deactivated_at: new Date().toISOString(),
        },
      });

    sound.playFanfare();
  } catch (err: any) {
    sound.playError();
    console.error('Failed to stop and purge sandbox mode:', err);
    throw err;
  }
}
