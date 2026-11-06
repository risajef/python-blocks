import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPyScriptRunner, createWorkerRunner } from '../../src/utilities/pyscriptRunner.js'

test('unsupported environments refuse execution before loading external code', async () => {
  globalThis.window = { crossOriginIsolated: false }
  globalThis.document = {}
  try {
    await assert.rejects(createPyScriptRunner(), /main-thread execution is disabled/)
  } finally {
    delete globalThis.window
    delete globalThis.document
  }
})

test('worker adapter exposes actual termination and delegates operations', async () => {
  const calls = []
  const runner = await createWorkerRunner(async options => {
    assert.equal(options.type, 'py')
    return Object.fromEntries(['reset', 'process', 'clear', 'kill'].map(name => [name, (...args) => calls.push([name, ...args])]))
  }, { terminal: '#output' })
  await runner.process('while True: pass')
  runner.kill()
  assert.deepEqual(calls, [['process', 'while True: pass'], ['kill']])
})
