import type { ReactNode } from 'react';
import { AlertsPage } from '../features/alerts/AlertsPage';
import { BatchDetailPage } from '../features/batches/BatchDetailPage';
import { BatchFormPage } from '../features/batches/BatchFormPage';
import { CountingPage } from '../features/counting/CountingPage';
import { PondDetailPage } from '../features/ponds/PondDetailPage';
import { PondFormPage } from '../features/ponds/PondFormPage';
import { PondListPage } from '../features/ponds/PondListPage';
import { RECORD_LABELS, type RecordType } from '../features/records/recordTypes';
import { RecordFormPage } from '../features/records/RecordFormPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { SyncPage } from '../features/sync/SyncPage';
import { matchPath } from '../shared/ui/router';

type Params = Record<string, string>;

/** Every screen of the app and its address. Order matters: the first match wins. */
const ROUTES: [string, (p: Params) => ReactNode][] = [
  ['/', () => <PondListPage />],
  ['/estanques/nuevo', () => <PondFormPage />],
  ['/estanques/:id/editar', (p) => <PondFormPage pondId={p.id} />],
  ['/estanques/:id', (p) => <PondDetailPage pondId={p.id} />],
  ['/lotes/nuevo', (p) => <BatchFormPage pondId={p.estanque} />],
  ['/lotes/:id/editar', (p) => <BatchFormPage batchId={p.id} />],
  ['/lotes/:id/conteo', (p) => <CountingPage batchId={p.id} />],
  ['/lotes/:id', (p) => <BatchDetailPage batchId={p.id} />],
  ['/registrar/:type', (p) => recordForm(p)],
  ['/alertas', () => <AlertsPage />],
  ['/sincronizacion', () => <SyncPage />],
  ['/ajustes', () => <SettingsPage />],
];

function recordForm(p: Params): ReactNode {
  const type = p.type as RecordType;
  const parentId = type === 'water_reading' ? p.estanque : p.lote;
  if (!(type in RECORD_LABELS) || !parentId) return null;
  // key: a new form (empty) when the address changes
  return <RecordFormPage key={`${type}-${parentId}`} type={type} parentId={parentId} />;
}

export function renderRoute(path: string): ReactNode {
  for (const [pattern, render] of ROUTES) {
    const params = matchPath(pattern, path);
    if (params) return render(params) ?? <PondListPage />;
  }
  return <PondListPage />;
}
