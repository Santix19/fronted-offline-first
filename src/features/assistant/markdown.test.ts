import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseInline, parseMarkdown } from './markdown';

test('negritas y cursivas se separan del texto', () => {
  assert.deepEqual(parseInline('Dale **1,2 kg** hoy, *en 3 tomas*'), [
    { text: 'Dale ' },
    { text: '1,2 kg', bold: true },
    { text: ' hoy, ' },
    { text: 'en 3 tomas', italic: true },
  ]);
});

test('un guion bajo dentro de una palabra no es cursiva', () => {
  assert.deepEqual(parseInline('racion_diaria_kg'), [{ text: 'racion_diaria_kg' }]);
});

test('un informe se vuelve títulos, listas y párrafos', () => {
  const blocks = parseMarkdown('## Estanque 1\nEl agua está bien.\nSigue así.\n\n- pH 7,2\n- Oxígeno 8,1\n\n1. Uno\n2. Dos');
  assert.deepEqual(
    blocks.map((b) => b.kind),
    ['heading', 'paragraph', 'list', 'list'],
  );
  assert.equal(blocks[0].kind === 'heading' && blocks[0].level, 2);
  assert.equal(blocks[1].kind === 'paragraph' && blocks[1].inlines[0].text, 'El agua está bien. Sigue así.');
  assert.equal(blocks[2].kind === 'list' && blocks[2].ordered, false);
  assert.equal(blocks[2].kind === 'list' && blocks[2].items.length, 2);
  assert.equal(blocks[3].kind === 'list' && blocks[3].ordered, true);
});

test('las etiquetas HTML quedan como texto', () => {
  const [block] = parseMarkdown('<script>alert(1)</script>');
  assert.equal(block.kind === 'paragraph' && block.inlines[0].text, '<script>alert(1)</script>');
});
