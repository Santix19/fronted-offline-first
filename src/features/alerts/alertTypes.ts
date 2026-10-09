export type AlertLevel = 'advertencia' | 'critica';

/**
 * Created by the backend's expert system when a water reading leaves the optimal range.
 * The phone only receives them (pull) and marks them as attended.
 */
export interface Alert {
  id: string;
  pondId: string;
  variable: string;
  value?: number;
  level: AlertLevel;
  message: string;
  measuredAt: string;
  /** Attended on the phone, waiting for signal to tell the backend */
  attendPending?: boolean;
}

/** Queued action for something that is not an event (today only "attend alert"). */
export interface PendingAction {
  id: string;
  kind: 'attend_alert';
  alertId: string;
  createdAt: string;
}
