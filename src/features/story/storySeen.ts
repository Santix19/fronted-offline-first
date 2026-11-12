import { useSyncExternalStore } from 'react';
import { getMeta, setMeta } from '../../shared/db/repository';

const KEY = 'storySeen';

/** undefined until the phone's database has answered, so nothing flashes before we know. */
let seen: boolean | undefined;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** Has this phone already watched the story? Asked once, at start. */
export async function loadStorySeen(): Promise<void> {
  seen = (await getMeta<boolean>(KEY)) ?? false;
  notify();
}

/** Called when the caretaker finishes or skips the story: it opens once, not every time. */
export async function markStorySeen(): Promise<void> {
  seen = true;
  notify();
  await setMeta(KEY, true);
}

export function useStorySeen(): boolean | undefined {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => seen,
  );
}
