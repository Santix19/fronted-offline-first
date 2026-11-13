import { formatNumber } from '../utils/format';

/** Show the real quantity immediately, including under reduced motion. */
export function CountUp({ value, decimals = 1 }: { value: number; decimals?: number }) {
  return <span className="number">{formatNumber(value, decimals)}</span>;
}
