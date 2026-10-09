import { useEffect } from 'react';
import { subscribe } from '../../shared/db/changes';
import { hasPendingWork } from './pushStep';
import { runSync } from './syncEngine';

const EVERY_MS = 2 * 60 * 1000;
const AFTER_CHANGE_MS = 3000;

/**
 * When to sync without the caretaker pressing anything:
 * on opening the app, when the signal comes back, when the app returns to the screen,
 * a few seconds after a new record, and every 2 minutes while there is signal.
 */
export function useAutoSync(): void {
  useEffect(() => {
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const soon = () => {
      clearTimeout(debounce);
      debounce = setTimeout(runSync, AFTER_CHANGE_MS);
    };
    const onVisible = () => document.visibilityState === 'visible' && runSync();

    runSync();
    window.addEventListener('online', runSync);
    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(runSync, EVERY_MS);
    // Sync itself writes to these stores too, so only react when something is really pending
    const unsubscribe = subscribe((store) => {
      if (store !== 'meta' && store !== 'alerts' && store !== 'summaries') void hasPendingWork().then((yes) => yes && soon());
    });

    return () => {
      clearTimeout(debounce);
      clearInterval(interval);
      unsubscribe();
      window.removeEventListener('online', runSync);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
