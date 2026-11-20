import { toneOf, type ReadingTone } from '../ponds/waterRanges';
import type { FieldRecord, RecordType } from '../records/recordTypes';
import type { AlertLevel } from '../alerts/alertTypes';

/**
 * Historial y reportes: qué pasó en la finca en un periodo, y el resumen para entregarlo.
 *
 * Todo lo de aquí es cálculo puro sobre registros y alertas ya cargados: no sabe si vinieron del
 * celular o del servidor. La pantalla junta las dos fuentes (ver historyApi) y esto las ordena,
 * las cuenta y las convierte en texto, CSV o un resumen para compartir.
 *
 * Las horas se muestran en hora de Colombia, que no tiene horario de verano: un registro de las
 * 11 de la noche cae en su día aunque en UTC ya sea el siguiente.
 */

const ZONE = 'America/Bogota';
const DAY_MS = 86_400_000;

export type Period = 'hoy' | '7d' | '30d' | '90d';

export const PERIOD_LABELS: Record<Period, string> = {
  hoy: 'Hoy',
  '7d': '7 días',
  '30d': '30 días',
  '90d': '90 días',
};

/** Una alerta del historial: las pendientes y también las que ya se atendieron. */
export interface AlertEntry {
  id: string;
  pondId: string;
  level: AlertLevel;
  message: string;
  measuredAt: string;
  attended?: boolean;
}

/** Nombres para mostrar y a qué estanque pertenece cada lote. */
export interface Names {
  ponds: Map<string, string>;
  batches: Map<string, { label: string; pondId: string }>;
}

/** Medianoche de hoy en Colombia (UTC-5 fijo), como instante. */
function startOfTodayColombia(now: Date): Date {
  const colombia = new Date(now.getTime() - 5 * 3_600_000);
  const midnightUtc = Date.UTC(colombia.getUTCFullYear(), colombia.getUTCMonth(), colombia.getUTCDate());
  return new Date(midnightUtc + 5 * 3_600_000);
}

/** Desde cuándo cuenta cada periodo. "7 días" es hoy y los seis anteriores, completos. */
export function periodStart(period: Period, now: Date): Date {
  const today = startOfTodayColombia(now);
  const days = { hoy: 0, '7d': 6, '30d': 29, '90d': 89 }[period];
  return new Date(today.getTime() - days * DAY_MS);
}

const pondOf = (record: FieldRecord, names: Names): string | undefined =>
  record.type === 'water_reading' ? record.pondId : names.batches.get(record.batchId)?.pondId;

/**
 * Junta lo del servidor con lo del celular. Si un registro está en los dos gana el del celular,
 * porque es el que sabe si todavía falta subirlo.
 */
export function mergeById<T extends { id: string }>(server: T[], local: T[]): T[] {
  const byId = new Map(server.map((item) => [item.id, item]));
  for (const item of local) byId.set(item.id, item);
  return [...byId.values()];
}

export interface Scope {
  from: Date;
  /** Solo un estanque (y sus lotes). Sin él, toda la finca. */
  pondId?: string;
}

export function recordsInScope(records: FieldRecord[], scope: Scope, names: Names): FieldRecord[] {
  const from = scope.from.toISOString();
  return records.filter((r) => r.recordedAt >= from && (!scope.pondId || pondOf(r, names) === scope.pondId));
}

export function alertsInScope(alerts: AlertEntry[], scope: Scope): AlertEntry[] {
  const from = scope.from.toISOString();
  return alerts.filter((a) => a.measuredAt >= from && (!scope.pondId || a.pondId === scope.pondId));
}

// ---------- El reporte ----------

export interface Stat {
  count: number;
  avg?: number;
  min?: number;
  max?: number;
}

function stat(values: (number | undefined)[]): Stat {
  const v = values.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  if (v.length === 0) return { count: 0 };
  return { count: v.length, avg: v.reduce((s, x) => s + x, 0) / v.length, min: Math.min(...v), max: Math.max(...v) };
}

export interface Report {
  water: { readings: number; temp: Stat; ph: Stat; oxygen: Stat; outOfOptimal: number; critical: number };
  feeding: { times: number; kg: number };
  mortality: { records: number; fish: number; byCause: [string, number][] };
  /** El último peso promedio de cada lote en el periodo. */
  weights: { batch: string; avgWeightG: number; at: string }[];
  counts: { times: number; fish: number };
  alerts: { total: number; critical: number; pending: number };
  /** Registros del periodo que todavía no llegan al servidor. */
  pendingUpload: number;
}

/** Peor estado de una lectura de agua: si alguna variable salió del rango, la lectura salió. */
function readingTone(r: Extract<FieldRecord, { type: 'water_reading' }>): ReadingTone {
  const tones = [toneOf('tempC', r.tempC), toneOf('ph', r.ph), toneOf('oxygenMgL', r.oxygenMgL)];
  if (tones.includes('danger')) return 'danger';
  if (tones.includes('warn')) return 'warn';
  return tones.includes('ok') ? 'ok' : 'none';
}

