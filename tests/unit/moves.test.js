import assert from 'node:assert/strict'
import { test } from 'node:test'
import { freshStore } from './helpers.js'

function unchanged(store, action) {
  const before = JSON.stringify(store.$state)
  action()
  assert.equal(JSON.stringify(store.$state), before)
}

test('body moves reject cycles and invalid destinations without detaching', () => {
  const store = freshStore('while True:\n    if True:\n        print(1)')
  const loop = store.rootBody[0]
  const nested = store.blocks[loop].body[0]
  unchanged(store, () => store.dropInBody(loop, loop, 'body', null))
  unchanged(store, () => store.dropInBody(loop, nested, 'body', null))
  unchanged(store, () => store.dropInBody(nested, 'missing', 'body', null))
  unchanged(store, () => store.dropInBody(nested, loop, 'missing', null))
  unchanged(store, () => store.dropInBody(nested, null, 'body', 'missing'))
})

test('slots reject cycles, missing slots, and statement inputs', () => {
  const store = freshStore('x = 1 + 2')
  const assignment = store.blocks[store.rootBody[0]]
  const expr = assignment.slots.value
  unchanged(store, () => store.dropInSlot(expr, expr, 'left'))
  unchanged(store, () => store.dropInSlot(expr, assignment.id, 'missing'))
  unchanged(store, () => store.dropInSlot(assignment.id, expr, 'left'))
  unchanged(store, () => store.dropInBody(expr, null, 'body', null))
})

test('descendant traversal terminates on a malformed cycle', () => {
  const store = freshStore('while True:\n    print(1)')
  const loop = store.rootBody[0]
  store.blocks[loop].body.push(loop)
  assert.equal(store.descendants(loop).length, Object.keys(store.blocks).length)
})
