/**
 * The phone creates the id of every record (UUID v4). That is what makes the push idempotent:
 * if the same record is sent twice, the backend recognises it and answers "duplicados".
 */
export function newId(): string {
  // randomUUID only exists on https or localhost; on a LAN address (http://192.168...) we build it by hand
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** The backend only accepts letters, digits, dot, dash and underscore in dispositivo_id. */
export function newDeviceId(): string {
  return `cel-${newId().slice(0, 8)}`;
}

export const DEVICE_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;
