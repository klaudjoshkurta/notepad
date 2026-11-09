const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'notepad-test-')));
const timeout = setTimeout(() => { console.error('Smoke test timed out'); app.exit(1); }, 30000);
app.on('browser-window-created', (_, window) => {
  window.webContents.once('did-finish-load', async () => {
    const run = script => window.webContents.executeJavaScript(script);
    const mounted = () => run(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const check = () => document.getElementById('note') ? resolve() : Date.now() > deadline ? reject(new Error('React did not mount')) : setTimeout(check, 20);
      check();
    })`);
    const reload = async () => {
      const loaded = new Promise(resolve => window.webContents.once('did-finish-load', resolve));
      window.webContents.reload();
      await loaded;
      await mounted();
    };
    const input = (id, value) => run(`(() => {
      const element = document.getElementById(${JSON.stringify(id)});
      const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)});
      element.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    const click = id => run(`document.getElementById(${JSON.stringify(id)}).click()`);
    const saved = () => run(`JSON.parse(localStorage.getItem('notepad.pages.v1'))`);
    const select = id => run(`(() => {
      const select = document.getElementById('page-select');
      select.value = ${JSON.stringify(id)};
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    try {
      assert.equal(window.isAlwaysOnTop(), true);
      assert.deepEqual(window.getSize(), [440, 620]);
      await mounted();
      await run(`localStorage.removeItem('notepad.pages.v1'); localStorage.setItem('notepad.note.v1', 'A saved thought');`);
      await reload();
      assert.equal(await run(`document.getElementById('note').value`), 'A saved thought');
      const firstId = (await saved()).activeId;
      await input('page-title', 'Ideas');
      await input('note', 'First page text');
      assert.equal(await run(`document.getElementById('word-count').textContent`), '3 words');
      await click('add-page');
      assert.equal((await saved()).pages.length, 2);
      assert.equal(await run(`document.getElementById('note').value`), '');
      const secondId = (await saved()).activeId;
      await input('page-title', 'Tasks');
      await input('note', 'Second page text');
      await select(firstId);
      assert.equal(await run(`document.getElementById('note').value`), 'First page text');
      await select(secondId);
      await reload();
      assert.equal(await run(`document.getElementById('page-title').value`), 'Tasks');
      assert.equal(await run(`document.getElementById('note').value`), 'Second page text');
      await click('delete-page');
      await click('cancel-delete');
      assert.equal((await saved()).pages.length, 2);
      await click('delete-page');
      await click('confirm-delete');
      assert.equal((await saved()).pages.length, 1);
      assert.equal((await saved()).activeId, firstId);
      await reload();
      assert.equal((await saved()).pages.length, 1);
      assert.equal(await run(`document.getElementById('note').value`), 'First page text');
      await click('delete-page');
      await click('confirm-delete');
      assert.equal((await saved()).pages.length, 1);
      assert.equal(await run(`document.getElementById('note').value`), '');
      assert.equal(await run(`typeof window.notepad.close`), 'function');
      assert.equal(await run(`typeof require`), 'undefined');
      assert.equal(BrowserWindow.getAllWindows().length, 1);
      console.log('Passed: overlay, legacy migration, page creation, renaming, independent content, switching, reload persistence, deletion/cancel, final-page fallback, and isolated preload.');
      clearTimeout(timeout);
      app.exit(0);
    } catch (error) {
      console.error(error);
      clearTimeout(timeout);
      app.exit(1);
    }
  });
});
require('./main');
