import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { getSensorLog, subscribeSensorLog } from '../sensors/sensorLog';
import type { SensorDescriptor, SensorKind, SensorSource } from '../sensors/sensorTypes';
import type { CountingSession } from './CountingSession';
import type { CountingTally } from './countingTypes';

/**
 * Wires the counting screen to the facade: resumes the batch's count when the screen opens, feeds
 * every frame of the chosen source into the session, and closes the port when the screen is left.
 */
export function useCountingSession(batchId: string) {
  const session = useRef<CountingSession | undefined>(undefined);

  const source = useRef<SensorSource | undefined>(undefined);

  const [totals, setTotals] = useState<CountingTally>();

  const [warning, setWarning] = useState<string | null>(null);

  const [problem, setProblem] = useState<string>();

  /** Kept after disconnecting too: the closed record has to say what measured it */

  const [sensor, setSensor] = useState<SensorDescriptor>();

  const [connected, setConnected] = useState(false);
}

