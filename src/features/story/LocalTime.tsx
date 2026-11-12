import { useEffect, useState } from 'react';

const clock = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false });

/** The footer detail of the style: where this is and what time it is there. Ticks once a minute. */
export function LocalTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return <p className="story-footer">Laguna de La Cocha · {clock.format(now)} hora de Colombia</p>;
}
