// Copy of the backend's expert system (service/Rules.java) and its event validation,
// reduced to what the mock needs. Only for local demos: the real rules live in the Java backend.

const RANGES = [
  { variable: 'temp_c', label: 'Temperatura', fem: true, unit: ' °C', omin: 10, omax: 16, cmin: 6, cmax: 18 },
  { variable: 'ph', label: 'pH', fem: false, unit: '', omin: 6.5, omax: 8.5, cmin: 6, cmax: 9 },
  { variable: 'oxigeno_mg_l', label: 'Oxígeno disuelto', fem: false, unit: ' mg/L', omin: 6, omax: Infinity, cmin: 5, cmax: Infinity },
];

export function evaluateReading(reading) {
  return RANGES.flatMap((r) => {
    const value = reading[r.variable];
    if (value == null || (value >= r.omin && value <= r.omax)) return [];
    const level = value < r.cmin || value > r.cmax ? 'critica' : 'advertencia';
    const dir = (value > r.omax ? 'alt' : 'baj') + (r.fem ? 'a' : 'o');
    const optimal = r.omax === Infinity ? `mínimo ${r.omin}${r.unit}` : `óptimo ${r.omin}–${r.omax}${r.unit}`;
    return [{ variable: r.variable, valor: value, nivel: level, mensaje: `${r.label} ${dir}: ${value}${r.unit} (${optimal})` }];
  });
}

const DAY = 86_400_000;

export function dateError(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 'formato no válido';
  if (t < Date.parse('2024-01-01T00:00:00Z')) return 'fecha anterior a 2024 (reloj sin configurar)';
  if (t - Date.now() > DAY) return 'fecha en el futuro';
  return null;
}

const PARENT = { lectura_agua: 'estanque_id', conteo: 'lote_id', mortalidad: 'lote_id', alimentacion: 'lote_id', biometria: 'lote_id' };

/** Returns an error text like the backend's, or null when the event is valid. */
export function eventError(e) {
  if (!PARENT[e.tipo]) return `tipo: debe ser uno de ${Object.keys(PARENT).join(', ')}`;
  if (!e.id) return 'id: no debe ser nulo';
  const err = dateError(e.registrado_en);
  if (err) return `registrado_en: ${err}`;
  if (e.tipo === 'lectura_agua') {
    if (e.temp_c == null && e.ph == null && e.oxigeno_mg_l == null) return 'la lectura no trae temperatura, pH ni oxígeno';
    if (e.ph != null && (e.ph < 0 || e.ph > 14)) return 'ph: debe ser menor que o igual a 14';
  }
  if (e.tipo === 'mortalidad' && !(e.cantidad >= 1)) return 'cantidad: debe ser mayor que o igual a 1';
  if (e.tipo === 'alimentacion' && !(e.kg > 0)) return 'kg: debe ser mayor que 0';
  return null;
}

export const parentField = (e) => PARENT[e.tipo];
