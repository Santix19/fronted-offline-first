import { useSyncExternalStore } from 'react';

/**
 * Minimal hash router (#/estanques/123). Hash URLs work from the offline cache without
 * any server configuration, which is why we do not need a routing library.
 */
function currentPath(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath);
}

export function navigate(path: string, options: { replace?: boolean } = {}): void {
  if (options.replace) window.location.replace(`#${path}`);
  else window.location.hash = path;
}

export function goBack(fallback = '/'): void {
  if (window.history.length > 1) window.history.back();
  else navigate(fallback, { replace: true });
}

/** matchPath('/lotes/:id', '/lotes/42') -> { id: '42' }; null if it does not match. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const [pathname, search = ''] = path.split('?');
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = Object.fromEntries(new URLSearchParams(search));
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    else if (patternParts[i] !== pathParts[i]) return null;
  }
  return params;
}
