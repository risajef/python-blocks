import assert from 'node:assert/strict'
import { test } from 'node:test'
import { freshStore } from './helpers.js'

test('deleting an argument after removing an earlier argument clears its new slot', () => {
  const store = freshStore('f(1, 2, 3)')
  const call = store.blocks[store.rootBody[0]]
  const child = call.args[1]
  store.removeArgSlot(call.id, 0)
  assert.equal(store.blocks[child].parentCtx, 'arg:0')
  store.deleteBlock(child)
  assert.equal(call.args[0], null)
  assert.equal(store.pythonCode, 'f(3)')
})

for (const kind of ['except', 'match']) {
  test(`${kind} bodies retain valid contexts after removing an earlier container`, () => {
    const store = freshStore(kind === 'except'
      ? 'try:\n    f()\nexcept ValueError:\n    a()\nexcept TypeError:\n    b()'
      : 'match 1:\n    case 1:\n        a()\n    case 2:\n        b()')
    const parent = store.blocks[store.rootBody[0]]
    const items = kind === 'except' ? parent.exceptHandlers : parent.matchCases
    const child = items[1].body[0]
    if (kind === 'except') store.removeExceptHandler(parent.id, 0)
    else store.removeMatchCase(parent.id, 0)
    assert.equal(store.blocks[child].parentCtx, kind === 'except' ? 'exceptBody:0' : 'matchCase:0')
    store.dropInBody(child, null, 'body', null)
    assert.equal(items[0].body.length, 0)
    store.deleteBlock(child)
    assert.equal(store.blocks[child], undefined)
    assert.ok(!store.pythonCode.includes('b()'))
  })
}
