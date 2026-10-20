# Privacy

Quarto Feedback does not collect telemetry, send network requests, use AI services, require an account, or transmit document contents.

When invoked, the command reads the active document in memory, computes its annotation edits, and applies them through the editor's text-edit API. It does not execute code, render documents, write separate feedback files, or save the document automatically. Saving and synchronization are controlled by your editor.

The extension itself has no runtime npm dependencies. Development tools used to test, package or publish it are excluded from the installed extension.

Your editor, other installed extensions, and the Quarto renderer have their own data-handling behavior.
