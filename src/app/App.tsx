import { lazy, Suspense, useEffect } from 'react';
import { AuthGate } from '../features/auth/AuthGate';
import { StoryPage } from '../features/story/StoryPage';
import { ConnectionPill } from '../features/sync/ConnectionPill';
import { loadSavedSyncStatus } from '../features/sync/syncStatus';
import { useAutoSync } from '../features/sync/useAutoSync';
import { TopBarExtra } from '../shared/ui/Page';
import { usePath } from '../shared/ui/router';
import { BottomNav } from './BottomNav';
import { renderRoute } from './routes';

// Test benches for development only; the production build drops them entirely
const TroutLab = import.meta.env.DEV ? lazy(() => import('../features/dev/TroutLab')) : null;

/** App shell: the current screen, the bottom navigation and automatic sync in the background. */
export function App() {
  const path = usePath();
  // The story is public: it explains the app before anyone has signed in
  if (path === '/historia') return <StoryPage />;
  if (TroutLab && path === '/dev/trucha') {
    return (
      <Suspense fallback={null}>
        <TroutLab />
      </Suspense>
    );
  }
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
