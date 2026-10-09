import { useOnline } from '../../shared/ui/useOnline';
import { useSyncStatus } from './syncStatus';
import { usePendingCounts } from './usePendingCounts';

/** Always visible in the top bar: is there signal, and is everything uploaded? */
export function ConnectionPill() {
  const online = useOnline();
  const { running, lastError } = useSyncStatus();
  const { pending, rejected } = usePendingCounts();

  // Short text so the screen title keeps its room; the counts are on the bottom tab and in the label
  let text = 'Al día';
  let tone = 'ok';
  if (!online) [text, tone] = ['Sin señal', 'offline'];
  else if (running) [text, tone] = ['Subiendo', 'busy'];
  else if (rejected) [text, tone] = ['Revisar', 'error'];
  else if (pending) [text, tone] = ['Pendiente', lastError ? 'error' : 'busy'];
  const detail = `${pending} por subir, ${rejected} rechazados`;

  return (
    <a className={`connection-pill ${tone}`} href="#/sincronizacion" aria-label={`Sincronización: ${text}. ${detail}`}>
      <span className="dot" aria-hidden="true" />
      {text}
    </a>
  );
}
