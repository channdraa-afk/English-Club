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

/**
 * Validates whether the current moment falls within the official English Club SMEGA
 * extracurricular schedule: Every Wednesday from 15:40 WIB to 17:30 WIB (UTC+7).
 */
export function getScheduleStatus(
  meeting: Meeting | null,
  isManualBypass: boolean = false
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
  // Format to Asia/Jakarta components
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

  // Window: 15:40 (940 min) to 17:30 (1050 min)
  const windowStart = 15 * 60 + 40; // 940
  const windowEnd = 17 * 60 + 30; // 1050

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
    return {
      isActive: true,
      isWithinWindow: true,
      isWednesday: true,
      isHoliday: false,
      isManualBypass: false,
      statusText: '🟢 Sesi Eskul Berlangsung (Token Aktif s.d. 17:30 WIB)',
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
      statusText: '🔒 Sesi Selesai (Token Kedaluwarsa Otomatis)',
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
    statusText: '⏸️ Di Luar Jadwal (Eskul Beroperasi Setiap Rabu 15:40 - 17:30 WIB)',
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
