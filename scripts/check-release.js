'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const p = require('../package.json');
assert.equal(p.publisher, 'vladissta', 'Use the approved publisher identity');
assert.equal(p.license, 'MIT');
assert.equal(p.name, 'quarto-feedback');
assert.match(p.version, /^\d+\.\d+\.\d+$/);
assert.equal(p.main, './extension.js');
for (const name of ['LICENSE', 'README.md', 'README.ru.md', 'CHANGELOG.md', 'SUPPORT.md', 'PRIVACY.md', 'media/icon.png']) {
  assert.ok(fs.existsSync(path.join(root, name)), `Missing ${name}`);
}
const english = JSON.parse(fs.readFileSync(path.join(root, 'package.nls.json'), 'utf8'));
const russian = JSON.parse(fs.readFileSync(path.join(root, 'package.nls.ru.json'), 'utf8'));
assert.deepEqual(Object.keys(english).sort(), Object.keys(russian).sort());
const runtimeRu = JSON.parse(fs.readFileSync(path.join(root, 'l10n/bundle.l10n.ru.json'), 'utf8'));
const code = ['core.js', 'extension.js'].map(name => fs.readFileSync(path.join(root, name), 'utf8')).join('\n');
for (const match of code.matchAll(/(?:new Error\(|vscode\.l10n\.t\()'([^']+)'/g)) {
  assert.ok(runtimeRu[match[1]], `Missing Russian translation: ${match[1]}`);
}
assert.ok(fs.readFileSync(path.join(root, 'media/icon.png')).subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
console.log(`Release metadata, documentation, icon and translations OK: ${p.publisher}.${p.name}@${p.version}`);
const binding = p.contributes.keybindings[0];
assert.equal(binding.command, p.contributes.commands[0].command);
const match = binding.when.match(/=~ \/(.*?)\/([a-z]*)$/);
assert.ok(match, 'Keybinding must have a file-extension regular expression');
const pattern = new RegExp(match[1], match[2]);
assert.ok(pattern.test('.qmd') && pattern.test('.QMD'), 'Shortcut must accept Quarto file extensions');
assert.ok(!pattern.test('.txt') && !pattern.test('.md'), 'Shortcut must not capture other editors');
