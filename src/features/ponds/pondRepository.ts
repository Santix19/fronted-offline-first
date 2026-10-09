import { getAll, getOne, putOne } from '../../shared/db/repository';
import { toIsoWithOffset } from '../../shared/utils/dates';
import { newId } from '../../shared/utils/ids';
import type { Pond } from './pondTypes';

/** Ponds saved on the phone. Sync reads the pending ones and writes the ones that come from the backend. */
export async function listPonds(): Promise<Pond[]> {
  const ponds = await getAll<Pond>('ponds');
  return ponds.filter((p) => p.active).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function getPond(id: string): Promise<Pond | undefined> {
  return getOne<Pond>('ponds', id);
}

export type PondInput = Pick<Pond, 'name' | 'type' | 'volumeM3'>;

export async function nameTaken(name: string, exceptId?: string): Promise<boolean> {
  const ponds = await getAll<Pond>('ponds');
  const wanted = name.trim().toLowerCase();
  return ponds.some((p) => p.id !== exceptId && p.name.trim().toLowerCase() === wanted);
}

/** Creates or edits a pond on the phone; it goes to the backend on the next sync. */
export async function savePond(input: PondInput, existing?: Pond): Promise<Pond> {
  const pond: Pond = {
    id: existing?.id ?? newId(),
    active: existing?.active ?? true,
    ...input,
    name: input.name.trim(),
    updatedAt: toIsoWithOffset(),
    syncState: 'pending',
  };
  await putOne('ponds', pond);
  return pond;
}

/** Ponds are never deleted (their history matters): they are marked inactive. */
export async function deactivatePond(pond: Pond): Promise<void> {
  await putOne<Pond>('ponds', { ...pond, active: false, updatedAt: toIsoWithOffset(), syncState: 'pending' });
}
