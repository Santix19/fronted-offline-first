import { facade } from '../facade/PisciculturaFacade';
import { useLiveQuery } from '../shared/db/useLiveQuery';
import { usePendingCounts } from '../features/sync/usePendingCounts';
import { NAV_ICONS } from './NavIcons';

interface Tab {
  href: string;
  label: string;
  icon: keyof typeof NAV_ICONS;
  /** Path prefixes that belong to this tab */
  match: string[];
}

const TABS: Tab[] = [
  { href: '#/', label: 'Estanques', icon: 'ponds', match: ['/', '/estanques', '/lotes', '/registrar'] },
  { href: '#/alertas', label: 'Alertas', icon: 'alerts', match: ['/alertas'] },
  { href: '#/sincronizacion', label: 'Sincronizar', icon: 'sync', match: ['/sincronizacion'] },
  { href: '#/ajustes', label: 'Ajustes', icon: 'settings', match: ['/ajustes'] },
];

function isActive(tab: Tab, path: string): boolean {
  return tab.match.some((prefix) => (prefix === '/' ? path === '/' : path.startsWith(prefix)));
}

export function BottomNav({ path }: { path: string }) {
  const alerts = useLiveQuery(() => facade.alerts(), ['alerts'])?.length ?? 0;
  const { pending, rejected } = usePendingCounts();
  const counts: Record<string, number> = { '#/alertas': alerts, '#/sincronizacion': pending + rejected };

  const active = TABS.findIndex((tab) => isActive(tab, path));

  return (
    <nav className="bottom-nav" aria-label="Secciones" style={{ '--tab': active } as React.CSSProperties}>
      <span className="nav-pill" aria-hidden="true" data-hidden={active < 0} />
      {TABS.map((tab) => (
        <a key={tab.href} href={tab.href} aria-current={isActive(tab, path) ? 'page' : undefined}>
          <span className="icon">{NAV_ICONS[tab.icon]}</span>
          {tab.label}
          {counts[tab.href] > 0 && <span className="count">{counts[tab.href]}</span>}
        </a>
      ))}
    </nav>
  );
}
