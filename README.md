# Quarto Feedback

Add feedback to Quarto code with a single shortcut, then type the comment directly below the code chunk.

**macOS:** Cmd+Option+A · **Windows/Linux:** Ctrl+Alt+A  
Command palette: **Quarto: Add or Edit Feedback Annotation**

## How it works

1. Open a `.qmd` file in the source editor in VS Code or Positron.
2. Place the cursor on a code line, or select several lines inside one chunk.
3. Press the shortcut. The selected code lines receive one shared annotation number, and the cursor moves to an empty numbered feedback item below the chunk.
4. Type your feedback directly in the document.

For example, selecting the two model lines produces:

````markdown
```{r}
data <- mtcars
model <- lm(mpg ~ wt, data = data) # <1>
summary(model) # <1>
```

1. Explain the model choice and interpret its coefficients.
````

Run the command on an annotated line to select its existing feedback text for editing. Numbering restarts for each chunk. Empty feedback items also reserve their numbers. Creating markers and their item is one undo step.

## Features

- One shared annotation for a single line or a continuous selection.
- Chunk-local numbering and navigation to existing feedback.
- Preserves existing multiline feedback and LF/CRLF line endings.
- Skips blank lines and `#|` chunk options in a selection.
- English and Russian interface messages, following the editor's display language.
- Supports R, Python/py, Bash/sh, and Julia fences using `#` comments.

## Render the feedback

The extension edits source text; Quarto renders its standard code annotations. To show a comment when clicking its number in HTML, add this to the document YAML:

```yaml
format: html
code-annotations: select
```

Use `hover` for tooltips on hover, or `below` to keep feedback visible below each entire code chunk. PDF output shows annotations below the code. Fill in empty feedback items before rendering.

Rendering requires a separate Quarto installation. Adding feedback does not run student code, require R/Python, or render the document.

See the [Quarto annotation documentation](https://quarto.org/docs/authoring/code-annotation.html).

## Installation

Install **Quarto Feedback** by **vladissta** after it is published in your editor's extension gallery, or use **Extensions: Install from VSIX...** with the packaged release. Positron uses an Open VSX-compatible catalog; its extensions are installed separately from VS Code's.

If you used the earlier local build with publisher `local-feedback`, uninstall that copy before installing the public `vladissta` build. They have different extension identities but register the same command. Your `.qmd` feedback stays in your files.

A custom shortcut assigned to `runCommands` can override this extension's shortcut. Remove that specific old binding, or use the command palette / Keyboard Shortcuts editor to assign another key.

## Limitations

- Source editor only: visual editors and notebook editors are not supported.
- One continuous selection inside one code fence; multiple cursors and selections crossing chunks are rejected.
- Standard backtick/tilde fences with up to three leading spaces. Code chunks nested in lists or blockquotes are not supported.
- Does not automatically renumber annotations after code lines or feedback items are deleted or moved. Number feedback items explicitly and consecutively (`1.`, `2.`, `3.`); gaps are rejected.
- An ordered list immediately below a chunk is treated as its annotation list, following Quarto syntax.
- The extension is not a language parser. Select code lines where a trailing `#` comment is valid; avoid multiline string contents, heredocs and block-comment bodies. Explicit backslash line continuations are rejected.
- Navigating to existing feedback selects its first line only; additional paragraphs remain intact.
- Always-open comments alongside code require separate HTML styling and are not included in this release.

## Privacy and license

No telemetry, network requests, accounts, or background code execution. The command edits only the active document. See [Privacy](PRIVACY.md), [Support](SUPPORT.md) and the [MIT license](LICENSE).

## По-русски

Откройте `.qmd`, выделите строки одного блока и нажмите Cmd+Option+A (Mac) или Ctrl+Alt+A. Курсор перейдёт к пункту под блоком — пишите замечание прямо там. Повторное нажатие на отмеченной строке выделит существующее замечание. Для каждого блока нумерация начинается заново. [Полная инструкция на русском](README.ru.md).
