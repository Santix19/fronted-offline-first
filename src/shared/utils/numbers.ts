/**
 * Reads what the caretaker typed. Accepts a comma as decimal separator ("7,2"), common in Colombia.
 * Empty -> undefined; not a number -> NaN, so the form can show an error.
 */
export function parseOptionalNumber(text: string): number | undefined {
  const clean = text.trim().replace(',', '.');
  if (clean === '') return undefined;
  return /^-?\d+(\.\d+)?$/.test(clean) ? Number(clean) : NaN;
}
