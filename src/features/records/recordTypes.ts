import type { Syncable } from '../../shared/db/syncable';

/** Where the data came from. The backend accepts exactly these values. */
export type RecordSource = 'sensor' | 'contador' | 'voz' | 'manual';

interface RecordBase extends Syncable {
  /** Created on the phone: sending it twice never duplicates it in the backend */
  id: string;
  recordedAt: string;
  source: RecordSource;
}

export interface WaterReading extends RecordBase {
  type: 'water_reading';
  pondId: string;
  tempC?: number;
  ph?: number;
  oxygenMgL?: number;
}

export interface FryCount extends RecordBase {
  type: 'fry_count';
  batchId: string;
  total: number;
  multipleCuts?: number;
}

export interface Mortality extends RecordBase {
  type: 'mortality';
  batchId: string;
  quantity: number;
  cause?: string;
}

export interface Feeding extends RecordBase {
  type: 'feeding';
  batchId: string;
  kg: number;
}

export interface Biometry extends RecordBase {
  type: 'biometry';
  batchId: string;
  avgWeightG: number;
  sampleSize?: number;
}

/** Field records are events: they are never edited, only created (and discarded if rejected). */
export type FieldRecord = WaterReading | FryCount | Mortality | Feeding | Biometry;
export type RecordType = FieldRecord['type'];

export const RECORD_LABELS: Record<RecordType, string> = {
  water_reading: 'Lectura de agua',
  fry_count: 'Conteo de alevinos',
  mortality: 'Mortalidad',
  feeding: 'Alimentación',
  biometry: 'Biometría',
};

/** Only water readings belong to a pond; everything else belongs to a batch. */
export const parentIdOf = (r: FieldRecord): string => (r.type === 'water_reading' ? r.pondId : r.batchId);
