import { useRef } from 'react';
import { duration, ease } from '../motion/presets';
import { useGsap } from '../motion/useGsap';
import { formatNumber } from '../utils/format';

interface CountUpProps {
  value: number;
  decimals?: number;
}

/** A number that counts up from zero the first time it shows. Under reduced motion it just shows the number. */
export function CountUp({ value, decimals = 1 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGsap(
    ref,
    (g, reduced) => {
      const node = ref.current;
      if (!node || reduced) return;
      const counter = { n: 0 };
      g.to(counter, {
        n: value,
        duration: duration.reveal * 1.4,
        ease: ease.out,
        onUpdate: () => {
          node.textContent = formatNumber(counter.n, decimals);
        },
        onComplete: () => {
          node.textContent = formatNumber(value, decimals);
        },
      });
    },
    [value, decimals],
  );

  return (
    <span ref={ref} className="number">
      {formatNumber(value, decimals)}
    </span>
  );
}
