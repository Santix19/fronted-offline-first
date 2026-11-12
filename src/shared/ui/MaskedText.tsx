import { Fragment, useRef } from 'react';
import { duration, ease } from '../motion/presets';
import { useGsap } from '../motion/useGsap';

/**
 * Words rise out of a mask, one after another. The full text stays in aria-label for screen readers,
 * and under reduced motion nothing moves: the words are simply there.
 */
export function MaskedText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGsap(
    ref,
    (g, reduced) => {
      if (reduced) return;
      g.from('.mask-word > span', { yPercent: 110, duration: duration.reveal, ease: ease.out, stagger: 0.05 });
    },
    [text],
  );

  return (
    <span ref={ref} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="mask-word" aria-hidden="true">
            <span>{word}</span>
          </span>
          {/* The space lives outside the mask: inside an inline-block it collapses and words glue together */}
          {' '}
        </Fragment>
      ))}
    </span>
  );
}
