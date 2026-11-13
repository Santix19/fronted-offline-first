/**
 * The backend explains a refusal as "campo: motivo", written for whoever reads the logs (for example
 * "registrado_en: fecha anterior a 2024 (reloj sin configurar)"). The caretaker gets the same reason
 * in plain words and with what to do about it. Anything not recognised is shown as it came, without
 * the field name in front, which means nothing outside the backend (E6 in docs/rediseno/inventario.md).
 */
const KNOWN: [RegExp, string][] = [
  [/anterior a 2024|reloj sin configurar/i, 'La fecha es de antes de 2024: el reloj del celular estaba mal. Revisa la fecha y la hora del celular y vuelve a registrarlo.'],
  [/fecha en el futuro/i, 'La fecha quedó en el futuro: revisa la fecha y la hora del celular y vuelve a registrarlo.'],
  [/^ph:/i, 'El pH tiene que estar entre 0 y 14.'],
  [/^cantidad:/i, 'La cantidad tiene que ser 1 o más.'],
  [/^kg:/i, 'Los kilos tienen que ser más de 0.'],
  [/no trae temperatura, pH ni ox[ií]geno/i, 'La lectura no tiene ningún valor: anota al menos la temperatura, el pH o el oxígeno.'],
];

export function rejectionText(reason: string): string {
  const known = KNOWN.find(([pattern]) => pattern.test(reason));
  if (known) return known[1];
  const fieldReason = /^[a-z_]+:\s*(.+)$/.exec(reason.trim());
  if (!fieldReason) return reason;
  const text = fieldReason[1];
  return text.charAt(0).toUpperCase() + text.slice(1);
}
