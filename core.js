'use strict';

const supported = new Set(['r', 'python', 'py', 'bash', 'sh', 'julia']);
const marker = /#\s*<([1-9]\d*)>\s*$/;
const item = /^( {0,3})([1-9]\d*)\.([ \t]+|$)(.*)$/;

function fence(line) {
  const m = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
  return m && { char: m[1][0], width: m[1].length, info: m[2].trim() };
}

function findChunk(lines, target) {
  let open;
  for (let i = 0; i < lines.length; i++) {
    const f = fence(lines[i]);
    if (!f) continue;
    if (!open) open = { ...f, start: i };
    else if (f.char === open.char && f.width >= open.width && !f.info) {
      if (open.start < target && target < i) return { ...open, end: i };
      open = undefined;
    }
  }
  return null;
}

function readList(lines, close) {
  let i = close + 1;
  while (i < lines.length && !lines[i].trim()) i++;
  const entries = [];
  let end = close;
  while (i < lines.length) {
    const m = lines[i].match(item);
    if (!m) break;
    const number = Number(m[2]);
    if (number !== entries.length + 1) {
      throw new Error('The feedback list must be numbered consecutively: 1., 2., 3. Fix the list and try again.');
    }
    const entry = { number, line: i, text: m[4], prefix: m[1] + m[2] + '. ' };
    entries.push(entry);
    end = i++;
    const indent = m[1].length + m[2].length + 2;
    // Keep continuation paragraphs and nested content with the original item.
    while (i < lines.length) {
      if (lines[i].trim() && !new RegExp(`^ {${indent},}`).test(lines[i])) break;
      if (lines[i].trim()) end = i;
      i++;
    }
  }
  return { entries, end };
}

function inspect(text, target) {
  const lines = text.split(/\r\n|\n/);
  const chunk = findChunk(lines, target);
  const language = chunk && (chunk.info.match(/^\{\s*([\w.+-]+)/)?.[1] || chunk.info.split(/\s+/)[0]).toLowerCase();
  if (!chunk || !supported.has(language)) throw new Error('Place the cursor inside an R, Python, Bash, Sh, or Julia code chunk in a .qmd file.');
  const current = lines[target];
  if (!current.trim() || /^\s*#\|/.test(current)) throw new Error('Select a nonempty code line rather than a #| chunk option.');
  if (/\\\s*$/.test(current)) throw new Error('Cannot add a comment after a line-continuation backslash. Select another line.');
  const numbers = lines.slice(chunk.start + 1, chunk.end).flatMap(line => {
    const m = line.match(marker);
    return m ? [Number(m[1])] : [];
  });
  if (numbers.some(n => !Number.isSafeInteger(n))) throw new Error('The annotation number is too large.');
  const list = readList(lines, chunk.end);
  const existing = current.match(marker);
  const number = existing ? Number(existing[1]) : numbers.reduce((max, value) => Math.max(max, value), list.entries.length) + 1;
  if (number > list.entries.length + 1 || numbers.some(n => n > Math.max(number, list.entries.length))) {
    throw new Error('The chunk contains markers without matching feedback items. Restore the 1., 2., 3. list below the chunk and try again.');
  }
  return { lines, chunk, target, number, existing: !!existing, list, value: list.entries[number - 1]?.text || '' };
}

// Edits use original-document offsets so both changes form one undo step.
function plan(text, target, feedback) {
  if (/[\r\n]/.test(feedback)) throw new Error('Enter a single line of feedback.');
  const state = inspect(text, target);
  const { lines, chunk, number, existing, list } = state;
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const offsets = [0];
  for (let i = 0; i < lines.length - 1; i++) offsets.push(offsets[i] + lines[i].length + eol.length);
  const edits = [];
  if (!existing) {
    const at = offsets[target] + lines[target].length;
    edits.push({ start: at, end: at, text: ` # <${number}>` });
  }
  const entry = list.entries[number - 1];
  if (entry) {
    edits.push({ start: offsets[entry.line], end: offsets[entry.line] + lines[entry.line].length, text: entry.prefix + feedback.trim() });
  } else {
    const last = list.entries.length ? list.end : chunk.end;
    const at = offsets[last] + lines[last].length;
    const prefix = list.entries.length ? eol : eol + eol;
    const next = lines[last + 1];
    // Separate a following paragraph, heading, or fence from the feedback list.
    const suffix = next !== undefined && next.trim() ? eol : '';
    edits.push({ start: at, end: at, text: prefix + `${number}. ${feedback.trim()}` + suffix });
  }
  return { ...state, edits };
}

function apply(text, edits) {
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
  return text;
}
function planSelection(text, startLine, endLine) {
  const lines = text.split(/\r\n|\n/);
  const first = findChunk(lines, startLine);
  const last = findChunk(lines, endLine);
  if (!first || !last || first.start !== last.start) throw new Error('The selection must be inside a single code chunk.');
  const targets = [];
  const existing = new Set();
  for (let line = startLine; line <= endLine; line++) {
    if (!lines[line].trim() || /^\s*#\|/.test(lines[line])) continue;
    if (/\\\s*$/.test(lines[line])) throw new Error('The selection contains a line-continuation backslash. Select lines without it.');
    const m = lines[line].match(marker);
    if (m) existing.add(Number(m[1]));
    targets.push(line);
  }
  if (!targets.length) throw new Error('Select nonempty code lines rather than #| chunk options.');
  if (existing.size > 1) throw new Error('The selected lines have different annotations. Select lines sharing one number or lines without annotations.');
  const anchor = targets.find(line => marker.test(lines[line])) ?? targets[0];
  const state = inspect(text, anchor);
  const result = plan(text, anchor, state.value);
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const offsets = [0];
  for (let i = 0; i < lines.length - 1; i++) offsets.push(offsets[i] + lines[i].length + eol.length);
  // Keep an existing feedback item byte-for-byte; the command only navigates to it.
  if (state.list.entries[state.number - 1]) {
    const entryOffset = offsets[state.list.entries[state.number - 1].line];
    result.edits = result.edits.filter(edit => edit.start !== entryOffset);
  }
  for (const line of targets) {
    if (line === anchor || marker.test(lines[line])) continue;
    const at = offsets[line] + lines[line].length;
    result.edits.push({ start: at, end: at, text: ` # <${state.number}>` });
  }
  const updated = apply(text, result.edits);
  const updatedLines = updated.split(/\r\n|\n/);
  const entry = readList(updatedLines, first.end).entries[state.number - 1];
  const match = updatedLines[entry.line].match(item);
  const column = updatedLines[entry.line].length - match[4].length;
  return { edits: result.edits, number: state.number, feedbackLine: entry.line, feedbackColumn: column, feedbackEnd: updatedLines[entry.line].length };
}
module.exports = { inspect, plan, planSelection, apply };