export function buildReport(records: FieldRecord[], alerts: AlertEntry[], names: Names): Report {
  const water = records.filter((r) => r.type === 'water_reading');
  const feedings = records.filter((r) => r.type === 'feeding');
  const deaths = records.filter((r) => r.type === 'mortality');
  const counts = records.filter((r) => r.type === 'fry_count');

  const causes = new Map<string, number>();
  for (const d of deaths) {
    const cause = d.cause?.trim() || 'Sin causa anotada';
    causes.set(cause, (causes.get(cause) ?? 0) + d.quantity);
  }

  const lastWeight = new Map<string, { avgWeightG: number; at: string }>();
  for (const b of records) {
    if (b.type !== 'biometry') continue;
    const current = lastWeight.get(b.batchId);
    if (!current || b.recordedAt > current.at) lastWeight.set(b.batchId, { avgWeightG: b.avgWeightG, at: b.recordedAt });
  }

  const tones = water.map(readingTone);
  return {
    water: {
      readings: water.length,
      temp: stat(water.map((r) => r.tempC)),
      ph: stat(water.map((r) => r.ph)),
      oxygen: stat(water.map((r) => r.oxygenMgL)),
      outOfOptimal: tones.filter((t) => t === 'warn' || t === 'danger').length,
      critical: tones.filter((t) => t === 'danger').length,
    },
    feeding: { times: feedings.length, kg: feedings.reduce((s, f) => s + f.kg, 0) },
    mortality: {
      records: deaths.length,
      fish: deaths.reduce((s, d) => s + d.quantity, 0),
      byCause: [...causes.entries()].sort((a, b) => b[1] - a[1]),
    },
    weights: [...lastWeight.entries()]
      .map(([batchId, w]) => ({ batch: names.batches.get(batchId)?.label ?? 'Lote', ...w }))
      .sort((a, b) => a.batch.localeCompare(b.batch)),
    counts: { times: counts.length, fish: counts.reduce((s, c) => s + (Number.isFinite(c.total) ? c.total : 0), 0) },
    alerts: {
      total: alerts.length,
      critical: alerts.filter((a) => a.level === 'critica').length,
      pending: alerts.filter((a) => !a.attended).length,
    },
    pendingUpload: records.filter((r) => r.syncState !== 'synced').length,
  };
}

// ---------- El historial ----------

export interface HistoryEntry {
  id: string;
  at: string;
  kind: RecordType | 'alert';
  title: string;
  detail: string;
  /** Estanque, o lote y estanque. */
  place: string;
  tone: ReadingTone;
  pending: boolean;
}

const num = (value: number, decimals = 1) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: decimals }).format(value);

/** «1 entrega», «3 entregas»: el número con la palabra en singular o plural. */
export const plural = (count: number, one: string, many: string) => `${num(count, 0)} ${count === 1 ? one : many}`;

const ENTRY_TITLES: Record<RecordType | 'alert', string> = {
  water_reading: 'Agua',
  feeding: 'Alimento',
  mortality: 'Mortalidad',
  biometry: 'Biometría',
  fry_count: 'Conteo',
  alert: 'Alerta',
};

function place(record: FieldRecord, names: Names): string {
  if (record.type === 'water_reading') return names.ponds.get(record.pondId) ?? 'Estanque';
  const batch = names.batches.get(record.batchId);
  if (!batch) return 'Lote';
  const pond = names.ponds.get(batch.pondId);
  return pond ? `${batch.label} · ${pond}` : batch.label;
}

function detail(record: FieldRecord): string {
  switch (record.type) {
    case 'water_reading':
      return [
        record.tempC !== undefined && `${num(record.tempC)} °C`,
        record.ph !== undefined && `pH ${num(record.ph)}`,
        record.oxygenMgL !== undefined && `${num(record.oxygenMgL)} mg/L de oxígeno`,
      ]
        .filter(Boolean)
        .join(' · ');
    case 'feeding':
      return `${num(record.kg, 2)} kg`;
    case 'mortality':
      return `${num(record.quantity, 0)} peces${record.cause ? ` · ${record.cause}` : ''}`;
    case 'biometry':
      return `${num(record.avgWeightG)} g de peso promedio${record.sampleSize ? ` · muestra de ${num(record.sampleSize, 0)}` : ''}`;
    case 'fry_count':
      // Un dato viejo o mal formado no debe salir como "NaN alevinos"
      return `${Number.isFinite(record.total) ? `${num(record.total, 0)} alevinos` : 'sin total'}${record.source === 'contador' ? ' · contador' : ''}`;
  }
}

