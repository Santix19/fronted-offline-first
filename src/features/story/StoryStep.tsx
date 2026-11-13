import type { ReactNode } from 'react';

interface Props {
  step: number;
  title: string;
  text: string;
  /** Extra detail for the wide screen, where each step has a whole screen to itself */
  more: string[];
  /** The scene that plays in the open water below the card (beside it on desktop) */
  sim: ReactNode;
  children: ReactNode;
}

export function StoryStep({ step, title, text, more, sim, children }: Props) {
  return (
    <section className="lg-step" data-chapter={step} aria-labelledby={`paso-${step}`} tabIndex={-1}>
      <div className="lg-piece">
        <p className="lg-kicker"><span className="lg-step-number" aria-hidden="true">0{step}</span>Paso {step} de 4</p>
        <h2 id={`paso-${step}`}>{title}</h2>
        <p className="lg-text">{text}</p>
        <p className="lg-example" aria-hidden="true">Ejemplo</p>
        <div className="lg-body">
          <div className="lg-demo" aria-hidden="true">{children}</div>
          <ul className="lg-more">
            {more.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      </div>
      {sim}
    </section>
  );
}
