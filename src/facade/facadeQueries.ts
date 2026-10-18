import { getAll } from '../shared/db/repository';
import type { Syncable } from '../shared/db/syncable';
import type { Batch } from '../features/batches/batchTypes';
import type { Pond } from '../features/ponds/pondTypes';
import type { FieldRecord } from '../features/records/recordTypes';

/**
 * The two queries of the facade that read several stores at once. They live here so the facade
 * itself stays a list of one-line delegations and nothing else.
 */

const everything = () =>
  Promise.all([getAll<Pond>('ponds'), getAll<Batch>('batches'), getAll<FieldRecord>('records')]);
