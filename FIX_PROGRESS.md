# Python Blocks fix progress

Scope: findings in the 6 November 2026 Python Blocks review, starting at `292e133`. All changes and commits stay in this subrepository. Parent site deployment and parent submodule pointer are intentionally untouched.

Each completed item is a separate commit including its regression checks and this log. Commit hashes can be found with `git log --oneline -- FIX_PROGRESS.md`.

| Item | Status | Change and validation |
| --- | --- | --- |
| 1. Literal semantics | Done | Decode simple escapes once; preserve complex/bytes/concatenated/formatted literal source with raw expression fallback. Twelve CPython value/type round trips pass (`npm run test:unit`). |
| 2. Expression grouping | Done | Group compound comparison/primary operands and preserve tuple arity, including multidimensional slice indices. Eight CPython/manual-block regressions pass. |
| 3. Match indentation | Done | Cases and case bodies use their correct depths. CPython verifies top-level, nested, guarded, and empty case bodies. |
| 4. Tree move validation | Done | Validate category, destination, and ancestry before detaching; iterative traversal terminates on corrupt cycles. Rejected moves preserve state in regression tests. |
| 5. Descendant promotion | Done | Preserve the incoming subtree before deleting its old ancestor, then refresh once. Slot and argument promotion regressions pass. |
| 6. Positional parent contexts | Done | Reindex owned children after argument/handler/case removal and generate once per removal. Delete-after-splice and move-after-splice regressions pass. |
| 7. Cancellable execution boundary | Done | Removed unsafe main-thread fallback; require worker/isolation before CDN loading. Reset terminates the worker; local dev/preview send isolation headers. Adapter and unsupported-environment tests pass. Production headers/dedicated-origin hosting need a later deployment change; parent site remains untouched. |
| 8. Unsupported syntax preservation | Pending | |
| 9. Runtime lifecycle | Pending | |
| 10. Persistence resilience | Pending | |
| Additional review concerns | Pending | Loader retries, source logging, diagnostics, dependencies, deployment assumptions, stale artifacts, and CI. |

Unit tests use Node's built-in runner and installed CPython (`python3`) for semantic comparisons. Browser checks and locked-toolchain validation will be recorded separately; neither is implied by passing Node tests.
