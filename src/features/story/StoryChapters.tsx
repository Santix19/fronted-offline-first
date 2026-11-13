import { TroutImage } from '../../shared/ui/TroutImage';
import { CountSim, SaveSim, SyncSim, WriteSim } from './StorySims';
import { StoryStep as Step } from './StoryStep';

function Signal({ on }: { on: boolean }) {
  return (
    <span className={on ? 'connection-pill ok' : 'connection-pill offline'}>
      <span className="dot" />
      {on ? 'Al día' : 'Sin señal'}
    </span>
  );
}

function SavedRow({ uploaded }: { uploaded: boolean }) {
  return (
    <div className="lg-row">
      <div>
        <p className="lg-row-title">12,4 °C · pH 7,1</p>
        <p className="muted">Lectura de agua · Estanque Norte</p>
      </div>
      <span className={uploaded ? 'chip ok' : 'chip warn'}>{uploaded ? 'Subido' : 'Por subir'}</span>
    </div>
  );
}

export function WriteStep() {
  return (
    <Step step={1} title="Anotas igual." text="Temperatura, pH, mortalidad, lo que diste de comer. Sin esperar a que cargue nada." more={[
      'Cinco registros: lectura de agua, alimentación, mortalidad, biometría y conteo de alevinos.',
      'Te marca si un valor sale del rango: temperatura de 10 a 16 °C, pH de 6,5 a 8,5 y oxígeno desde 6 mg/L.',
      'La fecha y la hora se ponen solas. Cámbialas solo si anotas algo que pasó antes.',
    ]} sim={<WriteSim />}>
      <div className="field field-big">
        <div className="field-text">
          <span className="lg-label">Temperatura</span>
          <span className="hint">Ideal: 10 a 16 °C</span>
        </div>
        <span className="lg-value">12,4</span>
        <span className="unit">°C</span>
      </div>
    </Step>
  );
}

export function SaveStep() {
  return (
    <Step step={2} title="Se guarda en el celular." text="Queda como «Por subir» hasta que haya señal. Si se envía dos veces, no se duplica." more={[
      'Queda guardado en el celular aunque cierres la app.',
      'Cada registro nace con su propio código: si llega dos veces, el servidor lo reconoce y no lo repite.',
      'En Inicio y en Sincronizar ves cuántos registros faltan por subir.',
    ]} sim={<SaveSim />}>
      <Signal on={false} />
      <SavedRow uploaded={false} />
    </Step>
  );
}

export function SyncStep() {
  return (
    <Step step={3} title="Vuelve la señal. Sube solo." text="Cuando vuelve la conexión, lo pendiente se envía sin que hagas nada y pasa a «Subido»." more={[
      'Lo intenta al abrir la app, cuando vuelve la señal, cuando regresas a ella y cada 2 minutos.',
      'De paso trae los estanques, lotes y alertas nuevos de la finca.',
      'Si el servidor rechaza un registro, la app te dice por qué y lo puedes corregir.',
    ]} sim={<SyncSim />}>
      <Signal on />
      <SavedRow uploaded />
    </Step>
  );
}

export function CountStep({ total }: { total: number }) {
  return (
    <Step step={4} title="Y el contador cuenta." text="Cada alevino que cruza la barrera suma al total del lote." more={[
      'Funciona con un contador infrarrojo o ultrasónico conectado al celular, o con el contador por WiFi.',
      'Si pasan dos alevinos juntos, la app lo marca para que bajes el caudal.',
      'Antes de guardar el conteo puedes corregir el total a mano.',
    ]} sim={<CountSim />}>
      <div className="lg-count">
        <span className="lg-count-number">{total}</span>
        <div className="count-gate">
          <span key={total} className={`count-fish${total > 0 ? ' crossing' : ''}`}><TroutImage width={96} /></span>
        </div>
      </div>
    </Step>
  );
}
