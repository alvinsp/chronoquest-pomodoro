export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${Math.round(totalMinutes)}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Daily Cutoff Hour: 07:00 AM WIB (Asia/Jakarta)
 *
 * For users who work/study past midnight (e.g. 00:00 - 06:59), their focus
 * sessions, daily goals, quests, and daily statistics belong to the same work cycle.
 * The daily rollover officially triggers at 07:00:00 AM Jakarta time.
 */
export const DAY_CUTOFF_HOUR = 7;
export const APP_TIMEZONE = "Asia/Jakarta";

/**
 * Returns the effective working day date string (YYYY-MM-DD) in Asia/Jakarta timezone
 * taking into account the 07:00 AM daily rollover cutoff.
 *
 * @param dateOrTimestamp - Date instance or epoch ms timestamp (defaults to Date.now())
 * @param daysAgo - Number of days prior to calculate (defaults to 0 for today)
 * @param cutoffHour - Cutoff hour in 24h format (defaults to 7 for 07:00 AM)
 */
export function getEffectiveDateString(
  dateOrTimestamp?: Date | number,
  daysAgo: number = 0,
  cutoffHour: number = DAY_CUTOFF_HOUR,
): string {
  const ms =
    typeof dateOrTimestamp === "number"
      ? dateOrTimestamp
      : (dateOrTimestamp?.getTime() ?? Date.now());

  // Shift timestamp backwards by cutoffHour (7h) + daysAgo * 24h
  const shiftedMs = ms - (cutoffHour + daysAgo * 24) * 60 * 60 * 1000;
  const shiftedDate = new Date(shiftedMs);

  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: APP_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(shiftedDate);
  } catch {
    const year = shiftedDate.getFullYear();
    const month = String(shiftedDate.getMonth() + 1).padStart(2, "0");
    const day = String(shiftedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

/**
 * Returns today's effective work date string (YYYY-MM-DD) with the 07:00 AM cutoff.
 */
export function getTodayDateString(
  dateOrTimestamp?: Date | number,
  cutoffHour: number = DAY_CUTOFF_HOUR,
): string {
  return getEffectiveDateString(dateOrTimestamp, 0, cutoffHour);
}

/**
 * Returns yesterday's effective work date string (YYYY-MM-DD) with the 07:00 AM cutoff.
 */
export function getYesterdayDateString(
  dateOrTimestamp?: Date | number,
  cutoffHour: number = DAY_CUTOFF_HOUR,
): string {
  return getEffectiveDateString(dateOrTimestamp, 1, cutoffHour);
}

export function formatDatePretty(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
