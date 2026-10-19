import { getApiConfig } from '../../shared/http/apiConfig';
import { loginOnServer, logoutOnServer, registerOnServer, type Credentials } from './authApi';
import { forgetSession, hasExpired, loadSession, saveSession, unlockSession } from './authRepository';
import { setAuthState } from './authStatus';
import { MAX_UNLOCK_TRIES } from './authTypes';

/**
 * The whole story of who is signed in: opening a session against the backend, keeping it on the
 * phone under a PIN, and unlocking it later with or without signal. The facade is the only caller.
 */

/** Runs when the app starts: decides whether to show the PIN, the sign-in, or go straight in. */
