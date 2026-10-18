import { useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Field } from '../../shared/ui/Field';
import { Page } from '../../shared/ui/Page';
import { parseOptionalNumber } from '../../shared/utils/numbers';
import { SavedNotice } from '../records/SavedNotice';
import { clearSensorLog } from '../sensors/sensorLog';
import { CountingTotals } from './CountingTotals';
import { FrameLog } from './FrameLog';
import { useCountingSession } from './useCountingSession';

/**
 * Counting a batch with the counter plugged into the phone. The total is saved on every frame, so
 * the screen can be left (or the battery can die) without losing the fish already counted: coming
 * back resumes the same count.
 */
export function CountingPage({ batchId }: { batchId: string }) {
  const batch = useLiveQuery(() => facade.batch(batchId), ['batches'], [batchId]);

  const count = useCountingSession(batchId);

  const [typed, setTyped] = useState('');

  const [saved, setSaved] = useState(0);
}