/** Todo lo que pasó, lo más nuevo primero. */
export function buildTimeline(records: FieldRecord[], alerts: AlertEntry[], names: Names): HistoryEntry[] {
  const fromRecords: HistoryEntry[] = records.map((r) => ({
    id: r.id,
    at: r.recordedAt,
    kind: r.type,
    title: ENTRY_TITLES[r.type],
    detail: detail(r),
    place: place(r, names),
    tone: r.type === 'water_reading' ? readingTone(r) : r.type === 'mortality' ? 'warn' : 'none',
    pending: r.syncState !== 'synced',
  }));
  const fromAlerts: HistoryEntry[] = alerts.map((a) => ({
    id: a.id,
    at: a.measuredAt,
    kind: 'alert',
    title: a.level === 'critica' ? 'Alerta crítica' : 'Alerta',
    detail: `${a.message}${a.attended ? ' · atendida' : ' · pendiente'}`,
    place: names.ponds.get(a.pondId) ?? 'Estanque',
    tone: a.level === 'critica' ? 'danger' : 'warn',
    pending: false,
  }));
  return [...fromRecords, ...fromAlerts].sort((a, b) => b.at.localeCompare(a.at));
}

const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const dayLabel = new Intl.DateTimeFormat('es-CO', { timeZone: ZONE, weekday: 'long', day: 'numeric', month: 'long' });
const timeLabel = new Intl.DateTimeFormat('es-CO', { timeZone: ZONE, hour: 'numeric', minute: '2-digit' });

export const formatTime = (iso: string) => timeLabel.format(new Date(iso));

/** Agrupa por día de Colombia, con "Hoy" y "Ayer" donde corresponde. */
export function groupByDay(entries: HistoryEntry[], now: Date): { day: string; entries: HistoryEntry[] }[] {
  const today = dayKey.format(now);
  const yesterday = dayKey.format(new Date(now.getTime() - DAY_MS));
  const groups: { key: string; day: string; entries: HistoryEntry[] }[] = [];
  for (const entry of entries) {
    const at = new Date(entry.at);
    const key = dayKey.format(at);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      const label = key === today ? 'Hoy' : key === yesterday ? 'Ayer' : dayLabel.format(at);
      group = { key, day: label.charAt(0).toUpperCase() + label.slice(1), entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  }
  return groups.map(({ day, entries }) => ({ day, entries }));
}

// ---------- Para sacar el reporte de la app ----------

const csvCell = (value: string) => (/[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
const fullDate = new Intl.DateTimeFormat('es-CO', { timeZone: ZONE, dateStyle: 'short', timeStyle: 'short' });

/**
 * El historial como CSV para Excel. Punto y coma y BOM porque así lo abre bien Excel en español
 * (con coma no separa las columnas y sin BOM daña las tildes).
 */
export function toCsv(entries: HistoryEntry[]): string {
  const rows = [['Fecha', 'Tipo', 'Lugar', 'Detalle', 'Estado']];
  for (const e of [...entries].sort((a, b) => a.at.localeCompare(b.at))) {
    rows.push([fullDate.format(new Date(e.at)), e.title, e.place, e.detail, e.pending ? 'Por subir' : 'En el servidor']);
  }
  return '﻿' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n') + '\r\n';
}

const range = (s: Stat, unit: string, decimals = 1) =>
  s.count === 0 ? 'sin lecturas' : `promedio ${num(s.avg!, decimals)}${unit} (de ${num(s.min!, decimals)} a ${num(s.max!, decimals)})`;

/** El resumen en texto plano, para mandarlo por WhatsApp o pegarlo donde sea. */
export function toShareText(report: Report, title: string): string {
  const lines = [`*${title}*`, ''];
  const w = report.water;
  lines.push(`💧 Agua: ${plural(w.readings, 'lectura', 'lecturas')}`);
  if (w.readings > 0) {
    lines.push(`   Temperatura ${range(w.temp, ' °C')}`);
    lines.push(`   pH ${range(w.ph, '')}`);
    if (w.oxygen.count > 0) lines.push(`   Oxígeno ${range(w.oxygen, ' mg/L')}`);
    lines.push(`   Fuera del óptimo: ${w.outOfOptimal}${w.critical ? ` (${w.critical} críticas)` : ''}`);
  }
  lines.push(`🍽️ Alimento: ${num(report.feeding.kg, 2)} kg en ${plural(report.feeding.times, 'entrega', 'entregas')}`);
  lines.push(`☠️ Mortalidad: ${num(report.mortality.fish, 0)} peces`);
  for (const [cause, fish] of report.mortality.byCause) lines.push(`   ${cause}: ${num(fish, 0)}`);
  for (const wgt of report.weights) lines.push(`⚖️ ${wgt.batch}: ${num(wgt.avgWeightG)} g de peso promedio`);
  if (report.counts.times > 0) lines.push(`🔢 Conteos: ${num(report.counts.fish, 0)} alevinos`);
  lines.push(`🔔 Alertas: ${report.alerts.total}${report.alerts.critical ? ` (${report.alerts.critical} críticas)` : ''}, ${report.alerts.pending} sin atender`);
  if (report.pendingUpload > 0) {
    const one = report.pendingUpload === 1;
    lines.push('', `⚠️ ${plural(report.pendingUpload, 'registro', 'registros')} todavía no ${one ? 'se ha' : 'se han'} subido al servidor.`);
  }
  return lines.join('\n');
}
