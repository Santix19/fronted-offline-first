import { useEffect, useState } from 'react';
import type { StoreName } from './database';
import { subscribe } from './changes';

/**
 * Runs a query against the local database and runs it again whenever one of the given stores changes.
 * Returns undefined while the first result is loading.
 */
export function useLiveQuery<T>(query: () => Promise<T>, stores: StoreName[], deps: unknown[] = []): T | undefined {
  const [result, setResult] = useState<T>();

  useEffect(() => {
    let active = true;
    const run = () => query().then((value) => active && setResult(value));
    run();
    const unsubscribe = subscribe((store) => stores.includes(store) && run());
    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return result;
}
