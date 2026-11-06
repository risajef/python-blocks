import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createPinia, setActivePinia } from 'pinia'
import { usePythonBlocksStore } from '../../src/store/python-blocks.js'

export function freshStore(source) {
  setActivePinia(createPinia())
  const store = usePythonBlocksStore()
  if (source !== undefined) store.importPythonCode(source)
  return store
}

export function pythonOutput(source) {
  const result = spawnSync('python3', ['-I', '-c', source], { encoding: 'utf8', timeout: 3000 })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  return result.stdout
}

export function assertRoundTrip(source) {
  const store = freshStore(source)
  assert.equal(pythonOutput(store.pythonCode), pythonOutput(source), store.pythonCode)
  return store
}
