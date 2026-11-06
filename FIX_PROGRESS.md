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
| 8. Unsupported syntax preservation | Done | Preserve async constructs, return annotations, complex parameter signatures, and unsupported mapped statements as whole raw statements. CPython verifies coroutine identity, annotations, defaults, variadics, and loop-else behavior. |
| 9. Runtime lifecycle | Done | Keep the output target mounted, retire asynchronous generations on reset/unmount, kill late initialization, capture run source, and disable clear during execution. Deferred-promise lifecycle tests pass. |
| 10. Persistence resilience | Done | Guard all storage access, validate/version snapshots, derive restored Python, debounce writes with pagehide flush, bound imports, and commit imported documents atomically. Denied/quota/corruption/oversize regressions pass. |
| Loader retries | Done | Share concurrent loads, discard rejected promises, remove failed stylesheet nodes, and retry failed stylesheet/module loading. Retry and concurrency tests pass. |
| Source logging | Done | Full pasted-source diagnostics require explicit `parsePythonToBlocks(source, { debug: true })`; normal failures log no source. Opt-in/opt-out tests pass. |
| Document diagnostics | Done | Structured diagnostics identify missing slots and invalid references/types; Run is blocked for incomplete/corrupt documents. Refresh validates before generating and unknown nodes fail explicitly. Regression tests pass. |
| Unused dependencies | Done | Removed nine unused direct dependencies and pruned the lockfile with npm offline. Source imports no longer depend on those packages. Clean-install verification is recorded below. |
| Deployment assumptions | Done | Relative asset base/favicon, hash routing, local styles, and accurate application title make the source build self-contained at static-host subpaths. Production-header requirements are documented; parent integration unchanged. |
| Stale artifacts | Done | Removed the broken tracked deployment entry and duplicate generated icon; builds now target ignored `dist/`. The source entry/public icon are authoritative. Parent build continues supplying its own output directory. |
| Dependency advisories | Done | A clean install exposed eight advisory entries. Compatible lockfile updates (including Vue 3.5.45, Vite 8.3.6, and PostCSS 8.5.32) report zero npm audit vulnerabilities. Unit regressions and the locked-toolchain production build pass. |
| Worker program API | Done | The live smoke test revealed `donkey.process` feeds terminal stdin rather than executing a program. The adapter now calls `execute` for complete programs; regression verifies the correct API. Live verification follows below. |
| CI and verification | Done | Added clean-install Node 24/Python 3.12 CI, separate browser-free importer config, Playwright Chromium configuration, runtime/storage regressions, and a static-subpath production test. Local results: 62 Node/CPython regressions, 42 importer tests, 68 browser tests, production build, and real CDN-backed worker smoke check pass. |

Unit tests use Node's built-in runner and installed CPython (`python3`) for semantic comparisons. Browser checks and locked-toolchain validation will be recorded separately; neither is implied by passing Node tests.

## Final verification (6 November 2026)

- Clean install completed and `npm ls --depth=0` reported consistent installed versions.
- `npm test`: Node/CPython regressions and all 42 importer tests pass. `node --test --test-isolation=none tests/unit/*.test.js` reports 62 individual cases.
- `npm run build`: passes with locked Vite 8.3.6; output stays in ignored `dist/`.
- `npm run test:e2e`: all 68 browser tests pass using cached Chromium with the executable-path override. Includes blocked storage, retained output target, cancellation, and built assets served at `/preview/editor/`.
- `npm run test:runtime`: real pinned PyScript CDN, repeated worker execution and infinite-loop reset pass. This network integration check is separate from deterministic CI.
- `npm audit`: zero reported vulnerabilities after compatible dependency updates.
- No parent source, hosting settings, parent Git index, or parent submodule pointer was changed. No push or deployment was performed.

Production execution still needs cross-origin-isolation headers (and a suitable embedding policy). Those deployment changes are deliberately deferred because the parent site must remain unchanged. Editing and Python import/export remain available without isolation; Run explains the requirement. A dedicated origin remains necessary if the hosting product is intended to run untrusted programs; workers provide cancellation, not authority isolation.
