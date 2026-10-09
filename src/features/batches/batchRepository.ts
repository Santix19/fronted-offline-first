import { getAll, getOne, putOne } from '../../shared/db/repository';
import { toIsoWithOffset } from '../../shared/utils/dates';
import { newId } from '../../shared/utils/ids';
import type { Batch, BatchSummary } from './batchTypes';

export async function listBatches(pondId?: string): Promise<Batch[]> {
  const batches = await getAll<Batch>('batches');
  return batches
    .filter((b) => !pondId || b.pondId === pondId)
    .sort((a, b) => (a.status === b.status ? a.code.localeCompare(b.code, 'es') : a.status === 'activo' ? -1 : 1));
}

export function getBatch(id: string): Promise<Batch | undefined> {
  return getOne<Batch>('batches', id);
}

export type BatchInput = Pick<Batch, 'pondId' | 'code' | 'stockingDate' | 'initialQuantity' | 'initialWeightG' | 'status'>;

/** The backend requires the code to be unique inside each pond. */
export async function codeTaken(pondId: string, code: string, exceptId?: string): Promise<boolean> {
  const batches = await listBatches(pondId);
  const wanted = code.trim().toLowerCase();
  return batches.some((b) => b.id !== exceptId && b.code.trim().toLowerCase() === wanted);
}

export async function saveBatch(input: BatchInput, existing?: Batch): Promise<Batch> {
  const batch: Batch = {
    id: existing?.id ?? newId(),
    ...input,
    code: input.code.trim(),
    updatedAt: toIsoWithOffset(),
    syncState: 'pending',
  };
  await putOne('batches', batch);
  return batch;
}

export function getCachedSummary(batchId: string): Promise<BatchSummary | undefined> {
  return getOne<BatchSummary>('summaries', batchId);
}

export function cacheSummary(summary: BatchSummary): Promise<void> {
  return putOne('summaries', summary);
}
