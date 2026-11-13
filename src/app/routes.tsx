import type { ReactNode } from 'react';
import { AlertsPage } from '../features/alerts/AlertsPage';
import { ActiveBatchesPage } from '../features/batches/ActiveBatchesPage';
import { BatchDetailPage } from '../features/batches/BatchDetailPage';
import { BatchFormPage } from '../features/batches/BatchFormPage';
import { CountingPage } from '../features/counting/CountingPage';
import { PondDetailPage } from '../features/ponds/PondDetailPage';
import { PondFormPage } from '../features/ponds/PondFormPage';
import { PeoplePage } from '../features/people/PeoplePage';
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
  ['/estanques/nuevo', () => <PondFormPage key="new-pond" />],
  ['/estanques/:id/editar', (p) => <PondFormPage key={p.id} pondId={p.id} />],
  ['/estanques/:id', (p) => <PondDetailPage key={p.id} pondId={p.id} />],
  ['/lotes', (p) => <ActiveBatchesPage record={p.registrar} />],
  ['/lotes/nuevo', (p) => <BatchFormPage key={`new-${p.estanque}`} pondId={p.estanque} />],
  ['/lotes/:id/editar', (p) => <BatchFormPage key={p.id} batchId={p.id} />],
  ['/lotes/:id/conteo', (p) => <CountingPage key={p.id} batchId={p.id} />],
  ['/lotes/:id', (p) => <BatchDetailPage key={p.id} batchId={p.id} />],
  ['/registrar/:type', (p) => recordForm(p)],
  ['/alertas', () => <AlertsPage />],
  ['/sincronizacion', () => <SyncPage />],
  ['/ajustes', () => <SettingsPage />],
  ['/personas', () => <PeoplePage />],
];

function recordForm(p: Params): ReactNode {
  const type = p.type as RecordType;
  const parentId = type === 'water_reading' ? p.estanque : p.lote;
  if (!(type in RECORD_LABELS) || !parentId) return null;
  // key: a new form (empty) when the address changes
  return <RecordFormPage key={`${type}-${parentId}-${p.corregir ?? ''}`} type={type} parentId={parentId} recordId={p.corregir} />;
}

export function renderRoute(path: string): ReactNode {
  for (const [pattern, render] of ROUTES) {
    const params = matchPath(pattern, path);
    if (params) return render(params) ?? <PondListPage />;
  }
  return <PondListPage />;
}
