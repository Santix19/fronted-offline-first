import { useEffect, useState, type ReactNode } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useAuthState } from './authStatus';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { UnlockPage } from './UnlockPage';

/**
 * What the caretaker sees before the app: nothing while it is working out who is there, the PIN
 * when there is a session on this phone, and signing in or registering when there is not.
 *
 * The rest of the app only ever renders with someone signed in, so no screen below has to wonder.
 */
