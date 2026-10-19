import { useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { useAuthState } from './authStatus';

/**
 * Who is signed in on this phone, and the way out. Signing out warns first when something is
 * still waiting for signal: those rows stay on the phone, but nobody can upload them until
 * someone signs in again, and that is worth saying out loud before it happens.
 */
export function AccountPanel() {
  const auth = useAuthState();

  const counts = useLiveQuery(() => facade.pendingCounts(), ['ponds', 'batches', 'records', 'actions']);

  const [confirming, setConfirming] = useState(false);
}

