import { deviceDateError } from '../utils/dates';

/** The timestamp is generated on this phone, including when a count is closed. */
export function ClockNotice() {
  const problem = deviceDateError(new Date());
  return problem ? <p className="notice danger" role="alert">{problem}. Activa la fecha y hora automáticas en los ajustes del celular antes de guardar.</p> : null;
}
