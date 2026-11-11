import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AiSource } from './aiSource';
import { cachedAiSource, PROYECCION_VIVE_MS, SALUD_VIVE_MS } from './cachedAiSource';
import type { BatchProjection, Finding } from './findingTypes';

/**
 * Pruebas del Proxy del análisis.
 *
 * Lo que se comprueba es lo que el patrón promete: que la misma pregunta dos veces salga una sola
 * vez a la red, que lo guardado deje de valer cuando debe, y —la parte que es fácil de romper— que
 * guardar respuestas nunca haga que la app muestre algo que ya no es cierto.
 *
 * El reloj se inyecta: una prueba que espera dos minutos de verdad no la corre nadie.
 */

/** El sujeto real, contando cuántas veces lo alcanzaron. */
function contador() {
  const llamadas = { salud: 0, proyeccion: 0, pendientes: 0, atender: 0, olvidar: 0 };
  let falla = false;
  let peso = 50.6;

  const proyeccion = (batchId: string): BatchProjection => ({
    daysAhead: 30,
    tgc: 1.78,
    tgcFitted: true,
    meanTempC: 12.4,
    currentWeightG: 28,
    projectedWeightG: peso,
    daysToTarget: 148,
    targetDate: '2027-03-24',
    currentQuantity: 9300,
    projectedQuantity: 9270,
    survivalPct: 93,
    deathsPerDay: 0.5,
    notes: [batchId],
  });

  const hallazgo = (id: string): Finding => ({
    id,
    batchId: 'lote-1',
    kind: 'tendencia',
    level: 'advertencia',
    score: 0.94,
    message: 'El oxígeno viene bajando.',
    createdAt: '2026-11-10T12:00:00Z',
    attended: true,
  });

  const real: AiSource = {
    async available() {
      llamadas.salud += 1;
      if (falla) throw new Error('sin servidor');
      return true;
    },
    async projection(batchId) {
      llamadas.proyeccion += 1;
      if (falla) throw new Error('sin servidor');
      return proyeccion(batchId);
    },
    async pendingFindings() {
      llamadas.pendientes += 1;
      return [];
    },
    async pondFindings() {
      llamadas.pendientes += 1;
      return [];
    },
    async batchFindings() {
      llamadas.pendientes += 1;
      return [];
    },
    async attend(id) {
      llamadas.atender += 1;
      return hallazgo(id);
    },
    forget() {
      llamadas.olvidar += 1;
    },
  };

  return {
    real,
    llamadas,
    romper: () => {
      falla = true;
    },
    arreglar: () => {
      falla = false;
    },
    cambiarPeso: (nuevo: number) => {
      peso = nuevo;
    },
  };
}

/** Un reloj que se mueve cuando la prueba lo dice. */
function reloj(inicio = 1_000_000) {
  let t = inicio;
  return { ahora: () => t, avanzar: (ms: number) => (t += ms) };
}

// ---------- la salud, que se pregunta en cada pantalla ----------

test('preguntar la salud dos veces seguidas sale una vez a la red', async () => {
  const c = contador();
  const proxy = cachedAiSource(c.real);

  assert.equal(await proxy.available(), true);
  assert.equal(await proxy.available(), true);
  assert.equal(await proxy.available(), true);

  assert.equal(c.llamadas.salud, 1, 'tres preguntas, una llamada');
});

test('la salud se vuelve a preguntar cuando vence', async () => {
  const c = contador();
  const t = reloj();
  const proxy = cachedAiSource(c.real, { ahora: t.ahora });

  await proxy.available();
  t.avanzar(SALUD_VIVE_MS + 1);
  await proxy.available();

  // Una caché que nunca vence es un servicio que volvió y nadie usa
  assert.equal(c.llamadas.salud, 2);
});

test('un servicio caido tambien se recuerda', async () => {
  const c = contador();
  const proxy = cachedAiSource(c.real);
  // available() devuelve false sin lanzar cuando el backend dice que no hay IA
  const real: AiSource = { ...c.real, available: async () => false };
  const otro = cachedAiSource(real);

  assert.equal(await otro.available(), false);
  assert.equal(await otro.available(), false);
  await proxy.available();
});

// ---------- la proyeccion, que se pide al abrir el lote ----------

test('abrir dos veces el mismo lote sale una vez a la red', async () => {
  const c = contador();
  const proxy = cachedAiSource(c.real);

  const primera = await proxy.projection('lote-1');
  const segunda = await proxy.projection('lote-1');

  assert.deepEqual(segunda, primera);
  assert.equal(c.llamadas.proyeccion, 1);
});

test('dos lotes distintos son dos llamadas', async () => {
  const c = contador();
  const proxy = cachedAiSource(c.real);

  await proxy.projection('lote-1');
  await proxy.projection('lote-2');

  assert.equal(c.llamadas.proyeccion, 2);
  // Y cada uno recibe lo suyo, no el del otro
  assert.deepEqual((await proxy.projection('lote-1')).notes, ['lote-1']);
  assert.deepEqual((await proxy.projection('lote-2')).notes, ['lote-2']);
  assert.equal(c.llamadas.proyeccion, 2);
});

