
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
