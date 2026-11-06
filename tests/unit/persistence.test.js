import assert from 'node:assert/strict'
import { test } from 'node:test'
import { freshStore } from './helpers.js'
import { documentSnapshot, MAX_SOURCE_LENGTH } from '../../src/utilities/document-validation.js'

function withStorage(storage, work) {
  globalThis.window = { get sessionStorage() { return storage() } }
  try { work() } finally { delete globalThis.window }
}

test('unavailable storage and quota errors preserve editing', () => {
  withStorage(() => { throw new Error('denied') }, () => {
    const store = freshStore('x = 1')
    assert.match(store.persistenceError, /unavailable/)
    store.flushPersistence()
    assert.match(store.persistenceError, /Could not save/)
    assert.equal(store.pythonCode, 'x = 1')
  })
  withStorage(() => ({ getItem: () => null, setItem: () => { throw new Error('quota') } }), () => {
    const store = freshStore('x = 2')
    store.flushPersistence()
    assert.match(store.persistenceError, /Could not save/)
    assert.equal(store.pythonCode, 'x = 2')
  })
})

test('restoration validates a versioned document and derives its Python', () => {
  const state = documentSnapshot(freshStore('x = 1').$state)
  state.pythonCode = 'stale / untrusted cache'
  withStorage(() => ({ getItem: () => JSON.stringify(state) }), () => {
    const store = freshStore()
    assert.equal(store.pythonCode, 'x = 1')
    assert.equal(store.persistenceError, '')
  })
})

for (const corruption of ['version', 'missing', 'cycle', 'shared', 'type', 'shape']) {
  test(`rejects corrupted persisted documents: ${corruption}`, () => {
    const state = documentSnapshot(freshStore('while True:\n    print(1)').$state)
    const loop = state.blocks[state.rootBody[0]]
    if (corruption === 'version') state.schemaVersion = 999
    if (corruption === 'missing') delete state.blocks[loop.body[0]]
    if (corruption === 'cycle') loop.body.push(loop.id)
    if (corruption === 'shared') state.rootBody.push(loop.id)
    if (corruption === 'type') loop.type = 'constructor'
    if (corruption === 'shape') loop.body = 'wrong'
    withStorage(() => ({ getItem: () => JSON.stringify(state) }), () => {
      const store = freshStore()
      assert.equal(store.rootBody.length, 0)
      assert.match(store.persistenceError, /not restored/)
    })
  })
}

test('failed and oversized imports leave the existing program intact', () => {
  const store = freshStore('x = 1')
  const before = JSON.stringify(store.$state)
  assert.throws(() => store.importPythonCode('x'.repeat(MAX_SOURCE_LENGTH + 1)), /limited/)
  assert.equal(JSON.stringify(store.$state), before)
  const deep = Array.from({ length: 102 }, (_, i) => '    '.repeat(i) + 'while True:').join('\n') + '\n' + '    '.repeat(102) + 'pass'
  assert.throws(() => store.importPythonCode(deep), /oversized/)
  assert.equal(JSON.stringify(store.$state), before)
})

test('persistence stores a schema version and excludes unattached palette nodes', () => {
  let saved
  withStorage(() => ({ getItem: () => null, setItem: (_key, value) => { saved = JSON.parse(value) } }), () => {
    const store = freshStore('x = 1')
    const orphan = store.createBlock('print')
    store.flushPersistence()
    assert.equal(saved.schemaVersion, 1)
    assert.equal(saved.blocks[orphan], undefined)
    assert.equal(saved.pythonCode, undefined)
  })
})
