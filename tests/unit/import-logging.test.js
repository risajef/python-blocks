import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parsePythonToBlocks } from '../../src/utilities/python-to-blocks.js'

test('import diagnostics never log full source without explicit opt-in', () => {
  const output = []
  const methods = ['log', 'error', 'groupCollapsed', 'groupEnd']
  const saved = Object.fromEntries(methods.map(key => [key, console[key]]))
  for (const key of methods) console[key] = (...args) => output.push(args.join(' '))
  const source = 'secret = "private value"\nif :'
  try {
    assert.throws(() => parsePythonToBlocks(source))
    assert.equal(output.length, 0)
    assert.throws(() => parsePythonToBlocks(source, { debug: true }))
    assert.ok(output.some(line => line.includes(source)))
  } finally { Object.assign(console, saved) }
})
