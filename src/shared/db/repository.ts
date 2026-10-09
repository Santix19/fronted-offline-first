import { committed, openDatabase, promisify, type StoreName } from './database';
import { notifyChange } from './changes';

/** Small generic CRUD over one store. Feature folders build their repositories on top of it. */
export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDatabase();
  return promisify(db.transaction(store).objectStore(store).getAll() as IDBRequest<T[]>);
}

export async function getOne<T>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await openDatabase();
  return promisify(db.transaction(store).objectStore(store).get(key) as IDBRequest<T | undefined>);
}

export async function putMany<T>(store: StoreName, values: T[]): Promise<void> {
  if (values.length === 0) return;
  const db = await openDatabase();
  const tx = db.transaction(store, 'readwrite');
  values.forEach((value) => tx.objectStore(store).put(value));
  await committed(tx);
  notifyChange(store);
}

export function putOne<T>(store: StoreName, value: T): Promise<void> {
  return putMany(store, [value]);
}

export async function removeMany(store: StoreName, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const db = await openDatabase();
  const tx = db.transaction(store, 'readwrite');
  keys.forEach((key) => tx.objectStore(store).delete(key));
  await committed(tx);
  notifyChange(store);
}

/** Key/value settings and sync state (cursor, last sync, device id...). */
export async function getMeta<T>(key: string): Promise<T | undefined> {
  const row = await getOne<{ key: string; value: T }>('meta', key);
  return row?.value;
}

export function setMeta<T>(key: string, value: T): Promise<void> {
  return putOne('meta', { key, value });
}
