import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canListen, canSpeak, listenErrorMessage, toSpeech } from './voice';

test('quita el Markdown y separa títulos y puntos de lista en oraciones', () => {
  const answer = '## Ración de hoy\n- **Lote L1**: 4,08 kg en 3 tomas\n- Revisa el *oxígeno*';
  assert.equal(toSpeech(answer), 'Ración de hoy. Lote L1: 4,08 kilos en 3 tomas. Revisa el oxígeno.');
});

test('dice las unidades por su nombre', () => {
  assert.equal(toSpeech('El agua está a 16,8 °C'), 'El agua está a 16,8 grados.');
  assert.equal(toSpeech('Oxígeno 5,4 mg/L'), 'Oxígeno 5,4 miligramos por litro.');
  assert.equal(toSpeech('pH 7,1'), 'pe hache 7,1.');
  assert.equal(toSpeech('Peso promedio 145 g'), 'Peso promedio 145 gramos.');
  assert.equal(toSpeech('Estanque de 80 m³'), 'Estanque de 80 metros cúbicos.');
  assert.equal(toSpeech('Óptimo 10–16 °C'), 'Óptimo 10 a 16 grados.');
});

test('no confunde palabras con unidades', () => {
  // "g" y "kg" solo cuentan pegados a un número
  assert.equal(toSpeech('Hay 3 lotes grandes'), 'Hay 3 lotes grandes.');
});

test('no lee emojis', () => {
  assert.equal(toSpeech('🌡️ Temperatura en rango ✅'), 'Temperatura en rango.');
});

test('respeta la puntuación que ya trae', () => {
  assert.equal(toSpeech('¿Todo bien?\n\nSí.'), '¿Todo bien? Sí.');
});

test('los errores del micrófono salen en español y dicen qué hacer', () => {
  assert.match(listenErrorMessage('not-allowed'), /permiso/);
  assert.match(listenErrorMessage('no-speech'), /No te escuché/);
  assert.match(listenErrorMessage('network'), /internet/);
  assert.match(listenErrorMessage('otro-codigo'), /Inténtalo otra vez/);
});

test('sin navegador no promete voz', () => {
  assert.equal(canListen(), false);
  assert.equal(canSpeak(), false);
});
