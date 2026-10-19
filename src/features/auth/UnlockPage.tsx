import { useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { AuthScreen } from './AuthScreen';
import { MAX_UNLOCK_TRIES, type User } from './authTypes';
import { PinField } from './PinField';

interface UnlockPageProps {
  user: User;

  failedUnlocks: number;

}

/**
 * The everyday screen: the caretaker opens the app at the pond and types the PIN. Nothing here
 * talks to the backend, so it works exactly the same with no signal at all.
 */
}

