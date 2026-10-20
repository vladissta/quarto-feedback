# Development

Use Node.js 22 or later and npm. The extension runtime uses only the editor API; dependencies are development-only.

```sh
npm ci
npm run check
npm test
npm run package
```

The generated VSIX is in `dist/`. `npm run package:contents` lists exactly what will be shipped. Tests, scripts, lockfiles, examples and development dependencies are excluded by `.vscodeignore`.

## Real editor integration tests

Run an isolated extension-host test using an installed editor executable. The runner creates a short temporary profile path, does not load user extensions or workspaces, and writes results to `test-results/host.json` (or `QF_TEST_RESULTS`). It removes test files and tries to remove its temporary profile after a successful run; a still-busy profile is retained with its path printed. It never edits a user's assignment.

macOS VS Code:

```sh
QF_EDITOR='/Applications/Visual Studio Code.app/Contents/MacOS/Code' npm run test:host
```

macOS Positron:

```sh
QF_EDITOR='/Applications/Positron.app/Contents/MacOS/Positron' npm run test:host
```

On other systems, set `QF_EDITOR` to the corresponding actual editor executable. Do not use the `bin/code` wrapper for these tests. In headless Linux, provide a display (for example with `xvfb-run`).

The integration runner tests activation, shared markers, forward/reverse selections, exclusive final-line boundaries, cursor placement, undo, editing existing feedback, numbering, CRLF and uppercase file extensions. It invokes the command directly; it does not synthesize physical keyboard shortcuts.

## Release identity

The public extension ID is `vladissta.quarto-feedback`. Earlier local builds use `local-feedback.quarto-feedback`. Do not load both in the same extension host.
