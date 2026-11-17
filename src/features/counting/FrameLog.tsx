import type { SensorLogEntry } from '../sensors/sensorLog';

/**
 * What the board sent, newest first. It is a diagnosis aid for calibrating the counter at the pond,
 * where there is no laptop with the serial monitor; unreadable frames show instead of being hidden.
 */
export function FrameLog({ log }: { log: SensorLogEntry[] }) {
  return (
    <section className="section">
      <h2>Tramas del contador</h2>
      {log.length === 0 && <p className="muted">Todavía no llega nada del contador.</p>}
      {log.length > 0 && (
        <ul className="frame-log">
          {log.map((entry, index) => (
            <li key={`${entry.at}-${index}`} data-bad={entry.bad}>
              {entry.text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
