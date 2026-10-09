/**
 * The backend wants ISO dates with a time zone ("2026-10-08T14:00:00-05:00").
 * We send the phone's local offset so the record keeps the hour the caretaker saw.
 */
export function toIsoWithOffset(date: Date = new Date()): string {
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.trunc(offsetMin / 60))}:${pad(offsetMin % 60)}`
  );
}

/** "2026-10-08" in local time, for date inputs and fecha_siembra. */
export function toLocalDate(date: Date = new Date()): string {
  return toIsoWithOffset(date).slice(0, 10);
}

/** Value for <input type="datetime-local"> ("2026-10-08T14:05"). */
export function toDateTimeInput(date: Date = new Date()): string {
  return toIsoWithOffset(date).slice(0, 16);
}

const DAY_MS = 24 * 60 * 60 * 1000;
export const MIN_VALID_DATE = new Date('2024-01-01T00:00:00Z');

/** Same rule as the backend: not before 2024 (clock not set) and not more than one day ahead. */
export function deviceDateError(date: Date, now: Date = new Date()): string | null {
  if (Number.isNaN(date.getTime())) return 'La fecha no es válida';
  if (date < MIN_VALID_DATE) return 'La fecha es anterior a 2024: revisa el reloj del celular';
  if (date.getTime() - now.getTime() > DAY_MS) return 'La fecha está en el futuro';
  return null;
}
