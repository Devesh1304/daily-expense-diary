import { DateFilter, DateRange } from '../types';

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

// Returns an inclusive [start, end] range in 'YYYY-MM-DD' for the given filter.
export function getDateRange(filter: DateFilter, custom?: DateRange): DateRange {
  const now = new Date();
  if (filter === 'today') {
    const today = toDateString(now);
    return { start: today, end: today };
  }
  if (filter === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { start: toDateString(start), end: toDateString(now) };
  }
  if (filter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: toDateString(start), end: toDateString(now) };
  }
  return custom ?? { start: toDateString(now), end: toDateString(now) };
}

export function isWithinRange(date: string, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

// Formats 'YYYY-MM-DD' -> 'DD-MM-YY' for compact display in tables.
export function formatDisplayDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}-${m}-${y.slice(2)}`;
}
