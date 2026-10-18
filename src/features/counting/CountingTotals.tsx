import { formatNumber, timeAgo } from '../../shared/utils/format';
import type { SensorDescriptor } from '../sensors/sensorTypes';
import type { CountingTally } from './countingTypes';

interface CountingTotalsProps {
  totals?: CountingTally;
  sensor?: SensorDescriptor;
  warning: string | null;
  problem?: string;
}

/** The running total, big enough to read standing over the channel with the sun on the screen. */
