import assert from 'node:assert/strict'
import { test } from 'node:test'
import { freshStore, pythonOutput } from './helpers.js'

test('incomplete expression slots produce structured run-blocking diagnostics', () => {
  const store = freshStore('x = 1')
  store.deleteBlock(store.blocks[store.rootBody[0]].slots.value)
  assert.equal(store.diagnostics[0].code, 'missing-expression')
  assert.equal(store.diagnostics[0].slot, 'value')
})

for (const damage of ['missing', 'type', 'cycle']) {
  test(`refresh survives corrupted documents: ${damage}`, () => {
    const store = freshStore('while True:\n    print(1)')
    const loop = store.blocks[store.rootBody[0]]
    if (damage === 'missing') delete store.blocks[loop.body[0]]
    if (damage === 'type') loop.type = 'unknown'
    if (damage === 'cycle') loop.body.push(loop.id)
    store.refresh()
    assert.equal(store.diagnostics[0].code, 'invalid-document')
    assert.match(store.pythonCode, /Invalid document/)
  })
}

test('optional return value and slice fields are valid incomplete-free constructs', () => {
  const store = freshStore('def f():\n    return\nvalue = [1, 2][::-1]\nprint(f())')
  assert.deepEqual(store.diagnostics, [])
  assert.equal(pythonOutput(store.pythonCode), 'None\n')
})
