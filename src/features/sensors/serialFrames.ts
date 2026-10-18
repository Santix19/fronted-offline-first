import { toIsoWithOffset } from '../../shared/utils/dates';
import { parseOptionalNumber } from '../../shared/utils/numbers';
import type { SensorEvent } from './sensorTypes';

/**
 * Wire protocol of the sketch: one frame per line, fields separated by ";", "-" where the board
 * did not measure anything.
 *
 *   CNT;<seq>;<fish since the previous frame>;<how many of those were ambiguous>
 *   AGUA;<seq>;<temperature C>;<pH>;<oxygen mg/L>
 *
 * Plain text on purpose: it can be read in the Arduino IDE's serial monitor while the counter is
 * being calibrated at the pond, which is where most of the work actually happens.
 *
 * The frame carries no date: the board has no clock. The phone stamps the time it arrived, which
 * is what the caretaker saw.
 */
export interface FrameDialect {
  /** false = the board cannot tell simultaneous fish apart, so its cuts field is not a measurement */
  countsMultipleCuts: boolean;
}

const ABSENT = '-';

/** undefined = not measured; null = there is something there but it is not a number (noisy cable). */
function field(text: string | undefined): number | undefined | null {
  const clean = (text ?? '').trim();
  if (clean === '' || clean === ABSENT) return undefined;
  const value = parseOptionalNumber(clean);
  return value === undefined || Number.isNaN(value) ? null : value;
}

const problem = (message: string, frame: string): SensorEvent => ({ type: 'problem', message, frame });

/**
 * One line of the serial port -> one domain event. Pure function, so the protocol can be tested
 * without a board plugged in. Returns null for lines that are not data (boot banner, comments).
 */
export function parseFrame(line: string, dialect: FrameDialect, at = toIsoWithOffset()): SensorEvent | null {
  const text = line.trim();
  if (text === '' || text.startsWith('#')) return null;

  const [tag, ...fields] = text.split(';');
  const seq = field(fields[0]);
  if (seq === null || seq === undefined || !Number.isInteger(seq) || seq < 0) {
    return problem('la trama llegó sin número de secuencia', text);
  }

  switch (tag) {
    case 'CNT': {
      const count = field(fields[1]);
      if (count === null || count === undefined || !Number.isInteger(count) || count < 0) {
        return problem('el conteo de la trama no es un número entero', text);
      }
      const cuts = field(fields[2]);
      if (cuts === null || (cuts !== undefined && (!Number.isInteger(cuts) || cuts < 0))) {
        return problem('los cortes múltiples de la trama no son un número entero', text);
      }
      // A board that cannot measure cuts reports zero instead of a value we would be inventing
      const multipleCuts = dialect.countsMultipleCuts ? (cuts ?? 0) : 0;
      return { type: 'sample', sample: { kind: 'fry_pulse', seq, count, multipleCuts, at } };
    }
    case 'AGUA': {
      const [tempC, ph, oxygenMgL] = [field(fields[1]), field(fields[2]), field(fields[3])];
      if (tempC === null || ph === null || oxygenMgL === null) {
        return problem('la trama trae un número que no se puede leer', text);
      }
      if (tempC === undefined && ph === undefined && oxygenMgL === undefined) {
        return problem('la lectura no trae temperatura, pH ni oxígeno', text);
      }
      return { type: 'sample', sample: { kind: 'water', seq, tempC, ph, oxygenMgL, at } };
    }
    default:
      return problem(`no se reconoce la trama "${tag}"`, text);
  }
}
