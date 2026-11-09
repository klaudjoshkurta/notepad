const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { fitBounds } = require('../window-state');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/lib/pages.js'), 'utf8');
const pagesModule = import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('window bounds stay on a connected monitor', () => {
  const displays = [{ workArea: { x: 0, y: 0, width: 1920, height: 1080 } }];
  assert.deepEqual(fitBounds({ x: 9000, y: -200, width: 4000, height: 4000 }, displays), { x: 0, y: 0, width: 1920, height: 1080 });
  assert.deepEqual(fitBounds({ x: 100, y: 100, width: 500, height: 600 }, displays), { x: 100, y: 100, width: 500, height: 600 });
});
test('storage migration, backup recovery, and write failure preserve notes', async () => {
  const api = await pagesModule;
  const store = new Map([['notepad.note.v1', 'Original note']]);
  global.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  const initial = api.readPages();
  assert.equal(initial.pages[0].text, 'Original note');
  const next = api.savePages({ ...initial, pages: [{ ...initial.pages[0], text: 'Edited note' }] });
  assert.equal(api.parseNotebook(store.get(api.backupKey)).pages[0].text, 'Original note');
  store.set(api.pagesKey, '{broken');
  assert.equal(api.readPages().storageBlocked, true);
  const restored = api.restoreBackup();
  assert.equal(restored.pages[0].text, 'Original note');
  assert.ok([...store.keys()].some(key => key.startsWith('notepad.recovery.')));
  localStorage.setItem = () => { throw new Error('Disk full'); };
  const failed = api.savePages(next);
  assert.equal(failed.saveFailed, true);
  assert.equal(failed.pages[0].text, 'Edited note');
  assert.match(api.serializeNotebook(failed), /Edited note/);
});