test('la proyeccion se vuelve a pedir cuando vence', async () => {
  const c = contador();
  const t = reloj();
  const proxy = cachedAiSource(c.real, { ahora: t.ahora });

  await proxy.projection('lote-1');
  t.avanzar(PROYECCION_VIVE_MS + 1);
  await proxy.projection('lote-1');

  assert.equal(c.llamadas.proyeccion, 2);
});

// ---------- sincronizar es lo que de verdad invalida ----------

test('despues de sincronizar se vuelve a preguntar todo', async () => {
  /*
   * La otra mitad del diseño: la caché no adivina cuándo quedó vieja, se lo dicen. Si el cuidador
   * registra una mortalidad y sincroniza, la pantalla no puede seguir mostrando la supervivencia
   * de antes.
   */
  const c = contador();
  const proxy = cachedAiSource(c.real);

  await proxy.available();
  await proxy.projection('lote-1');
  proxy.forget();

  await proxy.available();
  await proxy.projection('lote-1');

  assert.equal(c.llamadas.salud, 2);
  assert.equal(c.llamadas.proyeccion, 2);
});

test('se puede olvidar un solo lote', async () => {
  const c = contador();
  const proxy = cachedAiSource(c.real);

  await proxy.projection('lote-1');
  await proxy.projection('lote-2');
  proxy.forget('lote-1');

  await proxy.projection('lote-1');
  await proxy.projection('lote-2');

  assert.equal(c.llamadas.proyeccion, 3, 'solo el olvidado se volvio a pedir');
});

test('olvidar se lo pasa tambien al sujeto real', async () => {
  // Para que una cadena de varios Proxy funcione: cada uno limpia lo suyo y avisa al de abajo
  const c = contador();
  const proxy = cachedAiSource(c.real);
  proxy.forget('lote-1');
  assert.equal(c.llamadas.olvidar, 1);
});

test('atender un hallazgo invalida lo guardado del lote', async () => {
  const c = contador();
  const proxy = cachedAiSource(c.real);

  await proxy.projection('lote-1');
  await proxy.attend('hallazgo-1', 'cel-1');
  await proxy.projection('lote-1');

  assert.equal(c.llamadas.proyeccion, 2, 'escribir invalida');
});

// ---------- lo que no se guarda, y es a proposito ----------

test('lo que fallo no se guarda', async () => {
  /*
   * Guardar un error convertiría un minuto malo en dos. Y la pantalla tiene que poder distinguir
   * "no se pudo preguntar" de "no hay nada que mostrar".
   */
  const c = contador();
  c.romper();
  const proxy = cachedAiSource(c.real);

  await assert.rejects(() => proxy.projection('lote-1'));
  await assert.rejects(() => proxy.projection('lote-1'));

  assert.equal(c.llamadas.proyeccion, 2);
});

test('despues de un fallo, la siguiente respuesta buena si se guarda', async () => {
  const c = contador();
  c.romper();
  const proxy = cachedAiSource(c.real);
  await assert.rejects(() => proxy.projection('lote-1'));

  c.arreglar();
  await proxy.projection('lote-1');
  await proxy.projection('lote-1');

  assert.equal(c.llamadas.proyeccion, 2, 'el fallo, la buena, y la buena servida de lo guardado');
});

test('las listas de hallazgos nunca se guardan', async () => {
  /*
   * Llegan hallazgos nuevos por el stream mientras la pantalla está abierta, así que una lista
   * guardada envejece sola y sin avisar. Y useFindings ya las tiene en el estado de React mientras
   * la pantalla vive, que es justo lo que una caché daría.
   */
  const c = contador();
  const proxy = cachedAiSource(c.real);

  await proxy.pendingFindings();
  await proxy.pendingFindings();
  await proxy.pondFindings('estanque-1');
  await proxy.batchFindings('lote-1');

  assert.equal(c.llamadas.pendientes, 4, 'las cuatro salieron a la red');
});

// ---------- la interfaz comun, que es lo que lo vuelve un Proxy ----------

test('quien pregunta no distingue el proxy del sujeto real', async () => {
  /*
   * La cuarta ventaja del patrón. La fachada recibe un AiSource y no tiene forma de saber si habló
   * con el backend o con lo ya sabido; cambiar uno por el otro no rompe nada, solo cambia cuántas
   * llamadas salen.
   */
  const c = contador();
  const fuentes: AiSource[] = [c.real, cachedAiSource(c.real)];

  for (const fuente of fuentes) {
    assert.equal(await fuente.available(), true);
    assert.equal((await fuente.projection('lote-1')).projectedWeightG, 50.6);
    assert.deepEqual(await fuente.pendingFindings(), []);
    fuente.forget();
  }
});

test('poner dos proxies encima no cambia la respuesta', async () => {
  const c = contador();
  const doble = cachedAiSource(cachedAiSource(c.real));

  assert.equal(await doble.available(), true);
  assert.equal(await doble.available(), true);
  assert.equal(c.llamadas.salud, 1);
});
