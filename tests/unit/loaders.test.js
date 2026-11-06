import { test } from 'node:test'
import assert from 'node:assert/strict'
import { retryableLoader } from '../../src/utilities/retryable-loader.js'
import { ensurePyScriptStylesheet } from '../../src/utilities/pyscriptRunner.js'

test('failed module loads can retry and successful/concurrent loads are shared', async () => {
  let attempts = 0
  const load = retryableLoader(async () => {
    if (++attempts === 1) throw new Error('offline')
    return { core: true }
  })
  assert.equal(load(), load())
  await assert.rejects(load(), /offline/)
  const result = await load()
  assert.equal(await load(), result)
  assert.equal(attempts, 2)
})

test('failed stylesheet is removed and a fresh stylesheet can load', async () => {
  let current
  let removed = 0
  globalThis.window = {}
  globalThis.document = {
    getElementById: () => current,
    createElement: () => Object.assign(new EventTarget(), { remove() { current = null; removed++ } }),
    head: { append: node => { current = node } },
  }
  try {
    const failed = ensurePyScriptStylesheet()
    await Promise.resolve()
    current.dispatchEvent(new Event('error'))
    await assert.rejects(failed, /Retry Run/)
    assert.equal(removed, 1)
    const retry = ensurePyScriptStylesheet()
    await Promise.resolve()
    current.dispatchEvent(new Event('load'))
    assert.equal(await retry, current)
  } finally { delete globalThis.window; delete globalThis.document }
})
