// Simulated backend for demos and development without Java: same routes and JSON as the real one.
// Data lives in memory and is lost on restart. Run: npm run mock-api  (port 8080, key cambia-esta-clave)
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { evaluateReading, eventError, parentField } from './rules.mjs';

const PORT = Number(process.env.PORT ?? 8080);
const API_KEY = process.env.API_KEY ?? 'cambia-esta-clave';
const db = { ponds: new Map(), batches: new Map(), events: new Map(), alerts: new Map(),
  users: new Map(), sessions: new Map() };

/**
 * Cuentas del servidor simulado. Las claves se guardan en claro a proposito: esto corre en memoria
 * y se borra al apagarlo. El backend real las guarda con BCrypt.
 */
function openSession(user) {
  const token = randomUUID();
  db.sessions.set(token, user.id);
  const expires = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString();
  const { clave, ...publicUser } = user;
  return { token, expira_en: expires, usuario: publicUser };
}
const now = () => new Date().toISOString();

function upsertCatalog(map, row, result, check) {
  const current = map.get(row.id);
  const error = check?.(row);
  if (error) return result.rechazados.push({ id: row.id, error });
  if (current && Date.parse(row.actualizado_en) <= Date.parse(current.actualizado_en)) return result.obsoletos.push(row.id);
  map.set(row.id, { ...row, actualizado_en: new Date(row.actualizado_en).toISOString(), servidor_en: now() });
  result.aceptados.push(row.id);
}

function push(body) {
  const result = { aceptados: [], duplicados: [], obsoletos: [], rechazados: [], alertas_generadas: 0, servidor_en: now() };
  (body.estanques ?? []).forEach((p) => upsertCatalog(db.ponds, { tipo: 'estanque', activo: true, ...p }, result));
  (body.lotes ?? []).forEach((b) =>
    upsertCatalog(db.batches, { estado: 'activo', ...b }, result, (row) => (db.ponds.has(row.estanque_id) ? null : 'estanque_id: el estanque no existe')),
  );
  for (const e of body.eventos ?? []) {
    const error = eventError(e) ?? (([db.ponds, db.batches][e.tipo === 'lectura_agua' ? 0 : 1].has(e[parentField(e)])) ? null : `${parentField(e)}: no existe`);
    if (error) { result.rechazados.push({ id: e.id ?? null, error }); continue; }
    if (db.events.has(e.id)) { result.duplicados.push(e.id); continue; }
    db.events.set(e.id, { ...e, dispositivo_id: body.dispositivo_id, recibido_en: now() });
    result.aceptados.push(e.id);
    if (e.tipo === 'lectura_agua') result.alertas_generadas += createAlerts(e);
  }
  return result;
}

function createAlerts(reading) {
  let created = 0;
  for (const rule of evaluateReading(reading)) {
    const repeated = [...db.alerts.values()].some((a) => !a.atendida && a.estanque_id === reading.estanque_id && a.variable === rule.variable && a.nivel === rule.nivel);
    if (repeated) continue;
    const id = randomUUID();
    db.alerts.set(id, { id, estanque_id: reading.estanque_id, lectura_id: reading.id, ...rule, medido_en: reading.registrado_en, atendida: false, atendida_en: null });
    created++;
  }
  return created;
}

function pull(since) {
  const changed = (map) => [...map.values()].filter((r) => !since || r.servidor_en > since).map(({ servidor_en, ...r }) => r);
  return { estanques: changed(db.ponds), lotes: changed(db.batches), alertas_pendientes: [...db.alerts.values()].filter((a) => !a.atendida), servidor_en: now() };
}

function summary(batchId) {
  const b = db.batches.get(batchId);
  if (!b) return null;
  const events = [...db.events.values()].filter((e) => e.lote_id === batchId);
  const dead = events.filter((e) => e.tipo === 'mortalidad').reduce((s, e) => s + e.cantidad, 0);
  const weight = events.filter((e) => e.tipo === 'biometria').at(-1)?.peso_promedio_g ?? b.peso_inicial_g;
  const population = b.cantidad_inicial == null ? null : b.cantidad_inicial - dead;
  const biomass = population != null && weight ? (population * weight) / 1000 : null;
  return {
    lote_id: b.id, codigo: b.codigo, estanque_id: b.estanque_id, cantidad_inicial: b.cantidad_inicial,
    poblacion_estimada: population, mortalidad_total: dead,
    supervivencia_pct: population != null && b.cantidad_inicial ? Math.round((population / b.cantidad_inicial) * 1000) / 10 : null,
    peso_promedio_g: weight ?? null, biomasa_kg: biomass, tasa_alimentacion_pct: biomass ? 3 : null,
    racion_diaria_kg: biomass ? Math.round(biomass * 30) / 1000 : null,
    alertas_pendientes: [...db.alerts.values()].filter((a) => !a.atendida && a.estanque_id === b.estanque_id).length,
    notas: ['Servidor simulado: los cálculos son aproximados'],
  };
}

