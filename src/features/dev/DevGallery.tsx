import { useState, type ReactNode } from 'react';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Field } from '../../shared/ui/Field';
import { Icon, ICON_NAMES } from '../../shared/ui/icons';
import { Page } from '../../shared/ui/Page';
import { SyncChip } from '../../shared/ui/SyncChip';
import { KpiTile } from '../dashboard/KpiTile';
import { WaterBand } from '../ponds/WaterBand';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

const reading = (tempC: number, ph: number, oxygenMgL: number) =>
  ({ id: 'demo', type: 'water_reading', pondId: 'demo', recordedAt: new Date().toISOString(), source: 'manual', syncState: 'synced', tempC, ph, oxygenMgL }) as const;

/**
 * #/dev/ui, only in development: every shared piece in each of its states, on one page, to check
 * a change to the system without visiting every screen (fase 3 of docs/plan-rediseno.md).
 */
export default function DevGallery() {
  const [text, setText] = useState('');
  return (
    <div className="app">
      <Page title="Componentes" backTo="/">
        <Block title="Botones">
          <button className="button block">Principal</button>
          <button className="button secondary block">Secundario</button>
          <button className="button danger block">Peligro</button>
          <button className="button block" disabled>Deshabilitado</button>
        </Block>
        <Block title="Estados">
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="chip ok">En rango</span>
            <span className="chip warn">Advertencia</span>
            <span className="chip danger">Crítica</span>
            <span className="chip neutral">Cerrado</span>
            <SyncChip state="pending" />
            <SyncChip state="rejected" />
          </p>
          <p className="notice">Aviso neutro.</p>
          <p className="notice ok">Todo guardado.</p>
          <p className="notice warn">Algo para revisar.</p>
          <p className="notice danger">Algo salió mal.</p>
        </Block>
        <Block title="Campos">
          <Field label="Texto" hint="Con ayuda" value={text} onChange={setText} />
          <Field label="Temperatura" hint="Ideal: 10 a 16 °C" unit="°C" big type="number" value="13,0" onChange={() => {}} />
          <Field label="Oxígeno" hint="Mínimo: 6 mg/L" unit="mg/L" big type="number" value="4,6" onChange={() => {}} warning="Está en nivel crítico." />
          <Field label="Peces muertos" big type="number" value="abc" onChange={() => {}} error="Escribe un número." />
        </Block>
        <Block title="Tiles del inicio">
          <div className="kpi-grid">
            <KpiTile kind="batches" label="Lotes activos" value={3} href="#/dev/ui" />
            <KpiTile kind="alerts" label="Alertas" value={2} href="#/dev/ui" tone="danger" />
            <KpiTile kind="ponds" label="Estanques activos" value={4} href="#/dev/ui" />
            <KpiTile kind="pending" label="Por subir" value={5} href="#/dev/ui" tone="warn" />
          </div>
        </Block>
        <Block title="Lecturas de agua">
          <WaterBand reading={reading(13, 7.2, 7.6)} />
          <WaterBand reading={reading(17.4, 7, 4.6)} />
        </Block>
        <Block title="Íconos">
          <p style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {ICON_NAMES.map((name) => <span key={name} title={name}><Icon name={name} size={28} /></span>)}
          </p>
        </Block>
        <Block title="Estado vacío">
          <EmptyState title="Todavía no hay nada aquí." hint="Una frase que dice qué hacer después.">
            <button className="button">Acción</button>
          </EmptyState>
        </Block>
      </Page>
    </div>
  );
}
