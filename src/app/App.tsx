import { useEffect } from 'react';
import { AuthGate } from '../features/auth/AuthGate';
import { StoryPage } from '../features/story/StoryPage';
import { ConnectionPill } from '../features/sync/ConnectionPill';
import { loadSavedSyncStatus } from '../features/sync/syncStatus';
import { useAutoSync } from '../features/sync/useAutoSync';
import { TopBarExtra } from '../shared/ui/Page';
import { usePath } from '../shared/ui/router';
import { BottomNav } from './BottomNav';
import { renderRoute } from './routes';

/** App shell: the current screen, the bottom navigation and automatic sync in the background. */
export function App() {
  const path = usePath();
  // The story is public: it explains the app before anyone has signed in
  if (path === '/historia') return <StoryPage />;
  return (
    <AuthGate>
      <SignedInApp />
    </AuthGate>
  );
}

/** Everything below here only ever renders with someone signed in. */
function SignedInApp() {
  const path = usePath();
  useAutoSync();

  useEffect(() => {
    void loadSavedSyncStatus();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <TopBarExtra.Provider value={<ConnectionPill />}>
      <div className="app">
        <a className="skip-content" href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus(); }}>Ir al contenido</a>
        {renderRoute(path)}
        <BottomNav path={path} />
      </div>
    </TopBarExtra.Provider>
  );
}
