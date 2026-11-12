import { MaskedText } from '../../shared/ui/MaskedText';
import { Trout } from '../../shared/ui/Trout';
import { LocalTime } from './LocalTime';
import { markStorySeen } from './storySeen';
import { StoryDiagram } from './StoryDiagram';

const FISH = [
  // Kept off the headline band (roughly 30-55% of the screen) so the fish never sit on the words
  { top: '9%', left: '8%', width: 150 },
  { top: '16%', left: '58%', width: 96 },
  { top: '66%', left: '14%', width: 200 },
  { top: '82%', left: '56%', width: 120 },
];

/** Chapter 1: the lake. The only chapter that animates on arrival, not on scroll. */
export function LakeChapter() {
  return (
    <section className="chapter ch-lake">
      {FISH.map((fish) => (
        <Trout key={fish.top} className="story-fish" width={fish.width} style={{ top: fish.top, left: fish.left }} />
      ))}
      <h1 className="display">
        <MaskedText text="La laguna no tiene señal." />
      </h1>
      <p className="story-lede">Los estanques están donde el celular no llega. El trabajo no espera.</p>
    </section>
  );
}

export function WriteChapter() {
  return (
    <section className="chapter ch-write">
      <h2 className="display small">Anotas igual.</h2>
      <p className="story-lede">Temperatura, pH, mortalidad, lo que dio de comer. Sin barras, sin esperar.</p>
    </section>
  );
}

export function SaveChapter() {
  return (
    <section className="chapter ch-save">
      <h2 className="display small">Se guarda en el celular.</h2>
      <p className="story-lede">Queda como «Por subir» hasta que haya señal. Si se reenvía, no se duplica.</p>
    </section>
  );
}

export function SyncChapter() {
  return (
    <section className="chapter ch-sync">
      <h2 className="display small">Vuelve la señal. Sube solo.</h2>
      <p className="story-lede">Al llegar a la orilla, la cola se vacía sola y cada registro pasa a «Subido».</p>
    </section>
  );
}

export function RouteChapter() {
  return (
    <section className="chapter ch-route">
      <h2 className="display small">Cada registro sabe a dónde va.</h2>
      <p className="story-lede">Registros como estos entran al celular y salen juntos hacia el servidor.</p>
      <StoryDiagram />
    </section>
  );
}

export function CountChapter() {
  return (
    <section className="chapter ch-count">
      <p className="story-big number story-total">148</p>
      <h2 className="display small">Y el contador cuenta.</h2>
      <p className="story-lede">Cada alevino que cruza la barrera suma. Cifras de ejemplo.</p>
    </section>
  );
}

export function EnterChapter() {
  return (
    <section className="chapter ch-enter">
      <div className="invitation">
        <h2 className="display small">A trabajar.</h2>
        <p className="story-lede">Entra con tu documento y tu clave. Sin señal, tu PIN abre la app igual.</p>
        <a className="button" href="#/" onClick={() => void markStorySeen()}>Entrar a La Cocha</a>
      </div>
      <LocalTime />
    </section>
  );
}
