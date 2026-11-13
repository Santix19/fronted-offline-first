import { parseOptionalNumber } from '../../shared/utils/numbers';
import { toneOf, type WaterVariable } from '../ponds/waterRanges';

const WATER: readonly string[] = ['tempC', 'ph', 'oxygenMgL'];

/**
 * What to tell the caretaker while a water value is still on the screen: out of range is not a
 * typing mistake to block, it is news. The alert itself is still created by the backend on sync.
 */
export function readingWarning(key: string, typed: string): string | undefined {
  if (!WATER.includes(key)) return undefined;
  const value = parseOptionalNumber(typed);
  if (value === undefined || Number.isNaN(value)) return undefined;
  const tone = toneOf(key as WaterVariable, value);
  if (tone === 'danger') return 'Está en nivel crítico. Al sincronizar se crea una alerta.';
  if (tone === 'warn') return 'Está fuera de lo ideal. Al sincronizar se crea una alerta.';
  return undefined;
}
