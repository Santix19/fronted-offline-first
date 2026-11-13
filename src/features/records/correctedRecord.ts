import { parentIdOf, type FieldRecord } from './recordTypes';

/** Only a refused event can be corrected; keep its id so a retry remains idempotent. */
export function correctedRecord(draft: FieldRecord, rejected: FieldRecord): FieldRecord {
  if (rejected.syncState !== 'rejected' || draft.type !== rejected.type) throw new Error('Solo se corrigen registros rechazados del mismo tipo');
  if (parentIdOf(draft) !== parentIdOf(rejected)) throw new Error('El registro pertenece a otro estanque o lote');
  return { ...draft, id: rejected.id, syncState: 'pending', syncError: undefined };
}
