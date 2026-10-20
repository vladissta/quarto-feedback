'use strict';
const vscode = require('vscode');
const { planSelection } = require('./core');
let pending = false;

async function addFeedback() {
  if (pending) return;
  const editor = vscode.window.activeTextEditor;
  if (!editor || !editor.document.uri.path.toLowerCase().endsWith('.qmd')) {
    await vscode.window.showWarningMessage(vscode.l10n.t('Open a .qmd file in the source editor first.'));
    return;
  }
  if (editor.selections.length !== 1) {
    await vscode.window.showWarningMessage(vscode.l10n.t('Use one continuous selection rather than multiple cursors.'));
    return;
  }
  pending = true;
  try {
    const doc = editor.document;
    const selection = editor.selection;
    const start = selection.start.line;
    // Selecting through column zero of the next line excludes that next line.
    const end = selection.end.line > start && selection.end.character === 0 ? selection.end.line - 1 : selection.end.line;
    const result = planSelection(doc.getText(), start, end);
    if (result.edits.length) {
      const success = await editor.edit(builder => {
        for (const edit of result.edits) builder.replace(new vscode.Range(doc.positionAt(edit.start), doc.positionAt(edit.end)), edit.text);
      }, { undoStopBefore: true, undoStopAfter: true });
      if (!success) {
        await vscode.window.showErrorMessage(vscode.l10n.t('Could not add the feedback. Try the command again.'));
        return;
      }
    }
    if (doc.isClosed || vscode.window.activeTextEditor !== editor) return;
    const from = new vscode.Position(result.feedbackLine, result.feedbackColumn);
    const to = new vscode.Position(result.feedbackLine, result.feedbackEnd);
    editor.selection = new vscode.Selection(from, to);
    editor.revealRange(new vscode.Range(from, to), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  } catch (error) {
    await vscode.window.showWarningMessage(vscode.l10n.t(error.message || String(error)));
  } finally {
    pending = false;
  }
}
function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('quartoFeedback.add', addFeedback));
}
function deactivate() {}
module.exports = { activate, deactivate };
