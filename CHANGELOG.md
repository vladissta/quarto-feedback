# Changelog

## 0.1.1 — 2026-10-20

- Links the extension to its public source repository and issue tracker.
- Uses the same annotation runtime as 0.1.0.

## 0.1.0 — 2026-10-20

Prepared public release under publisher `vladissta`.

- Adds shared annotations to one or more selected code lines, with numbering local to each chunk.
- Moves the cursor directly to the feedback item below the chunk.
- Selects existing feedback for editing and preserves multiline descriptions.
- Preserves LF/CRLF endings and groups insertion into one undo step.
- Adds English and Russian UI messages and localized command titles.
- Matches `.qmd` extensions case-insensitively for keyboard activation.
- Adds MIT licensing, an extension icon, support/privacy documentation, and official VSIX packaging.
- Adds reproducible integration checks for VS Code and Positron.

## 0.0.2 — 2026-10-19 (local build)

- Inline feedback entry below code replaces the top input box.
- Adds selection support, existing-feedback navigation and empty-item handling.

## 0.0.1 — 2026-10-19 (local build)

- Initial single-line annotation command with an input box.
