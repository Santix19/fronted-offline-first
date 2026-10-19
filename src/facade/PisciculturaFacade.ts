import { requestPersistentStorage } from '../shared/db/database';
import { getApiConfig, saveApiConfig, type ApiConfig } from '../shared/http/apiConfig';
import type { Credentials } from '../features/auth/authApi';
import { restoreSession, signIn, signOut, signUp, unlock } from '../features/auth/authService';
import { attendAlert, listAlerts } from '../features/alerts/alertRepository';
import { cacheSummary, codeTaken, getBatch, getCachedSummary, listBatches, saveBatch, type BatchInput } from '../features/batches/batchRepository';
import type { Batch, BatchSummary } from '../features/batches/batchTypes';
import { fetchBatchSummary } from '../features/batches/batchesApi';
import { CountingSession, resumeTally } from '../features/counting/CountingSession';
import { IndexedDbCountStore } from '../features/counting/IndexedDbCountStore';
import { SupervisedCountingSession } from '../features/counting/SupervisedCountingSession';
import { deactivatePond, getPond, listPonds, nameTaken, savePond, type PondInput } from '../features/ponds/pondRepository';
import type { Pond } from '../features/ponds/pondTypes';
import { discardRecord, latestReadingsByPond, listRecords, saveRecord } from '../features/records/recordRepository';
import type { FieldRecord } from '../features/records/recordTypes';
import { availableSensors, sensorFactoryFor, type SensorOptions } from '../features/sensors/SensorFactory';
import type { SensorKind } from '../features/sensors/sensorTypes';
import { resetPullCursor } from '../features/sync/pullStep';
import { hasPendingWork } from '../features/sync/pushStep';
import { checkHealth } from '../features/sync/syncApi';
import { runSync } from '../features/sync/syncEngine';
import { countPending, listRejected } from './facadeQueries';

/**
 * The one door into the system.
 *
 * Behind it live four subsystems the screens used to call straight: the phone's local database, the
 * sync engine, the field records, and the sensor and counting machinery. A screen that wants the
 * batches should not have to know that the catalog is in IndexedDB, that the upload happens in four
 * ordered steps, or that a count can be resumed.
 *
 * The rule, easy to check with a grep: screens import this facade and nothing else from the data
 * layer. The facade imports the data layer and never a screen.
 *
 * It lives in its own folder because shared/ must stay free of any dependency on features/, and its
 * methods are bound arrow properties so a screen can pass one straight to useLiveQuery.
 */
export class PisciculturaFacade {
  // ---------- Who is using the app ----------
  /** Decides at start-up whether to ask for the PIN, for a sign-in, or go straight in. */
  readonly restoreSession = (): Promise<void> => restoreSession();
  readonly signIn = (credentials: Credentials, pin: string): Promise<void> => signIn(credentials, pin);
  readonly signUp = (credentials: Required<Credentials>, pin: string): Promise<void> => signUp(credentials, pin);
  /** Opens the saved session with the PIN. Works with no signal. */
  readonly unlock = (pin: string): Promise<boolean> => unlock(pin);
  readonly signOut = (): Promise<void> => signOut();

  // ---------- Ponds and batches (the catalog that is edited offline) ----------
  readonly ponds = (): Promise<Pond[]> => listPonds();
  readonly pond = (id: string): Promise<Pond | undefined> => getPond(id);
  readonly savePond = (input: PondInput, existing?: Pond): Promise<Pond> => savePond(input, existing);
  readonly deactivatePond = (pond: Pond): Promise<void> => deactivatePond(pond);
  readonly pondNameTaken = (name: string, exceptId?: string): Promise<boolean> => nameTaken(name, exceptId);

  readonly batches = (pondId?: string): Promise<Batch[]> => listBatches(pondId);
  readonly batch = (id: string): Promise<Batch | undefined> => getBatch(id);
  readonly saveBatch = (input: BatchInput, existing?: Batch): Promise<Batch> => saveBatch(input, existing);
  readonly batchCodeTaken = (pondId: string, code: string, exceptId?: string): Promise<boolean> =>
    codeTaken(pondId, code, exceptId);

  /** The expert system's summary: the saved one shows at once, a fresh one needs signal. */
  readonly cachedSummary = (batchId: string): Promise<BatchSummary | undefined> => getCachedSummary(batchId);
  readonly refreshSummary = async (batchId: string): Promise<BatchSummary> => {
    const fresh = await fetchBatchSummary(batchId);
    await cacheSummary(fresh);
    return fresh;
  };

  // ---------- Field records and alerts ----------
  readonly records = (parentId?: string, limit?: number): Promise<FieldRecord[]> => listRecords(parentId, limit);
  readonly latestReadings = () => latestReadingsByPond();
  readonly saveRecord = (record: FieldRecord): Promise<void> => saveRecord(record);
  readonly discardRecord = (id: string): Promise<void> => discardRecord(id);
  readonly alerts = (pondId?: string) => listAlerts(pondId);
  readonly attendAlert = (id: string): Promise<void> => attendAlert(id);

  // ---------- Synchronization and settings ----------
  readonly sync = (): Promise<void> => runSync();
  readonly hasPendingWork = (): Promise<boolean> => hasPendingWork();
  readonly pendingCounts = () => countPending();
  readonly rejected = () => listRejected();
  readonly checkServer = () => checkHealth();
  /** Forces the next pull to download everything again (used after changing server). */
  readonly resetPullCursor = (): Promise<void> => resetPullCursor();
  readonly config = (): Promise<ApiConfig> => getApiConfig();
  readonly saveConfig = (config: ApiConfig): Promise<void> => saveApiConfig(config);
  readonly keepStorage = (): Promise<boolean> => requestPersistentStorage();

  // ---------- Sensors and counting ----------
  /** Sources this phone can really open (without Web Serial, only the simulator). */
  readonly sensors = () => availableSensors();
  /** Factory Method + decorators: the caller gets a source and never a concrete class. */
  readonly openSensor = (kind: SensorKind, options?: SensorOptions) => sensorFactoryFor(kind).create(options);

  /**
   * Opens (or resumes) the count of a batch. The return type is the abstraction, not the refined
   * one: callers must not depend on which checks are on or on which engine stores the tally.
   */
  readonly openCount = async (batchId: string): Promise<CountingSession> => {
    const store = new IndexedDbCountStore();
    const [tally, batch] = await Promise.all([resumeTally(store, batchId), getBatch(batchId)]);
    return new SupervisedCountingSession(store, tally, batch?.initialQuantity);
  };
}

/** One instance for the whole app: the subsystems behind it already hold their own state. */
export const facade = new PisciculturaFacade();
