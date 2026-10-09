const dateTime = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
const dateOnly = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTime.format(new Date(iso)) : '—';
}

export function formatDate(isoDate: string | null | undefined): string {
  // "2026-10-08" is read as local midnight, not UTC, so the day does not shift
  return isoDate ? dateOnly.format(new Date(`${isoDate}T00:00:00`)) : '—';
}

export function formatNumber(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('es-CO', { maximumFractionDigits: decimals });
}

/** "hace 5 min", "hace 2 h", "hace 3 días". */
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'nunca';
  const minutes = Math.round((now - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
}
