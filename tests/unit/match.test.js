import { test } from 'node:test'
import { assertRoundTrip, freshStore, pythonOutput } from './helpers.js'
import assert from 'node:assert/strict'

test('match at root and inside a function preserves behavior', () => {
  assertRoundTrip('match 1:\n    case 1:\n        print("one")')
  assertRoundTrip('def f(x):\n    match x:\n        case n if n > 0:\n            match n:\n                case 1:\n                    return "one"\n                case _:\n                    return "other"\n        case _:\n            return "zero"\nprint(f(1))')
})

test('empty case body emits valid pass', () => {
  const store = freshStore('match 1:\n    case 1:\n        print("one")')
  const match = store.blocks[store.rootBody[0]]
  store.deleteBlock(match.matchCases[0].body[0])
  assert.equal(pythonOutput(store.pythonCode), '')
})
