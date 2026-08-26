export const DIGEST_TIMEZONE = "Asia/Shanghai";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function todayInShanghai(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DIGEST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isValidDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function clampDigestDate(raw: string | undefined, today = todayInShanghai()): string {
  if (!raw || !isValidDateKey(raw)) return today;
  if (raw > today) return today;
  const earliest = shiftDate(today, -60);
  if (raw < earliest) return earliest;
  return raw;
}

export function shiftDate(dateKey: string, days: number): string {
  const utc = new Date(`${dateKey}T00:00:00Z`);
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function daysBetween(later: string, earlier: string): number {
  const a = Date.parse(`${later.slice(0, 10)}T00:00:00Z`);
  const b = Date.parse(`${earlier.slice(0, 10)}T00:00:00Z`);
  return Math.round((a - b) / 86_400_000);
}

export function formatChineseDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(`${dateKey}T12:00:00Z`).getUTCDay()];
  return `${year}年${month}月${day}日 星期${weekday}`;
}

export function relativeDayLabel(iso: string, dateKey: string): string {
  const days = daysBetween(dateKey, iso.slice(0, 10));
  if (days <= 0) return "今天新建";
  if (days === 1) return "昨天新建";
  if (days < 7) return `${days} 天前新建`;
  if (days < 30) return `${Math.ceil(days / 7)} 周前新建`;
  return `${Math.ceil(days / 30)} 个月前新建`;
}
