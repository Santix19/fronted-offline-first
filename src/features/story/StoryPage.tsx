import { useEffect, useRef, useState } from 'react';
import { CountStep, SaveStep, SyncStep, WriteStep } from './StoryChapters';
import { markStorySeen } from './storySeen';
import { useStoryProgress } from './useStoryProgress';
import { StoryProgress } from './StoryProgress';
import { StoryStage } from './StoryStage';
import { useStoryLayout } from './useStoryLayout';

/**
 * La Cocha introduces the place; a full-screen river carries the trout through the story.
 * Native scroll, one optional live school, and the same composition in static fallbacks.
 */
export function StoryPage() {
  const root = useRef<HTMLDivElement>(null);
  const [crossed, setCrossed] = useState(148);
  const { scene, chapter, go } = useStoryProgress(root);
  useStoryLayout(root, scene);
  // The next screen should start at its top, not wherever the story was left
  useEffect(() => () => window.scrollTo(0, 0), []);
  const leave = () => void markStorySeen();

  return (
    <div ref={root} className="laguna" data-current={chapter}>
      <header className="lg-header">
        <span className="lg-brand">La Cocha<span>App del cuidador</span></span>
        <a className="lg-skip" href="#/" onClick={leave}>Saltar</a>
      </header>
      <main className="lg-layout">
        <StoryStage scene={scene} chapter={chapter} onCount={setCrossed} />
        <div className="lg-flow">
        <section className="lg-hero" data-chapter="0">
          <div className="lg-plate">
            <p className="lg-kicker">Hecha para trabajar aquí</p>
            <h1>En La Cocha,<br />el trabajo sigue.</h1>
            <p className="lg-text">Registra lo que pasa en tus estanques, con señal o sin ella.</p>
            <button className="lg-start" type="button" onClick={() => go(1)}>Sigue el agua <span aria-hidden="true">↓</span></button>
          </div>
        </section>

        <WriteStep />
        <SaveStep />
        <SyncStep />
        <CountStep total={crossed} />

        <section className="lg-step lg-end" data-chapter="5">
          <div className="lg-plate">
            <h2>A trabajar.</h2>
            <p className="lg-text">Entra con tu documento y tu clave. Después, tu PIN abre la app aunque no haya señal.</p>
            <a className="lg-enter" href="#/" onClick={leave}>Entrar a La Cocha</a>
          </div>
        </section>
        </div>
      </main>
      <StoryProgress chapter={chapter} go={go} />
    </div>
  );
}
