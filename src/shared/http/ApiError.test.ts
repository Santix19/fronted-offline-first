import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError } from './ApiError';

const answer = (status: number, detalle?: string) => new Response(JSON.stringify(detalle ? { detalle } : {}), { status });

test('a generic missing-route answer reads as a feature the server does not have yet', async () => {
  const error = await ApiError.fromResponse(answer(404, 'ruta no encontrada'));
  assert.equal(error.kind, 'client');
  assert.match(error.message, /todavía no tiene esta función/);
});

test('a specific 404 keeps the sentence the backend wrote for the caretaker', async () => {
  const error = await ApiError.fromResponse(answer(404, 'lote no encontrado'));
  assert.equal(error.message, 'lote no encontrado');
});

test('server errors are temporary, client errors are not', async () => {
  assert.equal((await ApiError.fromResponse(answer(503, 'caído'))).isTemporary, true);
  assert.equal((await ApiError.fromResponse(answer(422, 'dato inválido'))).isTemporary, false);
});
