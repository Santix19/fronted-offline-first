import { toIsoWithOffset } from '../../shared/utils/dates';
import type { RecordSource } from '../records/recordTypes';
import type { SensorSample } from '../sensors/sensorTypes';
import type { CountStore, CountingFeedback, CountingTally } from './countingTypes';

/** Reads the count a batch had in progress, or starts a new one. */
