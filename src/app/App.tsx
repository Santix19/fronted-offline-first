import { useEffect } from 'react';
import { AuthGate } from '../features/auth/AuthGate';
import { ConnectionPill } from '../features/sync/ConnectionPill';
import { loadSavedSyncStatus } from '../features/sync/syncStatus';
import { useAutoSync } from '../features/sync/useAutoSync';
import { TopBarExtra } from '../shared/ui/Page';
import { usePath } from '../shared/ui/router';
import { BottomNav } from './BottomNav';
import { renderRoute } from './routes';

/** App shell: the current screen, the bottom navigation and automatic sync in the background. */
export function App() {
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
        {renderRoute(path)}
        <BottomNav path={path} />
      </div>
    </TopBarExtra.Provider>
  );
}
