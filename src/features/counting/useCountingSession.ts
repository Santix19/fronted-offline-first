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
  /** Fish the board has seen in the batch it has not closed yet: the live part of the total */
  const [live, setLive] = useState(0);
  /** Kept after disconnecting too: the closed record has to say what measured it */
  const [sensor, setSensor] = useState<SensorDescriptor>();
  const [connected, setConnected] = useState(false);
  const log = useSyncExternalStore(subscribeSensorLog, getSensorLog);

  const reopen = useCallback(async () => {
    const opened = await facade.openCount(batchId);
    session.current = opened;
    setTotals(opened.totals);
    setWarning(null);
  }, [batchId]);

  useEffect(() => {
    void reopen();
    // Leaving the screen must release the port, or the next connection finds it busy
    return () => void source.current?.close();
  }, [reopen]);

  const connect = useCallback(async (kind: SensorKind) => {
    if (source.current) return;
    setProblem(undefined);
    const opened = facade.openSensor(kind);
    try {
      await opened.open();
    } catch (error) {
      setProblem(error instanceof Error ? error.message : 'No se pudo abrir el contador');
      return;
    }
    opened.subscribe((event) => {
      if (event.type === 'problem') {
        setProblem(event.message);
        return;
      }
      if (event.type === 'echo') {
        setLive(event.running);
        return;
      }
      // The closing frame carries these same fish: they move from "live" into the saved total
      setLive(0);
      void session.current?.register(event.sample).then((feedback) => {
        setTotals(feedback.totals);
        setWarning(feedback.warning);
      });
    });
    source.current = opened;
    setSensor(opened.descriptor);
    setConnected(true);
  }, []);

  const disconnect = useCallback(async () => {
    await source.current?.close();
    source.current = undefined;
    setConnected(false);
    setLive(0);
  }, []);

  const correct = useCallback(async (total: number) => {
    const feedback = await session.current?.correct(total);
    if (!feedback) return;
    setTotals(feedback.totals);
    setWarning(feedback.warning);
  }, []);

  /** Closes the count: it becomes a pending record and the screen is left ready for another run. */
  const finish = useCallback(async () => {
    await disconnect();
    await session.current?.finish(sensor?.recordSource ?? 'manual', sensor?.countsMultipleCuts ?? false);
    setSensor(undefined);
    await reopen();
  }, [disconnect, reopen, sensor]);

  const cancel = useCallback(async () => {
    await disconnect();
    await session.current?.cancel();
    setSensor(undefined);
    await reopen();
  }, [disconnect, reopen]);

  return { totals, live, warning, problem, sensor, connected, log, connect, disconnect, correct, finish, cancel };
}
