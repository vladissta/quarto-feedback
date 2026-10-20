# Support

If the shortcut does not respond, run **Quarto: Add or Edit Feedback Annotation** from the command palette. If the command works, check Keyboard Shortcuts for a conflicting custom binding. Open the `.qmd` source editor and select lines inside a supported code chunk.

If rendered comments are missing, check the numbered list immediately below the relevant chunk, fill empty items, save the document and render again. `below` puts the comment after the entire chunk, which can be far below the annotated line.

For a bug report, include:

- Extension version, editor name/version and operating system.
- A small anonymized `.qmd` example containing just the affected chunk and its feedback list.
- Cursor/selection positions, the command used, expected result and actual result.

Report reproducible problems in the [GitHub issue tracker](https://github.com/vladissta/quarto-feedback/issues). Do not include student names, grades, credentials or full assignments in public reports.
