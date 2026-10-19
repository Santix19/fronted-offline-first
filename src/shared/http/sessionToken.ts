/**
 * The token of the open session, in memory only.
 *
 * It lives here and not in the auth folder so the http client can read it without depending on a
 * feature: the same rule that keeps shared/ free of features/. On disk the token is encrypted with
 * the PIN; this copy exists while the app is unlocked and dies when the tab closes.
 */
let token: string | undefined;

export function setSessionToken(value: string | undefined): void {
  token = value;
}

export function getSessionToken(): string | undefined {
  return token;
}
