import { facade } from '../../facade/PisciculturaFacade';
import { Page } from '../../shared/ui/Page';
import { useOnline } from '../../shared/ui/useOnline';
import { formatDateTime, timeAgo } from '../../shared/utils/format';
import { RejectedList } from './RejectedList';
import { useSyncStatus } from './syncStatus';
import { usePendingCounts } from './usePendingCounts';

/** Where the caretaker checks that everything reached the backend, and fixes what did not. */
export function SyncPage() {
  const online = useOnline();
  const { running, lastSuccessAt, lastError, lastUploaded } = useSyncStatus();
  const { pending, rejected } = usePendingCounts();

  return (
    <Page title="Sincronización">
      <section className="panel" aria-live="polite">
        <dl className="facts">
          <div>
            <dt>Por subir</dt>
            <dd>{pending}</dd>
          </div>
          <div>
            <dt>Rechazados</dt>
            <dd>{rejected}</dd>
          </div>
          <div>
            <dt>Última sincronización</dt>
            <dd title={formatDateTime(lastSuccessAt)}>{timeAgo(lastSuccessAt)}</dd>
          </div>
        </dl>
        {!online && (
          <p className="notice warn">
            No hay señal. Todo lo que registres queda guardado en el celular y se sube solo cuando vuelva la conexión.
          </p>
        )}
        {online && lastError && <p className="notice danger">{lastError}</p>}
        {online && !lastError && lastUploaded !== undefined && lastUploaded > 0 && (
          <p className="notice ok">Se subieron {lastUploaded} registros en la última sincronización.</p>
        )}
        <button className="button block" onClick={() => facade.sync()} disabled={!online || running}>
          {running ? 'Sincronizando…' : 'Sincronizar ahora'}
        </button>
      </section>

      <RejectedList />

      <section className="section">
        <h2>Cómo funciona</h2>
        <p className="muted">
          Cada registro se guarda primero en este celular. La app lo sube cuando hay señal: al abrirla, al volver la
          conexión y cada dos minutos. Si la señal se cae a mitad de camino, se reintenta sin duplicar nada.
        </p>
      </section>
    </Page>
  );
}
