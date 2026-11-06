import assert from 'node:assert/strict'
import { test } from 'node:test'
import { freshStore } from './helpers.js'

for (const kind of ['slot', 'arg']) {
  test(`promote descendant into ancestor ${kind}`, () => {
    const store = freshStore(kind === 'slot' ? 'x = 1 + 2' : 'f(1 + 2)')
    const parent = store.blocks[store.rootBody[0]]
    const oldId = kind === 'slot' ? parent.slots.value : parent.args[0]
    const incoming = store.blocks[oldId].slots.left
    const removedSibling = store.blocks[oldId].slots.right
    if (kind === 'slot') store.dropInSlot(incoming, parent.id, 'value')
    else store.dropInArg(incoming, parent.id, 0)
    assert.equal(store.blocks[incoming].parentId, parent.id)
    assert.equal(store.blocks[oldId], undefined)
    assert.equal(store.blocks[removedSibling], undefined)
    assert.equal(store.pythonCode, kind === 'slot' ? 'x = 1' : 'f(1)')
  })
}
