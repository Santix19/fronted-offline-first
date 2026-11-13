import type { RefObject } from 'react';
import type { SchoolTuning } from '../../shared/three/fish/tuning';
import type { LabView } from './LabPond';

type Slider<T> = [key: keyof T, label: string, min: number, max: number, step: number];

const VIEW: Slider<LabView>[] = [
  ['count', 'Cantidad de truchas', 1, 24, 1],
  ['size', 'Tamaño', 0.5, 1.6, 0.05],
  ['tilt', 'Ángulo de la cámara (°)', 30, 90, 1],
  ['waves', 'Ondas a lo largo del cuerpo', 0.4, 1.6, 0.05],
];

const SWIM: Slider<SchoolTuning>[] = [
  ['amplitude', 'Barrido de la cola', 0.02, 0.25, 0.005],
  ['beatPerSpeed', 'Coletazos extra por velocidad', 0.5, 3, 0.1],
  ['burstSpeed', 'Velocidad de la ráfaga', 0.5, 4, 0.1],
  ['glideDrag', 'Frenado al planear', 0.3, 3, 0.1],
  ['escapeSpeed', 'Velocidad de escape', 2, 12, 0.5],
  ['scareRadius', 'Alcance del toque', 0.5, 6, 0.1],
  ['bendPerTurn', 'Curva del cuerpo al girar', 0, 0.6, 0.02],
];

interface Props {
  view: LabView;
  tuning: SchoolTuning;
  onView: (v: LabView) => void;
  onTuning: (t: SchoolTuning) => void;
  fps: RefObject<HTMLSpanElement | null>;
}

function Range<T>({ item, values, onChange }: { item: Slider<T>; values: T; onChange: (v: T) => void }) {
  const [key, label, min, max, step] = item;
  const value = values[key] as number;
  return (
    <label className="lab-range">
      <span>{label} <output>{value}</output></span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange({ ...values, [key]: Number(e.target.value) })} />
    </label>
  );
}

/** Live controls so the swimming can be tuned on the phone itself, where it will be judged. */
export function TroutLabPanel({ view, tuning, onView, onTuning, fps }: Props) {
  return (
    // Closed on a phone so the fish are seen first; open on a wide screen where it fits beside them
    <details className="lab-panel" open={window.innerWidth >= 700}>
      <summary>Ajustes del nado <span aria-live="off" ref={fps} className="lab-fps" /></summary>
      {VIEW.map((s) => <Range key={s[0]} item={s} values={view} onChange={onView} />)}
      {SWIM.map((s) => <Range key={s[0]} item={s} values={tuning} onChange={onTuning} />)}
      <label className="lab-check">
        <input type="checkbox" checked={view.shadows} onChange={(e) => onView({ ...view, shadows: e.target.checked })} />
        Sombras en el fondo
      </label>
      <label className="lab-check">
        <input type="checkbox" checked={view.small} onChange={(e) => onView({ ...view, small: e.target.checked })} />
        Modelo liviano (1.8k triángulos)
      </label>
    </details>
  );
}
