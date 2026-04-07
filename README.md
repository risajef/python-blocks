# Python Blocks Editor

A block-based Python editor built with Vue 3 and Pinia. You build programs from visual blocks, inspect the generated Python live, import Python back into the canvas, and run the result in the browser with PyScript.

The app is now focused entirely on the Python Blocks editor surface. The older alternate builder UI is no longer the product described here.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Current Feature Set

* Block-based canvas for building Python programs from statement and expression blocks.
* Live Python generation as you edit the canvas.
* Python import back into blocks.
* In-browser execution through PyScript from the bottom runtime dock.
* Keyboard-first block insertion and editing through a selector overlay.
* Session persistence for the canvas, generated code, and simple-mode state.
* Simple mode for a reduced beginner-friendly palette.

## Supported Python Features

The editor currently supports a fairly broad subset of Python across both manual block editing and Python import.

### Statements

* Assignment and augmented assignment.
* Imports: `import` and `from ... import ...`, including aliases and multi-name imports.
* `print(...)` and `input(...)`.
* `for`,   `while`,   `if / else`,   `break`, and `continue`.
* `try / except / else / finally`.
* `raise`,   `with`, and `match / case`.
* `def`,   `class`,   `return`,   `yield`, and statement-form function calls.
* Comments are supported as blocks.

### Expressions

* Variables, booleans, and numeric literals.
* Short strings, triple-quoted strings,   `f`-strings, and raw strings.
* Binary operators, comparisons, boolean operators, and `not`.
* Attribute access, subscripts, and slices.
* Tuples, lists, dictionaries, and dictionary entries.
* List comprehensions, dictionary comprehensions, and generator expressions.
* Expression-form `yield`, expression-form function calls, and `lambda`.
* Conditional expressions such as `a if cond else b`.

### Python Import Coverage

The importer is intended for real Python, not toy examples only. It currently covers:

* Qualified calls and attribute chains.
* Subscript assignment targets and multidimensional indices.
* List and dictionary comprehensions.
* Generator expressions passed into calls such as `any(...)` and `all(...)`.
* Decorators, annotated fields, raw strings, triple-quoted strings, and `f`-strings.
* Valid edge cases such as quote-heavy triple-quoted string literals.

When the importer cannot represent a construct precisely, it falls back to raw statement or raw expression blocks instead of silently discarding code.

## Editing Workflow

### Mouse Controls

| Action | How |
|---|---|
| Delete a block | Double-click it, or click the small `✕` button |
| Move a statement or expression | Drag it to a new body or slot |
| Replace an expression | Drop another expression onto the filled slot |
| Clear the canvas | Click **Clear canvas** |
| Show generated Python | Open **Nerd mode** |

### Keyboard Controls

| Action | How |
|---|---|
| Move selection | Use arrow keys across blocks and drop zones |
| Insert into an empty zone | Focus the zone, type to filter, then press `Enter` |
| Change selector choice | Use `ArrowUp` / `ArrowDown` |
| Edit terminal blocks | Focus the block and press `Enter` , or just start typing |
| Return from an editor to the block | Press `Escape` |

The selector overlay supports fuzzy-ish text filtering through aliases, so terms like `boolean` , `regex` , `generator` , `call` , or `list` can help narrow block choices quickly.

## Nerd Mode

The right-hand panel contains the code-facing tools:

* Generated Python output.
* Copy-to-clipboard for the current Python.
* Python import textarea with success and error feedback.
* A concise summary of the currently supported import surface.

## Runtime Panel

The bottom dock runs the generated Python in the browser.

* First run loads PyScript automatically.
* Output stays hidden until execution begins.
* `Clear output` collapses the terminal again.
* `Reset runtime` fully recreates the PyScript session.
* When cross-origin isolation is unavailable, execution falls back to main-thread mode and `input()` uses the browser prompt.

## Persistence

The editor stores its state in `sessionStorage` , including:

* Blocks on the canvas.
* Generated Python.
* Simple mode state.
* Nerd mode collapsed/open state.

This persistence is session-scoped rather than long-term project storage.

## Development

```bash
npm run dev
npm run build
npm run preview
```

* `npm run dev` starts the Vite dev server.
* `npm run build` writes the production build to `docs/`.
* `npm run preview` serves the production build locally.

## Testing

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

For targeted validation during development, these are the most useful commands:

```bash
npx playwright test tests/e2e/python-import.spec.js
npx playwright test tests/e2e/python-blocks.spec.js
npm run build
```

Playwright uses Chrome, so a local Chrome installation is expected.

## Stack

* Vue 3
* Pinia
* Vue Router
* Vite
* Playwright
* `@lezer/python` for parsing imported Python
* PyScript for in-browser execution

## Recommended IDE Setup

* VS Code
* Volar
