import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRuntimeSession } from '../../src/utilities/runtime-session.js'

function deferred() { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }
function runner(overrides = {}) { return { reset: async () => {}, process: async () => {}, clear: async () => {}, kill() {}, ...overrides } }

for (const action of ['reset', 'dispose']) {
  test(`${action} kills initialization that completes late`, async () => {
    const loading = deferred()
    let killed = 0
    const session = createRuntimeSession(() => loading.promise)
    const run = session.run('old')
    session[action]()
    loading.resolve(runner({ kill: () => { killed++ } }))
    assert.equal(await run, false)
    assert.equal(killed, 1)
  })
}

test('old execution completion cannot finish a replacement run', async () => {
  const execution = deferred()
  let killed = 0
  let instances = 0
  const session = createRuntimeSession(async () => ++instances === 1
    ? runner({ process: () => execution.promise, kill: () => { killed++ } }) : runner())
  const oldRun = session.run('old')
  await new Promise(resolve => setImmediate(resolve))
  session.reset()
  assert.equal(await session.run('new'), true)
  execution.resolve()
  assert.equal(await oldRun, false)
  assert.equal(killed, 1)
})

test('clear and subsequent run reuse the same live runner', async () => {
  let created = 0
  const sources = []
  const session = createRuntimeSession(async () => { created++; return runner({ process: async code => sources.push(code) }) })
  await session.run('first')
  await session.clear()
  await session.run('second')
  assert.equal(created, 1)
  assert.deepEqual(sources, ['first', 'second'])
})
