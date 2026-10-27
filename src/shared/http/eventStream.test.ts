import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseEventBlock } from './eventStream';

/**
 * Pruebas del parser del formato de eventos del servidor.
 *
 * Hay que escribirlo a mano porque EventSource, que lo traería hecho, no puede mandar cabeceras, y
 * esta ruta pide el token en una. Lo que se comprueba aquí es que un bloque mal formado se
 * descarte en vez de reventar: el stream es un agregado, y nunca puede ser la razón de que una
 * pantalla deje de funcionar.
 */

test('un evento con su nombre y su data se vuelve objeto', () => {
  const event = parseEventBlock('event:hallazgo\ndata:{"tipo":"hallazgo","en":"2026-10-26T10:00:00Z"}');
  assert.equal(event?.tipo, 'hallazgo');
  assert.equal(event?.en, '2026-10-26T10:00:00Z');
});

test('el latido no es un evento', () => {
  // El servidor manda un comentario cada 20 s para que la conexión no parezca quieta. Son dos
  // bytes en el cable y no tienen data: si llegaran como evento, la pantalla se recargaría sola
  // cada veinte segundos para siempre.
  assert.equal(parseEventBlock(':ping'), null);
});

test('un bloque vacio no es un evento', () => {
  assert.equal(parseEventBlock(''), null);
  assert.equal(parseEventBlock('\n\n'), null);
});

test('un json roto se descarta en vez de reventar', () => {
  // Pasa cuando la conexión se corta a mitad de un evento. El stream es un agregado: que llegue
  // basura no puede tumbar la pantalla de conteo.
  assert.equal(parseEventBlock('event:hallazgo\ndata:{"tipo":"hall'), null);
});

test('una data partida en varias lineas se junta', () => {
  // El formato permite varias lineas data: y se unen con salto de linea en medio
  const event = parseEventBlock('data:{"tipo":\ndata:"listo","en":"2026-10-26T10:00:00Z"}');
  assert.equal(event?.tipo, 'listo');
});

test('se ignoran las lineas que no son data', () => {
  const event = parseEventBlock('id:42\nretry:3000\nevent:sincronizado\ndata:{"tipo":"sincronizado","en":"x","aceptados":143}');
  assert.equal(event?.tipo, 'sincronizado');
  assert.equal(event?.aceptados, 143);
});

test('un hallazgo llega entero, con los acentos puestos', () => {
  // Cada mensaje del análisis es una frase en español: "El oxígeno viene bajando". Si la
  // codificación se rompiera, se rompería justo aquí.
  const mensaje = 'El oxígeno viene bajando 0.4 mg/L por día. A este ritmo llega al límite mañana.';
  const event = parseEventBlock(
    `event:hallazgo\ndata:${JSON.stringify({ tipo: 'hallazgo', en: 'x', hallazgo: { mensaje } })}`,
  );
  assert.equal((event?.hallazgo as { mensaje: string }).mensaje, mensaje);
});

test('un evento de sincronizacion no trae totales', () => {
  // A propósito: la pantalla pregunta el total a la API, así que solo hay un lugar calculándolo
  const event = parseEventBlock('data:{"tipo":"sincronizado","en":"x","lote_id":"abc","aceptados":3}');
  assert.equal(event?.aceptados, 3);
  assert.ok(!('total' in (event as object)));
});
