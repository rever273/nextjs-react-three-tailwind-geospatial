// Brisbane has no daylight saving: UTC+10 is stable throughout the year.
export const demoSchedule = { startHour: 7, endHour: 17, cycleSeconds: 1200, activeSeconds: 420, rate: 300_000, sampleBase: 2_840_000 };
const DAY = 86_400_000;
const OFFSET = 36_000_000;
export type Schedule = typeof demoSchedule;
export function activeSecondsBetween(start: number, end: number, schedule: Schedule = demoSchedule): number {
  if (end <= start) return 0;
  const firstDay = Math.floor((start + OFFSET) / DAY);
  const lastDay = Math.floor((end + OFFSET) / DAY);
  const cumulative = (seconds: number) => {
    const value = Math.max(0, seconds);
    return Math.floor(value / schedule.cycleSeconds) * schedule.activeSeconds + Math.min(value % schedule.cycleSeconds, schedule.activeSeconds);
  };
  let active = 0;
  for (let day = firstDay; day <= lastDay; day++) {
    const opening = day * DAY - OFFSET + schedule.startHour * 3_600_000;
    const closing = day * DAY - OFFSET + schedule.endHour * 3_600_000;
    const a = Math.max(start, opening), b = Math.min(end, closing);
    if (b > a) active += cumulative((b - opening) / 1000) - cumulative((a - opening) / 1000);
  }
  return active;
}
export function scannerSnapshot(origin: number, now: number, base = demoSchedule.sampleBase, schedule: Schedule = demoSchedule) {
  const local = now + OFFSET;
  const day = Math.floor(local / DAY);
  const seconds = (local - day * DAY) / 1000;
  const start = schedule.startHour * 3600, end = schedule.endHour * 3600;
  const overnight = seconds < start || seconds >= end;
  const active = !overnight && (seconds - start) % schedule.cycleSeconds < schedule.activeSeconds;
  const nextStart = (day + (seconds >= end ? 1 : 0)) * DAY - OFFSET + start * 1000;
  return { count: base + Math.floor(activeSecondsBetween(origin, now, schedule) * schedule.rate), overnight, active, nextStart };
}

// Demo presentation (user decision, 18 Oct 2026): the visible counter runs around the clock.
// The schedule-aware model above is kept and tested; this schedule simply has no idle time.
export const alwaysOnSchedule: Schedule = { ...demoSchedule, startHour: 0, endHour: 24, cycleSeconds: 1200, activeSeconds: 1200 };
