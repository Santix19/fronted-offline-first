import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rejectionText } from './rejectionText';

test('a phone clock set before 2024 is explained with what to do', () => {
  const text = rejectionText('registrado_en: fecha anterior a 2024 (reloj sin configurar)');
  assert.doesNotMatch(text, /registrado_en/);
  assert.match(text, /reloj del celular/);
});

test('a date in the future also points at the phone clock', () => {
  assert.match(rejectionText('registrado_en: fecha en el futuro'), /fecha y la hora del celular/);
});

test('known field rules read as plain sentences', () => {
  assert.equal(rejectionText('ph: debe ser menor que o igual a 14'), 'El pH tiene que estar entre 0 y 14.');
  assert.equal(rejectionText('cantidad: debe ser mayor que o igual a 1'), 'La cantidad tiene que ser 1 o más.');
  assert.equal(rejectionText('kg: debe ser mayor que 0'), 'Los kilos tienen que ser más de 0.');
});

test('an unknown field reason loses the field name and keeps the reason', () => {
  assert.equal(rejectionText('codigo: ya existe en este estanque'), 'Ya existe en este estanque');
});

test('a sentence the backend already wrote for people is shown as it came', () => {
  assert.equal(rejectionText('El lote está cerrado'), 'El lote está cerrado');
});
