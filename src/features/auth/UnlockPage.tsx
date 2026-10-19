import { useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { AuthScreen } from './AuthScreen';
import { MAX_UNLOCK_TRIES, type User } from './authTypes';
import { PinField } from './PinField';

interface UnlockPageProps {
  user: User;

  failedUnlocks: number;
}

