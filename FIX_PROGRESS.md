# Python Blocks fix progress

Scope: findings in the 6 November 2026 Python Blocks review, starting at `292e133`. All changes and commits stay in this subrepository. Parent site deployment and parent submodule pointer are intentionally untouched.

Each completed item is a separate commit including its regression checks and this log. Commit hashes can be found with `git log --oneline -- FIX_PROGRESS.md`.

| Item | Status | Change and validation |
| --- | --- | --- |
| 1. Literal semantics | Done | Decode simple escapes once; preserve complex/bytes/concatenated/formatted literal source with raw expression fallback. Twelve CPython value/type round trips pass (`npm run test:unit`). |
| 2. Expression grouping | Done | Group compound comparison/primary operands and preserve tuple arity, including multidimensional slice indices. Eight CPython/manual-block regressions pass. |
| 3. Match indentation | Done | Cases and case bodies use their correct depths. CPython verifies top-level, nested, guarded, and empty case bodies. |
| 4. Tree move validation | Pending | |
| 5. Descendant promotion | Pending | |
| 6. Positional parent contexts | Pending | |
| 7. Cancellable execution boundary | Pending | |
| 8. Unsupported syntax preservation | Pending | |
| 9. Runtime lifecycle | Pending | |
| 10. Persistence resilience | Pending | |
| Additional review concerns | Pending | Loader retries, source logging, diagnostics, dependencies, deployment assumptions, stale artifacts, and CI. |

Unit tests use Node's built-in runner and installed CPython (`python3`) for semantic comparisons. Browser checks and locked-toolchain validation will be recorded separately; neither is implied by passing Node tests.
