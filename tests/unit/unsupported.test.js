import { test } from 'node:test'
import { assertRoundTrip } from './helpers.js'

for (const source of [
  'import inspect\nasync def f():\n    return 1\nprint(inspect.iscoroutinefunction(f))',
  'def f() -> int:\n    return 1\nprint(f.__annotations__)',
  'def f(x=3):\n    return x\nprint(f())',
  'def f(x: int, /, *, y=2):\n    return x + y\nprint(f(3))',
  'def f(*args, **kwargs):\n    return len(args) + len(kwargs)\nprint(f(1, x=2))',
  'for x in range(3):\n    pass\nelse:\n    print("done")',
  'while False:\n    pass\nelse:\n    print("done")',
  'print(1, 2, sep="/")',
]) test(`unsupported details survive: ${source.split('\n')[0]}`, () => assertRoundTrip(source))
