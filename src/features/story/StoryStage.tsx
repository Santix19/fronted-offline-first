import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useLivePond } from '../../shared/three/fish/useLivePond';
import { PondGuard } from '../../shared/three/fish/PondGuard';
import type { StoryState } from '../../shared/three/fish/storyBehavior';
import { StoryLandscape } from './StoryLandscape';
import { paintStoryWorld } from './paintStoryWorld';

const StoryLagoon = lazy(() => import('../../shared/three/fish/StoryLagoon'));
interface Props { scene: RefObject<StoryState>; chapter: number; onCount: (n: number) => void }

/** One persistent canvas follows the descent from the panorama into the full-screen river. */
export function StoryStage({ scene, chapter, onCount }: Props) {
  const allowed = useLivePond();
  const stage = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const live = allowed && !failed;
  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => { setFailed(true); setReady(false); }, []);
  useEffect(() => { if (!live) { setReady(false); onCount(148); } }, [live, onCount]);
  useLayoutEffect(() => {
    const root = stage.current?.closest<HTMLElement>('.laguna');
    if (root) paintStoryWorld(root, scene.current.descent ?? 0, scene.current.drift ?? 0);
  }, [live, ready, scene]);
  return (
    <div ref={stage} className="lg-stage">
      <figure className="lg-scene">
        <div className="lg-scene-art">
        <div className="lg-world lg-panorama"><StoryLandscape /></div>
        <div className="lg-water" aria-hidden="true">
          {live && <PondGuard onFail={onFail}><Suspense fallback={null}>
            <StoryLagoon scene={scene} chapter={chapter} onCount={onCount} onSlow={onFail} onReady={onReady} />
          </Suspense></PondGuard>}
        </div>
        {(!live || !ready) && <div className="lg-still" aria-hidden="true">
          <div className="lg-world"><svg className="lg-landscape lg-static-school" viewBox="0 0 1000 1890" preserveAspectRatio="none">
            <image href="/objects/trucha.png" x="440" y="510" width="105" height="48" />
            <image href="/objects/trucha.png" x="359" y="680" width="130" height="60" />
            <image href="/objects/trucha.png" x="210" y="990" width="210" height="96" />
            <image href="/objects/trucha.png" x="615" y="1135" width="150" height="69" />
            <image href="/objects/trucha.png" x="370" y="1270" width="240" height="110" />
            <image href="/objects/trucha.png" x="190" y="1465" width="170" height="78" />
            <image href="/objects/trucha.png" x="650" y="1570" width="190" height="87" />
            <image href="/objects/trucha.png" x="420" y="1730" width="150" height="69" />
          </svg></div>
        </div>}
        <div className="lg-world lg-world-front"><StoryLandscape foreground /></div>
        {/* The counting barrier belongs to the screen, not to the flowing river: it frames the fish's lane */}
        <div className="lg-gate" aria-hidden="true">
          <span className="lg-sim-tag"><span className="lg-sim-mark" />Barrera del contador · cada cruce suma 1</span>
        </div>
        </div>
        <figcaption className="lg-location">
          <span className="lg-location-mark" aria-hidden="true" />
          <span><strong>{chapter === 4 ? 'Canal de un estanque' : chapter === 0 ? 'Isla de La Corota' : 'El agua sigue su camino'}</strong><span>{chapter === 4 ? 'Ejemplo de conteo' : chapter === 0 ? 'Laguna de La Cocha · Nariño' : 'Las truchas, de cerca'}</span></span>
        </figcaption>
      </figure>
    </div>
  );
}
