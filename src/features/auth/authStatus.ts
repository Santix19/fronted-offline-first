import { useSyncExternalStore } from 'react';
import type { AuthState } from './authTypes';

/**
 * Who is using the app right now. Kept in memory and published to the screens, the same shape the
 * sync indicator uses, so the app shell can decide what to draw without asking the database on
 * every render.
 */
let state: AuthState = { status: 'loading' };
const listeners = new Set<() => void>();

export function getAuthState(): AuthState {
  return state;
}

export function setAuthState(next: AuthState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuthState(): AuthState {
  return useSyncExternalStore(subscribe, getAuthState);
}
