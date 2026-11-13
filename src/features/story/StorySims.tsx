import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/**
 * The little scenes that play in the water below each step (beside it on desktop). They are pictures
 * of what the step says, so they are hidden from screen readers; the step's text already says it.
 */

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Frame counter that runs only while the scene is on screen. Reduced motion shows the finished scene. */
function useSimFrame(ref: RefObject<HTMLElement | null>, frames: number, ms: number) {
  const [frame, setFrame] = useState(() => (reducedMotion() ? frames - 1 : 0));
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const watcher = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .4 });
    watcher.observe(el);
    return () => watcher.disconnect();
  }, [ref]);
  useEffect(() => {
    if (reducedMotion()) { setFrame(frames - 1); return; }
    if (!visible) { setFrame(0); return; }
    const timer = setInterval(() => setFrame((f) => (f + 1) % frames), ms);
    return () => clearInterval(timer);
  }, [visible, frames, ms]);
  return frame;
}

function Scene({ name, label, sceneRef, children }: { name: string; label: string; sceneRef: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  return (
    <div ref={sceneRef} className={`lg-sim lg-sim-${name}`} aria-hidden="true">
      <p className="lg-sim-tag"><span className="lg-sim-mark" />{label}</p>
      {children}
    </div>
  );
}

type Signal = 'off' | 'busy' | 'ok';
const SIGNAL_TEXT: Record<Signal, string> = { off: 'Sin señal', busy: 'Subiendo…', ok: 'Al día' };

function Status({ state }: { state: Signal }) {
  return <span className={`lg-sim-status ${state}`}><span className="lg-sim-dot" />{SIGNAL_TEXT[state]}</span>;
}

type ChipKind = 'warn' | 'busy' | 'ok' | 'new';
const CHIP_TEXT: Record<ChipKind, string> = { warn: 'Por subir', busy: 'Subiendo', ok: 'Subido', new: 'Nuevo' };

interface PhoneRow { id: string; title: string; detail: string; chip: ChipKind }

function Phone({ signal, heading, rows, closed = false, note }: { signal: Signal; heading: string; rows: PhoneRow[]; closed?: boolean; note?: string }) {
  return (
    <div className="lg-phone">
      <div className="lg-phone-screen" data-closed={closed}>
        <div className="lg-phone-bar"><span>6:42</span><Status state={signal} /></div>
        <p className="lg-phone-heading">{heading}</p>
        <ul className="lg-phone-list">
          {rows.map((row) => (
            <li key={row.id} className="lg-phone-row">
              <span className="lg-phone-title">{row.title}</span>
              <span className="lg-phone-detail">{row.detail}<span className={`lg-sim-chip ${row.chip}`}>{CHIP_TEXT[row.chip]}</span></span>
            </li>
          ))}
        </ul>
        {note && <p className="lg-phone-note">{note}</p>}
        {closed && <p className="lg-phone-closed">App cerrada</p>}
      </div>
    </div>
  );
}

/** Planks over the water for the phone to stand on. */
function Dock() {
  return (
    <svg className="lg-dock" viewBox="0 0 200 30" preserveAspectRatio="none">
      <path d="M22 12v18M100 12v18M178 12v18" stroke="var(--sc-wood-dark)" strokeWidth="5" />
      <path d="M4 3h192v10H4Z" fill="var(--sc-wood)" stroke="var(--sc-wood-dark)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M52 3v10M100 3v10M148 3v10" stroke="var(--sc-wood-dark)" strokeWidth="2" />
      <path d="M10 25q12-4 24 0t24 0M142 25q12-4 24 0t24 0" stroke="var(--sc-water-line)" strokeWidth="2" fill="none" />
    </svg>
  );
}

/* ---------- Step 1: you measure and write it down, no waiting ---------- */

const READINGS = [
  { label: 'Temperatura', value: '12,4', unit: '°C' },
  { label: 'pH', value: '7,1', unit: '' },
  { label: 'Oxígeno', value: '7,5', unit: 'mg/L' },
];
// Two frames to take the reading, one per character typed and one for its range, the note, then a pause
const WRITE_START = 2;
const WRITE_FRAMES = WRITE_START + READINGS.reduce((n, r) => n + r.value.length + 1, 0) + 1 + 7;

export function WriteSim() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useSimFrame(ref, WRITE_FRAMES, 300);
  let cursor = WRITE_START;
  const rows = READINGS.map((r) => {
    const typed = Math.max(0, Math.min(r.value.length, frame - cursor + 1));
    const checked = frame >= cursor + r.value.length;
    cursor += r.value.length + 1;
    return { ...r, typed, checked };
  });
  const typing = rows.findIndex((r) => !r.checked);
  return (
    <Scene name="write" label="En el estanque, sin señal" sceneRef={ref}>
      <svg className="lg-thermo" viewBox="0 0 60 200" data-reading={frame >= 1}>
        <path d="M4 150q13-6 26 0t26 0M10 166q10-4 20 0t20 0" stroke="var(--sc-water-line)" strokeWidth="2.5" fill="none" />
        <rect x="21" y="8" width="18" height="152" rx="9" fill="#fffaf0" stroke="#1b1413" strokeWidth="3" />
        <path d="M39 36h7M39 60h7M39 84h7M39 108h7M39 132h7" stroke="#1b1413" strokeWidth="2" />
        <rect className="lg-thermo-level" x="26.5" y="20" width="7" height="140" rx="3.5" />
        <circle cx="30" cy="172" r="16" fill="var(--rosa)" stroke="#1b1413" strokeWidth="3" />
      </svg>
      <div className="lg-notebook">
        <div className="lg-notebook-head"><strong>Estanque Norte</strong><Status state="off" /></div>
        {rows.map((r, i) => (
          <div key={r.label} className="lg-notebook-row">
            <span className="lg-notebook-label">{r.label}</span>
            <span className="lg-notebook-value">
              {r.value.slice(0, r.typed)}
              {i === typing && frame >= WRITE_START && <span className="lg-caret" />}
              {r.checked && r.unit && <small>{r.unit}</small>}
            </span>
            <span className="lg-sim-chip ok" data-shown={r.checked}>En rango</span>
          </div>
        ))}
        <p className="lg-notebook-note" data-shown={frame >= cursor}>Anotado 6:42 a. m. · sin esperar</p>
      </div>
    </Scene>
  );
}

