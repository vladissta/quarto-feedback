'use strict';
// Set QF_EDITOR to the editor's actual executable (not a launcher shell script).
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const editor = process.env.QF_EDITOR;
if (!editor) {
  console.error('Set QF_EDITOR to the actual VS Code or Positron executable; see CONTRIBUTING.md.');
  process.exit(1);
}
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'qf-host-'));
const resultFile = path.resolve(process.env.QF_TEST_RESULTS || path.join(root, 'test-results', 'host.json'));
fs.rmSync(resultFile, { force: true });
const env = { ...process.env, QF_TEST_RESULTS: resultFile };
delete env.ELECTRON_RUN_AS_NODE;
const args = ['--new-window', '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust', '--disable-extensions', '--user-data-dir', path.join(sandbox, 'user'), '--extensions-dir', path.join(sandbox, 'extensions'), `--extensionDevelopmentPath=${root}`, `--extensionTestsPath=${path.join(root, 'test', 'host.js')}`];
const child = spawn(editor, args, { env, stdio: 'inherit' });
let passed = false;
let finished = false;
function readResult() {
  try {
    const r = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
    const p = require('../package.json');
    return r.passed && r.extension === `${p.publisher}.${p.name}@${p.version}`;
  } catch { return false; }
}
function finish(ok) {
  if (finished) return;
  finished = true;
  clearInterval(poll);
  clearTimeout(deadline);
  if (ok) {
    try { fs.rmSync(sandbox, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
    catch { console.warn(`Checks passed; temporary profile still in use and retained at ${sandbox}`); }
  } else console.error(`Test failed. Diagnostic profile retained at ${sandbox}`);
  console.log(`Host test ${ok ? 'passed' : 'failed'}; result: ${resultFile}`);
  process.exitCode = ok ? 0 : 1;
}
// Some macOS editor builds keep their app process alive after the test host exits.
// The result is written only after all assertions and fixture cleanup succeed.
// Stop only the child process this runner created, never the user's editor.
const poll = setInterval(() => {
  if (readResult()) { passed = true; child.kill('SIGTERM'); }
}, 500);
const deadline = setTimeout(() => { child.kill('SIGTERM'); finish(passed || readResult()); }, 120000);
child.on('error', error => { console.error(error.message); finish(false); });
child.on('close', () => finish(passed || readResult()));
