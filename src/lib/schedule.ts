import { Meeting } from '../types/database';

export interface ScheduleStatus {
  isActive: boolean;
  isWithinWindow: boolean;
  isWednesday: boolean;
  isHoliday: boolean;
  isManualBypass: boolean;
  statusText: string;
  badgeColor: 'emerald' | 'amber' | 'rose' | 'slate';
  currentTimeWIB: string;
}

export interface TargetWednesdayInfo {
  dateStr: string;
  formattedIndo: string;
  isToday: boolean;
  daysUntilWednesday: number;
}

/**
 * Calculates the target Wednesday for the English Club session.
 * - If today is Wednesday and before 18:00 WIB, the target is today.
 * - If today is Wednesday after 18:00 WIB, or any other day (e.g. Thursday 17 Sep),
 *   the target is the upcoming Wednesday (e.g. 23 Sep, or 30 Sep if next week).
 */
export function getTargetWednesdayDate(fromDate: Date = new Date()): TargetWednesdayInfo {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(fromDate);
  const weekday = parts.find((p) => p.type === 'weekday')?.value || '';
  const year = parseInt(parts.find((p) => p.type === 'year')?.value || '2026', 10);
  const month = parseInt(parts.find((p) => p.type === 'month')?.value || '9', 10);
  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '17', 10);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const currentDayOfWeek = dayMap[weekday] ?? 3;
  const currentMinutes = hour * 60 + minute;

  let daysUntilWednesday = 0;
  let isToday = false;

  if (currentDayOfWeek === 3) {
    if (currentMinutes > 18 * 60) {
      daysUntilWednesday = 7;
      isToday = false;
    } else {
      daysUntilWednesday = 0;
      isToday = true;
    }
  } else if (currentDayOfWeek < 3) {
    daysUntilWednesday = 3 - currentDayOfWeek;
    isToday = false;
  } else {
    daysUntilWednesday = 7 - (currentDayOfWeek - 3);
    isToday = false;
  }

  const target = new Date(Date.UTC(year, month - 1, day + daysUntilWednesday));
  const yStr = target.getUTCFullYear();
  const mStr = String(target.getUTCMonth() + 1).padStart(2, '0');
  const dStr = String(target.getUTCDate()).padStart(2, '0');
  const dateStr = `${yStr}-${mStr}-${dStr}`;

  const formattedIndo = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(target);

  return { dateStr, formattedIndo, isToday, daysUntilWednesday };
}

/**
 * Validates whether the current moment falls within the official English Club SMEGA
 * extracurricular schedule: Every Wednesday from 15:40 WIB to:
 * - 17:30 WIB for Students (A21)
 * - 18:00 WIB (Jam 6 sore) for Mentors/Pengurus (A20) to allow evaluation & clean-up duty.
 */
export function getScheduleStatus(
  meeting: Meeting | null,
  isManualBypass: boolean = false,
  role: 'student' | 'mentor' = 'student'
): ScheduleStatus {
  // If meeting is officially set to holiday
  if (meeting?.is_holiday) {
    return {
      isActive: false,
      isWithinWindow: false,
      isWednesday: false,
      isHoliday: true,
      isManualBypass: false,
      statusText: `🏖️ Eskul Libur: ${meeting.holiday_reason || 'Pertemuan Diliburkan'}`,
      badgeColor: 'rose',
      currentTimeWIB: getCurrentWIBString(),
    };
  }

  // Calculate WIB time (UTC+7)
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value || '';
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

  const isWednesday = weekday === 'Wed';
  const totalMinutes = hour * 60 + minute;

  // Window start: 15:40 WIB (940 min)
  const windowStart = 15 * 60 + 40;
  // Window end: 17:30 WIB (1050 min) for students; 18:00 WIB (1080 min) for mentors
  const isMentor = role === 'mentor';
  const windowEnd = isMentor ? 18 * 60 : 17 * 60 + 30;

  const isWithinWindow = isWednesday && totalMinutes >= windowStart && totalMinutes <= windowEnd;
  const currentTimeWIB = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} WIB`;

  // If Super Admin activated manual bypass
  if (isManualBypass) {
    return {
      isActive: true,
      isWithinWindow,
      isWednesday,
      isHoliday: false,
      isManualBypass: true,
      statusText: '⚡ Mode Uji Coba / Bypass Manual (Dibuka oleh Ketua)',
      badgeColor: 'amber',
      currentTimeWIB,
    };
  }

  if (isWithinWindow) {
    let statusText = '🟢 Sesi Eskul Berlangsung (Token Aktif s.d. 17:30 WIB)';
    if (isMentor) {
      if (totalMinutes > 17 * 60 + 30) {
        statusText = '🟢 Presensi Pengurus Aktif (Perpanjangan Evaluasi & Bersih-bersih s.d. 18:00 WIB)';
      } else {
        statusText = '🟢 Presensi Pengurus Aktif (Batas Jam 18:00 WIB)';
      }
    }

    return {
      isActive: true,
      isWithinWindow: true,
      isWednesday: true,
      isHoliday: false,
      isManualBypass: false,
      statusText,
      badgeColor: 'emerald',
      currentTimeWIB,
    };
  }

  // If outside window
  if (isWednesday && totalMinutes > windowEnd) {
    return {
      isActive: false,
      isWithinWindow: false,
      isWednesday: true,
      isHoliday: false,
      isManualBypass: false,
      statusText: isMentor
        ? '🔒 Presensi Pengurus Selesai (Batas 18:00 WIB Lewat)'
        : '🔒 Sesi Selesai (Token Kedaluwarsa Otomatis)',
      badgeColor: 'slate',
      currentTimeWIB,
    };
  }

  if (isWednesday && totalMinutes < windowStart) {
    return {
      isActive: false,
      isWithinWindow: false,
      isWednesday: true,
      isHoliday: false,
      isManualBypass: false,
      statusText: '⏳ Menunggu Jam Eskul (Mulai pukul 15:40 WIB)',
      badgeColor: 'amber',
      currentTimeWIB,
    };
  }

  return {
    isActive: false,
    isWithinWindow: false,
    isWednesday: false,
    isHoliday: false,
    isManualBypass: false,
    statusText: isMentor
      ? '⏸️ Di Luar Jadwal (Presensi Pengurus Setiap Rabu 15:40 - 18:00 WIB)'
      : '⏸️ Di Luar Jadwal (Eskul Beroperasi Setiap Rabu 15:40 - 17:30 WIB)',
    badgeColor: 'slate',
    currentTimeWIB,
  };
}

function getCurrentWIBString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formatter.format(new Date())} WIB`;
  } catch {
    return 'WIB';
  }
}

/**
 * Lightweight helper to check if attendance session is currently active.
 * Handles Wednesday window (15:40 - 17:30/18:00 WIB) and manual bypass.
 */
export function isSessionActiveNow(
  isManualBypass: boolean = false,
  role: 'student' | 'mentor' = 'student'
): boolean {
  return getScheduleStatus(null, isManualBypass, role).isActive;
}
