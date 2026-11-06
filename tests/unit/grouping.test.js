import { test } from 'node:test'
import { assertRoundTrip, freshStore, pythonOutput } from './helpers.js'
import assert from 'node:assert/strict'

for (const expr of ['(1 < 2) == True', '(not False) == True', '(lambda: 3)()', '(lambda: 3).__name__', '(1, 2)[0]', '(1,)', '(not False) + 1']) {
  test(`expression grouping: ${expr}`, () => assertRoundTrip(`value = ${expr}\nprint(value)`))
}

test('manually constructed single-item tuple remains a tuple', () => {
  const store = freshStore('value = 1\nprint(value)')
  const assignment = store.blocks[store.rootBody[0]]
  const tuple = store.createBlock('tupleExpr')
  const value = assignment.slots.value
  store.detach(value)
  store.blocks[tuple].args = [value]
  store.blocks[value].parentId = tuple
  store.blocks[value].parentCtx = 'arg:0'
  store.dropInSlot(tuple, assignment.id, 'value')
  assert.equal(pythonOutput(store.pythonCode), '(1,)\n')
})