/* ---------- Step 2: it stays in the phone, even with the app closed ---------- */

const SAVED: PhoneRow[] = [
  { id: 'agua', title: 'Lectura de agua', detail: '12,4 °C', chip: 'warn' },
  { id: 'comida', title: 'Alimentación', detail: '12,4 kg', chip: 'warn' },
  { id: 'mortalidad', title: 'Mortalidad', detail: '2 truchas', chip: 'warn' },
];
// A record arrives every two frames; then the app closes and opens again with everything still there
const SAVE_FRAMES = 15;

export function SaveSim() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useSimFrame(ref, SAVE_FRAMES, 650);
  const count = Math.min(SAVED.length, Math.ceil(frame / 2));
  const closed = frame >= 8 && frame < 10;
  const reopened = frame >= 10;
  return (
    <Scene name="save" label="Guardado en el celular" sceneRef={ref}>
      <Dock />
      <Phone
        signal="off"
        heading={`Por subir · ${count}`}
        rows={SAVED.slice(0, count).reverse()}
        closed={closed}
        note={reopened ? 'Al abrir de nuevo, siguen ahí' : undefined}
      />
    </Scene>
  );
}

/* ---------- Step 3: the signal comes back and everything goes up on its own ---------- */

const PENDING: PhoneRow[] = SAVED;
const NEW_BATCH: PhoneRow = { id: 'lote', title: 'Lote TRUCHA-SUR', detail: 'Del servidor', chip: 'new' };
// Signal returns, each record flies to the server and comes back «Subido», then a new batch comes down
const SYNC_FRAMES = 15;

export function SyncSim() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useSimFrame(ref, SYNC_FRAMES, 700);
  const signal = frame >= 1;
  const uploaded = PENDING.filter((_, i) => frame >= 3 + 2 * i).length;
  const sending = [2, 4, 6].indexOf(frame);
  const rows = PENDING.map((row, i): PhoneRow => ({ ...row, chip: i < uploaded ? 'ok' : i === sending ? 'busy' : 'warn' })).reverse();
  if (frame >= 9) rows.unshift(NEW_BATCH);
  rows.length = Math.min(rows.length, 3);
  const state: Signal = !signal ? 'off' : uploaded === PENDING.length ? 'ok' : 'busy';
  return (
    <Scene name="sync" label="Vuelve la señal" sceneRef={ref}>
      <svg className="lg-sim-path" viewBox="0 0 100 75" preserveAspectRatio="none">
        <path d="M43 34.5 61 20" />
      </svg>
      <Phone signal={state} heading={uploaded === PENDING.length ? 'Todo subido' : `Por subir · ${PENDING.length - uploaded}`} rows={rows} />
      <div className="lg-server">
        <svg className="lg-server-icon" viewBox="0 0 24 28">
          <path d="M2 2h20v7H2ZM2 11h20v7H2ZM2 20h20v6H2Z" fill="#e8ddca" stroke="#1b1413" strokeWidth="2" strokeLinejoin="round" />
          <path d="M6 5.5h3M6 14.5h3M6 23h3" stroke="#40530a" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span><strong>Servidor</strong><small>Recibidos: {uploaded}</small></span>
      </div>
      <svg className="lg-antenna" viewBox="0 0 120 150" data-on={signal}>
        <path d="M0 150q20-30 60-32t60 32Z" fill="var(--sc-bank)" />
        <path d="M44 124 60 34l16 90M49 96h22M53 72h14M47 110l26-14M51 84l18-12" stroke="#1b1413" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
        <path className="lg-antenna-top" d="m60 18 9 9-9 9-9-9Z" />
        <g className="lg-antenna-waves" fill="none" strokeWidth="4" strokeLinecap="round">
          <path d="M40 14q-8 13 0 26M80 14q8 13 0 26" />
          <path d="M28 4q-14 23 0 46M92 4q14 23 0 46" />
        </g>
      </svg>
      {sending >= 0 && <span key={frame} className="lg-packet up" />}
      {frame === 8 && <span key="down" className="lg-packet down" />}
    </Scene>
  );
}

/** Step 4 plays in the 3D river itself (the barrier and the trout); this only keeps its water open. */
export function CountSim() {
  return <div className="lg-sim lg-sim-count" aria-hidden="true" />;
}
