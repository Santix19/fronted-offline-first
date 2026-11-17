import { Fragment, useRef } from 'react';
import { loud } from '../motion/presets';
import { useGsap } from '../motion/useGsap';

type Mode = 'words' | 'chars';

interface MaskedTextProps {
  text: string;
  /** words: each word rises tilted out of its mask. chars: every letter jumps in, for the poster headlines. */
  mode?: Mode;
  /** Seconds to wait before the first word moves (lets a backdrop or object land first) */
  delay?: number;
  /** A scroll timeline plays the words itself (the story); skip the on-mount animation */
  manual?: boolean;
}

/**
 * Words rise out of a mask, tilted, one after another, and settle with a long expo tail.
 * The full text stays in aria-label for screen readers, and under reduced motion nothing moves.
 */
export function MaskedText({ text, mode = 'words', delay = 0, manual = false }: MaskedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGsap(
    ref,
    (g, reduced) => {
      if (reduced || manual) return;
      const preset = mode === 'chars' ? loud.chars : loud.words;
      g.from(mode === 'chars' ? '.mask-char' : '.mask-word > span', { ...preset, delay });
    },
    [text, mode],
  );

  return (
    <span ref={ref} aria-label={text} className="masked-text">
      {text.split(' ').map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="mask-word" aria-hidden="true">
            <span>
              {mode === 'chars'
                ? Array.from(word).map((ch, j) => (
                    <span key={j} className="mask-char">
                      {ch}
                    </span>
                  ))
                : word}
            </span>
          </span>
          {/* The space lives outside the mask: inside an inline-block it collapses and words glue together */}
          {' '}
        </Fragment>
      ))}
    </span>
  );
}
