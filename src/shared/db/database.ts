/**
 * Local database of the phone (IndexedDB). Everything the caretaker sees and records lives here first,
 * so the app works the same with or without signal. Sync only copies it to and from the backend.
 */
export type StoreName = 'ponds' | 'batches' | 'records' | 'alerts' | 'actions' | 'summaries' | 'meta';

const DB_NAME = 'lacocha';
const DB_VERSION = 1;

/** Store -> primary key. Each feature folder decides what it saves in its store. */
const STORES: Record<StoreName, string> = {
  ponds: 'id',
  batches: 'id',
  records: 'id',
  alerts: 'id',
  actions: 'id',
  summaries: 'batchId',
  meta: 'key',
};

let connection: Promise<IDBDatabase> | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  connection ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const [name, keyPath] of Object.entries(STORES)) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return connection;
}

/** Turns an IndexedDB request into a Promise. */
export function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Resolves when the transaction is committed (not just when the request succeeds). */
export function committed(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Asks the browser not to delete our data when space runs low (important on iPhone). */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  return (await navigator.storage.persisted()) || navigator.storage.persist();
}
