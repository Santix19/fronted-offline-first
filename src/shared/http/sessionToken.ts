/**
 * The token of the open session, in memory only.
 *
 * It lives here and not in the auth folder so the http client can read it without depending on a
 * feature: the same rule that keeps shared/ free of features/. On disk the token is encrypted with
 * the PIN; this copy exists while the app is unlocked and dies when the tab closes.
 */
let token: string | undefined;
let onRejected: (() => void) | undefined;

export function setSessionToken(value: string | undefined): void {
  token = value;
}

export function getSessionToken(): string | undefined {
  return token;
}

/**
 * What to do when the backend refuses the token we are carrying: the session expired, or it was
 * closed from another phone. Registered by the auth feature, called by the http client, so neither
 * one has to know about the other.
 */
export function onSessionRejected(listener: () => void): void {
  onRejected = listener;
}

export function sessionWasRejected(): void {
  if (token) {
    token = undefined;
    onRejected?.();
  }
}
