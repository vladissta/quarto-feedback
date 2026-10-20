'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { planSelection, apply } = require('../core');
const chunk = '```{r}\nx <- 1\ny <- 2\n```';
function run(text, start = 1, end = start) {
  const result = planSelection(text, start, end);
  return { ...result, text: apply(text, result.edits) };
}
test('single line adds marker, empty item and cursor after space', () => {
  const r = run(chunk);
  assert.equal(r.text, '```{r}\nx <- 1 # <1>\ny <- 2\n```\n\n1. ');
  assert.deepEqual([r.feedbackLine,r.feedbackColumn,r.feedbackEnd], [5,3,3]);
});
test('selection shares one marker and one feedback item', () => {
  const r = run(chunk,1,2);
  assert.equal((r.text.match(/# <1>/g)||[]).length,2);
  assert.equal(r.text.split('\n').at(-1), '1. ');
});
test('next item follows empty placeholder', () => {
  const r = run(run(chunk).text, 2);
  assert.equal(r.number,2);
  assert.ok(r.text.endsWith('1. \n2. '));
});
test('existing item is selected without modifying text', () => {
  const text = run(chunk).text + 'Почему эта модель?';
  const r = run(text);
  assert.equal(r.text, text);
  assert.equal(r.edits.length,0);
  assert.equal(text.split('\n')[r.feedbackLine].slice(r.feedbackColumn,r.feedbackEnd),'Почему эта модель?');
});
test('extend existing annotation across selection', () => {
  const r=run(run(chunk,2).text+'Общий комментарий',1,2);
  assert.equal((r.text.match(/# <1>/g)||[]).length,2);
  assert.equal(r.number,1);
});
test('does not merge different existing comments', () => {
  const text=run(run(chunk).text,2).text;
  assert.throws(()=>run(text,1,2),/different annotations/);
});
test('numbering resets in second chunk', () => {
  const r=run(run(chunk).text+'Первая\n\n'+chunk,8);
  assert.equal(r.number,1);
});
test('keeps multiline items together when appending', () => {
  const text=run(chunk).text+'First\n\n   Second paragraph\n   - child\n\n## Next';
  const r=run(text,2);
  assert.ok(r.text.includes('   - child\n2. \n\n## Next'));
});
test('keeps multiline content on navigation', () => {
  const text=run(chunk).text+'First\n\n   More\n';
  assert.equal(run(text).text,text);
});
test('blank-separated list entries stay together', () => {
  const text='```r\nx # <1>\ny # <2>\nz\n```\n\n1. First\n\n2. Second\n\n   More\n';
  assert.ok(run(text,3).text.includes('   More\n3. \n'));
});
test('preserves CRLF', () => {
  const r=run(chunk.replaceAll('\n','\r\n'),1,2);
  assert.equal(r.text.replaceAll('\r\n','').includes('\n'),false);
});
test('separates following heading', () => assert.ok(run(chunk+'\n## Next').text.endsWith('1. \n\n## Next')));
test('separates following paragraph', () => assert.ok(run(chunk+'\nText').text.endsWith('1. \n\nText')));
test('preserves trailing newline', () => assert.ok(run(chunk+'\n').text.endsWith('1. \n')));
test('repairs marker with missing first item', () => assert.ok(run('```r\nx # <1>\n```').text.endsWith('1. ')));
test('rejects gaps rather than misbinding Quarto comments', () => assert.throws(()=>run('```r\nx # <3>\n```'),/without matching/));
test('rejects nonsequential existing ordered list', () => assert.throws(()=>run(chunk+'\n\n1. one\n3. three'),/consecutively/));
test('empty numbered placeholders reserve their numbers', () => assert.equal(run(chunk+'\n\n1.\n2. ').number,3));
for(const lang of ['r','python','bash','sh','julia','py']) test(`supports ${lang}`,()=>assert.equal(run(chunk.replace('{r}',`{${lang}}`)).number,1));
test('supports tilde fences',()=>assert.equal(run(chunk.replaceAll('```','~~~~')).number,1));
test('short internal fence does not close longer fence',()=>assert.equal(run('````r\nx\n```\ny\n````',3).number,1));
test('rejects fence line',()=>assert.throws(()=>run(chunk,0),/single code chunk/));
test('rejects unsupported language',()=>assert.throws(()=>run(chunk.replace('{r}','{sql}')),/Place the cursor/));
test('rejects selection crossing chunks',()=>assert.throws(()=>run(chunk+'\n\n'+chunk,1,6),/single code chunk/));
test('rejects unclosed chunk',()=>assert.throws(()=>run('```r\nx'),/single code chunk/));
test('skips blanks and chunk options within a selection',()=>{
  const r=run('```r\n#| echo: true\nx\n\ny\n```',1,4);
  assert.equal((r.text.match(/# <1>/g)||[]).length,2);
  assert.ok(r.text.includes('#| echo: true\nx # <1>\n\ny # <1>'));
});
test('rejects selection containing only chunk options',()=>assert.throws(()=>run('```r\n#| echo: true\n```'),/Select nonempty/));
test('rejects explicit line continuation',()=>assert.throws(()=>run('```python\nx = 1 + \\\n2\n```'),/line-continuation/));
