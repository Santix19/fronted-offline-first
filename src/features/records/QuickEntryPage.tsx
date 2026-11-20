import { useEffect } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Page } from '../../shared/ui/Page';
import { navigate } from '../../shared/ui/router';
import { useOnline } from '../../shared/ui/useOnline';
import { ENTRY_KINDS, planEntry, type EntryTarget } from './quickEntry';
import type { RecordType } from './recordTypes';

/** El aviso de siempre: con o sin señal se puede anotar, y qué pasa con lo anotado. */
function OfflineNote() {
  const online = useOnline();
  return (
    <p className={online ? 'notice' : 'notice warn'}>
      {online
        ? 'Lo que anotes se guarda en el celular y se sube al servidor en unos segundos.'
        : 'Estás sin señal. Igual puedes anotar: todo se guarda en el celular y se sube solo cuando vuelva la señal.'}
    </p>
  );
}

/** Primer paso: qué se va a anotar. */
function KindMenu() {
  return (
    <Page title="Anotar datos" backTo="/">
      <section className="section quick-entry">
        <OfflineNote />
        <ul className="quick-entry-grid">
          {ENTRY_KINDS.map((kind) => (
            <li key={kind.type}>
              <a className="quick-entry-tile" href={`#/anotar/${kind.type}`}>
                <span className="quick-entry-title">{kind.title}</span>
                <span className="muted">{kind.detail}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}

function TargetList({ targets }: { targets: EntryTarget[] }) {
  return (
    <ul className="list">
      {targets.map((t) => (
        <li key={t.id}>
          <a className="row" href={t.href}>
            <div className="row-main">
              <p className="row-title">{t.label}</p>
              {t.sub && <p className="muted">{t.sub}</p>}
            </div>
            <span aria-hidden="true">›</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Segundo paso: dónde se anota. Si hay un solo lugar posible, va directo al formulario. */
function TargetStep({ type }: { type: RecordType }) {
  const data = useLiveQuery(async () => {
    const [ponds, batches] = await Promise.all([facade.ponds(), facade.batches()]);
    return planEntry(type, ponds, batches);
  }, ['ponds', 'batches'], [type]);
  const kind = ENTRY_KINDS.find((k) => k.type === type)!;

  // replace: al volver desde el formulario se llega al menú y no a este paso, que saltaría otra vez
  useEffect(() => {
    if (data?.kind === 'direct') navigate(data.href.replace(/^#/, ''), { replace: true });
  }, [data]);

  return (
    <Page title={kind.title} backTo="/anotar">
      <section className="section quick-entry">
        <p className="muted">{kind.detail}</p>
        <OfflineNote />

        {data?.kind === 'choose' && (
          <>
            <h2>{type === 'water_reading' ? '¿En qué estanque?' : '¿De qué lote?'}</h2>
            <TargetList targets={data.targets} />
          </>
        )}

        {data?.kind === 'needs_pond' && (
          <EmptyState
            title="Primero agrega un estanque."
            hint="Los datos se anotan en un estanque o en uno de sus lotes. Se puede crear sin señal."
            object="drop"
          >
            <a className="button" href="#/estanques/nuevo">Agregar estanque</a>
          </EmptyState>
        )}

        {data?.kind === 'needs_batch' && (
          <>
            <div className="notice">
              <p>
                <b>{kind.title} se anota por lote.</b> Un lote son los peces que sembraste en un estanque
                (por ejemplo, los alevinos que llegaron este mes). Todavía no hay ningún lote activo.
              </p>
            </div>
            <h2>Crear el lote en…</h2>
            <TargetList targets={data.ponds} />
            <p className="muted">Después de guardarlo, vuelve a «Anotar datos» y toca «{kind.title}»: irá directo al formulario. También se puede sin señal.</p>
          </>
        )}
      </section>
    </Page>
  );
}

/** «Anotar datos»: cualquier registro a dos toques desde el inicio, con o sin señal. */
export function QuickEntryPage({ type }: { type?: RecordType }) {
  return type ? <TargetStep type={type} /> : <KindMenu />;
}
