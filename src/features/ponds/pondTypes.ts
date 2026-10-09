import type { Syncable } from '../../shared/db/syncable';

export type PondType = 'estanque' | 'tanque' | 'jaula';

export const POND_TYPE_LABELS: Record<PondType, string> = {
  estanque: 'Estanque',
  tanque: 'Tanque',
  jaula: 'Jaula',
};

/** A tank, pond or cage. It can be edited on any phone: the newest updatedAt wins. */
export interface Pond extends Syncable {
  id: string;
  name: string;
  type: PondType;
  volumeM3?: number;
  active: boolean;
  /** ISO date of the last edit; the backend uses it to decide which edit wins */
  updatedAt: string;
}
