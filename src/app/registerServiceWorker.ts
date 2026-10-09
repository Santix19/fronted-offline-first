/**
 * The service worker (public/sw.js) keeps a copy of the app on the phone,
 * so it opens even with no signal at all. Only in the production build: in development
 * a cached copy would hide the changes you are making.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Service worker not registered', error));
  });
}
