import { facade } from '../facade/PisciculturaFacade';
import { useLiveQuery } from '../shared/db/useLiveQuery';
import { usePendingCounts } from '../features/sync/usePendingCounts';

interface Tab {
  href: string;
  label: string;
  icon: string;
  /** Path prefixes that belong to this tab */
  match: string[];
}

const TABS: Tab[] = [
  { href: '#/', label: 'Estanques', icon: '≋', match: ['/', '/estanques', '/lotes', '/registrar'] },
  { href: '#/alertas', label: 'Alertas', icon: '⚠', match: ['/alertas'] },
  { href: '#/sincronizacion', label: 'Sincronizar', icon: '⇅', match: ['/sincronizacion'] },
  { href: '#/ajustes', label: 'Ajustes', icon: '⚙', match: ['/ajustes'] },
];

function isActive(tab: Tab, path: string): boolean {
  return tab.match.some((prefix) => (prefix === '/' ? path === '/' : path.startsWith(prefix)));
}

export function BottomNav({ path }: { path: string }) {
  const alerts = useLiveQuery(() => facade.alerts(), ['alerts'])?.length ?? 0;
  const { pending, rejected } = usePendingCounts();
  const counts: Record<string, number> = { '#/alertas': alerts, '#/sincronizacion': pending + rejected };

  return (
    <nav className="bottom-nav" aria-label="Secciones">
      {TABS.map((tab) => (
        <a key={tab.href} href={tab.href} aria-current={isActive(tab, path) ? 'page' : undefined}>
          <span className="icon" aria-hidden="true">{tab.icon}</span>
          {tab.label}
          {counts[tab.href] > 0 && <span className="count">{counts[tab.href]}</span>}
        </a>
      ))}
    </nav>
  );
}
