import { test } from 'node:test'
import { assertRoundTrip } from './helpers.js'

for (const literal of [
  String.raw`"\x41"`, String.raw`"\\n"`, 'b"abc"', '"a" "b"',
  String.raw`f"line\n{1}"`, String.raw`rf"line\n{1}"`,
  String.raw`"\u0041"`, String.raw`"\101"`, String.raw`"\q"`,
  String.raw`r'can\'t'`, '"simple"', String.raw`"a\tb\n"`,
]) {
  test(`literal preserves value and type: ${literal}`, () => {
    assertRoundTrip(`value = ${literal}\nprint(type(value).__name__)\nprint(repr(value))`)
  })
}
