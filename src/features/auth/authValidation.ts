/**
 * The same limits the backend DTOs check. Catching them here saves the caretaker a round trip,
 * which matters when the signal is one bar and the server takes a minute to wake up.
 */
export type AuthErrors = Record<string, string>;

export const PIN_LENGTH = 4;

const DOCUMENT = /^\d{5,20}$/;
const PIN = /^\d{4}$/;

export function documentError(document: string): string | undefined {
  if (!document.trim()) return 'Escribe tu número de documento';
  return DOCUMENT.test(document.trim()) ? undefined : 'Debe ser un número de 5 a 20 dígitos';
}

export function passwordError(password: string): string | undefined {
  if (!password) return 'Escribe tu clave';
  return password.length >= 8 ? undefined : 'La clave debe tener al menos 8 caracteres';
}

export function nameError(name: string): string | undefined {
  if (!name.trim()) return 'Escribe tu nombre';
  return name.trim().length <= 120 ? undefined : 'El nombre no puede pasar de 120 caracteres';
}

export function pinError(pin: string): string | undefined {
  if (!pin) return 'Elige un PIN de 4 dígitos';
  return PIN.test(pin) ? undefined : 'El PIN debe ser de 4 dígitos';
}

/** Drops the fields that came back fine, so an empty object means everything is valid. */
export const onlyErrors = (found: Record<string, string | undefined>): AuthErrors =>
  Object.fromEntries(Object.entries(found).filter(([, message]) => message)) as AuthErrors;
