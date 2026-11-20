import type { Batch } from '../batches/batchTypes';
import type { Pond } from '../ponds/pondTypes';
import type { RecordType } from './recordTypes';

/**
 * «Anotar datos»: llegar a cualquier formulario de registro desde el inicio, con o sin señal.
 *
 * Antes, para anotar la comida había que entrar al estanque, bajar hasta los lotes, crear uno si no
 * existía, entrar al lote y ahí tocar «Alimentación». Nada decía que la comida se anota por lote, así
 * que el cuidador veía que solo podía agregar estanques. Aquí se elige primero QUÉ se anota y después
 * DÓNDE, y si falta el estanque o el lote se dice y se ofrece crearlo.
 *
 * Todo sale de la base del celular (IndexedDB): funciona igual sin señal.
 */

export interface EntryKind {
  type: RecordType;
  title: string;
  /** Lo que se anota, dicho como lo dice el cuidador. */
  detail: string;
}

/** En el orden en que se usan en un día de trabajo. */
export const ENTRY_KINDS: EntryKind[] = [
  { type: 'water_reading', title: 'Agua', detail: 'Temperatura, pH y oxígeno' },
  { type: 'feeding', title: 'Alimento', detail: 'Kilos de comida entregados' },
  { type: 'mortality', title: 'Mortalidad', detail: 'Peces muertos y la causa' },
  { type: 'biometry', title: 'Biometría', detail: 'Peso promedio de una muestra' },
  { type: 'fry_count', title: 'Conteo', detail: 'Alevinos contados a mano' },
];

export const isEntryType = (value: string): value is RecordType => ENTRY_KINDS.some((k) => k.type === value);

/** Dónde se puede anotar: un estanque (el agua) o un lote (todo lo demás). */
export interface EntryTarget {
  id: string;
  label: string;
  sub?: string;
  href: string;
}

export type EntryPlan =
  /** Hay un solo lugar posible: se va directo al formulario. */
  | { kind: 'direct'; href: string }
  /** Hay varios: el cuidador elige. */
  | { kind: 'choose'; targets: EntryTarget[] }
  /** No hay estanques: hay que crear uno primero. */
  | { kind: 'needs_pond' }
  /** Hay estanques pero ningún lote activo: hay que crear el lote (en cuál estanque, lo elige). */
  | { kind: 'needs_batch'; ponds: EntryTarget[] };

const formHref = (type: RecordType, param: 'estanque' | 'lote', id: string) => `#/registrar/${type}?${param}=${id}`;

/** Qué hacer cuando el cuidador toca uno de los tipos de dato. */
export function planEntry(type: RecordType, ponds: Pond[], batches: Batch[]): EntryPlan {
  const activePonds = ponds.filter((p) => p.active);
  if (activePonds.length === 0) return { kind: 'needs_pond' };

  if (type === 'water_reading') {
    const targets = activePonds.map((p) => ({ id: p.id, label: p.name, href: formHref(type, 'estanque', p.id) }));
    return targets.length === 1 ? { kind: 'direct', href: targets[0].href } : { kind: 'choose', targets };
  }

  const pondName = new Map(activePonds.map((p) => [p.id, p.name]));
  const targets = batches
    .filter((b) => b.status === 'activo' && pondName.has(b.pondId))
    .map((b) => ({ id: b.id, label: `Lote ${b.code}`, sub: pondName.get(b.pondId), href: formHref(type, 'lote', b.id) }));

  if (targets.length === 0) {
    return {
      kind: 'needs_batch',
      ponds: activePonds.map((p) => ({ id: p.id, label: p.name, href: `#/lotes/nuevo?estanque=${p.id}` })),
    };
  }
  return targets.length === 1 ? { kind: 'direct', href: targets[0].href } : { kind: 'choose', targets };
}
