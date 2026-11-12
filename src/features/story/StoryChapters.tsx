import { CapsuleRibbon, type Capsule } from '../../shared/ui/CapsuleRibbon';
import { GlossyObject } from '../../shared/ui/GlossyObject';
import { MaskedText } from '../../shared/ui/MaskedText';
import { LocalTime } from './LocalTime';
import { markStorySeen } from './storySeen';
import { StoryDiagram } from './StoryDiagram';

/** Example records for the ribbon: the five kinds the app really keeps, labelled as examples below */
const EXAMPLES: Capsule[] = [
  { mark: '°C', label: 'Temperatura', value: '12,4' },
  { mark: 'pH', label: 'pH del agua', value: '7,1' },
  { mark: 'kg', label: 'Alimento', value: '3,5', action: 'Por subir' },
  { mark: '✕', label: 'Mortalidad', value: '2' },
  { mark: 'g', label: 'Biometría', value: '48' },
  { mark: '#', label: 'Conteo', value: '148', action: 'Subido' },
];

/** Chapter 1: the lake. The poster headline jumps in letter by letter on arrival, not on scroll. */
export function LakeChapter() {
  return (
    <section className="chapter ch-lake">
      <div className="lake-objects" aria-hidden="true">
        <GlossyObject kind="fish" color="blue" size={260} tilt={-16} className="float lake-fish" />
        <GlossyObject kind="drop" color="lime" size={120} tilt={14} className="float float-slow lake-drop" />
        <GlossyObject kind="thermo" color="peach" size={130} tilt={18} className="float lake-thermo" />
      </div>
      <h1 className="display hero">
        <MaskedText text="La laguna no tiene señal." mode="chars" delay={0.2} />
      </h1>
      <p className="story-lede lead">Los estanques están donde el celular no llega. El trabajo no espera.</p>
    </section>
  );
}

export function WriteChapter() {
  return (
    <section className="chapter ch-write">
      <h2 className="display small"><MaskedText text="Anotas igual." manual /></h2>
      <p className="story-lede">Temperatura, pH, mortalidad, lo que dio de comer. Sin barras, sin esperar.</p>
    </section>
  );
}

export function SaveChapter() {
  return (
    <section className="chapter ch-save">
      <h2 className="display small"><MaskedText text="Se guarda en el celular." manual /></h2>
      <p className="story-lede">Queda como «Por subir» hasta que haya señal. Si se reenvía, no se duplica.</p>
    </section>
  );
}

/** The black chapter: the one strong interruption, where the signal comes back */
export function SyncChapter() {
  return (
    <section className="chapter ch-sync stage-chapter">
      <GlossyObject kind="cloud" color="violet" size={150} tilt={-8} className="float sync-cloud" />
      <h2 className="display small"><MaskedText text="Vuelve la señal. Sube solo." manual /></h2>
      <p className="story-lede">Al llegar a la orilla, la cola se vacía sola y cada registro pasa a «Subido».</p>
    </section>
  );
}

export function RouteChapter() {
  return (
    <section className="chapter ch-route">
      <h2 className="display small"><MaskedText text="Cada registro sabe a dónde va." manual /></h2>
      <p className="story-lede">Registros como estos entran al celular y salen juntos hacia el servidor.</p>
      <CapsuleRibbon items={EXAMPLES} label="Registros de ejemplo" />
      <StoryDiagram />
    </section>
  );
}

export function CountChapter() {
  return (
    <section className="chapter ch-count">
      <GlossyObject kind="coin" color="lime" size={170} tilt={10} className="float count-coin" />
      <p className="story-big number story-total">148</p>
      <h2 className="display small"><MaskedText text="Y el contador cuenta." manual /></h2>
      <p className="story-lede">Cada alevino que cruza la barrera suma. Cifras de ejemplo.</p>
    </section>
  );
}

/** The close: the promise once more, big, in the clipped gradient panel, with one direct action */
export function EnterChapter() {
  return (
    <section className="chapter ch-enter">
      <div className="invitation cut stage-convert">
        <GlossyObject kind="fish" color="lime" size={200} tilt={12} className="float invite-fish" />
        <h2 className="display closing"><MaskedText text="A trabajar." manual /></h2>
        <p className="story-lede">Entra con tu documento y tu clave. Sin señal, tu PIN abre la app igual.</p>
        <a className="button hero-button" href="#/" onClick={() => void markStorySeen()}>Entrar a La Cocha</a>
      </div>
      <LocalTime />
    </section>
  );
}