const routes = [
  ['GET', /^\/salud$/, () => [200, { estado: 'ok', version: 'mock' }]],
  ['POST', /^\/api\/auth\/registro$/, (_, body) => {
    if (!/^\d{5,20}$/.test(body.documento ?? '')) return [422, { detalle: 'documento: debe ser un número de 5 a 20 dígitos' }];
    if ((body.clave ?? '').length < 8) return [422, { detalle: 'clave: debe tener entre 8 y 72 caracteres' }];
    if (!(body.nombre ?? '').trim()) return [422, { detalle: 'nombre: no debe estar vacío' }];
    if ([...db.users.values()].some((u) => u.documento === body.documento)) {
      return [409, { detalle: 'Ya hay alguien registrado con ese documento' }];
    }
    const user = { id: randomUUID(), documento: body.documento, nombre: body.nombre.trim(), rol: 'cuidador', activo: true, clave: body.clave };
    db.users.set(user.id, user);
    return [200, openSession(user)];
  }],
  ['POST', /^\/api\/auth\/sesion$/, (_, body) => {
    const user = [...db.users.values()].find((u) => u.documento === body.documento);
    // El mismo mensaje exista o no el documento, igual que el backend real
    if (!user || user.clave !== body.clave) return [401, { detalle: 'El documento o la clave no son correctos' }];
    return [200, openSession(user)];
  }],
  ['DELETE', /^\/api\/auth\/sesion$/, (_, __, ___, token) => {
    db.sessions.delete(token);
    return [200, {}];
  }],
  ['GET', /^\/api\/auth\/yo$/, (_, __, ___, token) => {
    const user = db.users.get(db.sessions.get(token));
    if (!user) return [401, { detalle: 'La sesión no es válida' }];
    const { clave, ...publicUser } = user;
    return [200, publicUser];
  }],
  ['POST', /^\/api\/sync\/push$/, (_, body) => [200, push(body)]],
  ['GET', /^\/api\/sync\/pull$/, (url) => [200, pull(url.searchParams.get('desde') ?? undefined)]],
  ['GET', /^\/api\/estanques\/([^/]+)\/lecturas$/, (url, _, [id]) => [200, [...db.events.values()].filter((e) => e.tipo === 'lectura_agua' && e.estanque_id === id).slice(-Number(url.searchParams.get('limite') ?? 500)).reverse()]],
  ['GET', /^\/api\/lotes\/([^/]+)\/resumen$/, (_, __, [id]) => (summary(id) ? [200, summary(id)] : [404, { detalle: 'lote no encontrado' }])],
  ['GET', /^\/api\/alertas$/, () => [200, [...db.alerts.values()].filter((a) => !a.atendida)]],
  ['POST', /^\/api\/alertas\/([^/]+)\/atender$/, (_, __, [id]) => {
    const alert = db.alerts.get(id);
    if (!alert) return [404, { detalle: 'alerta no encontrada' }];
    Object.assign(alert, { atendida: true, atendida_en: now() });
    return [200, alert];
  }],
];

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  const url = new URL(req.url, 'http://localhost');
  const send = (status, body) => res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));
  if (url.pathname.startsWith('/api/') && req.headers['x-api-key'] !== API_KEY) return send(401, { detalle: 'falta la clave X-API-Key o no es correcta' });

  let raw = '';
  for await (const chunk of req) raw += chunk;
  for (const [method, pattern, handler] of routes) {
    const match = url.pathname.match(pattern);
    if (match && req.method === method) {
      const token = (req.headers.authorization ?? '').replace(/^Bearer /, '') || undefined;
      try { return send(...handler(url, raw ? JSON.parse(raw) : {}, match.slice(1), token)); }
      catch (error) { return send(400, { detalle: String(error.message) }); }
    }
  }
  send(404, { detalle: 'ruta no encontrada' });
}).listen(PORT, () => console.log(`Mock La Cocha API on http://localhost:${PORT} (key: ${API_KEY})`));
