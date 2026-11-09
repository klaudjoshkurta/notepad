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
    const openPages = async () => {
      if (!await run(`Boolean(document.getElementById('pages-view'))`)) await run(`document.getElementById('pages-menu').click()`);
    };
    const closePages = async () => {
      if (await run(`Boolean(document.getElementById('pages-view'))`)) await run(`document.getElementById('back-to-note').click()`);
    };
    const input = async (id, value) => {
      await closePages();
      return run(`(() => {
      const element = document.getElementById(${JSON.stringify(id)});
      const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)});
      element.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    };
    const click = async id => {
      await openPages();
      return run(`document.getElementById(${JSON.stringify(id)}).click()`);
    };
    const saved = () => run(`JSON.parse(localStorage.getItem('notepad.pages.v1'))`);
    const select = async id => {
      await openPages();
      await run(`document.querySelector('[data-page-id="${id}"]').click()`);
      await closePages();
    };
    try {
      assert.equal(window.isAlwaysOnTop(), true);
      assert.deepEqual(window.getSize(), [440, 620]);
      await mounted();
      assert.equal(await run(`document.querySelector('main #page-title, main #add-page, main #delete-page')`), null);
      await openPages();
      assert.equal(await run(`Boolean(document.getElementById('pages-view'))`), true);
      assert.equal(await run(`document.getElementById('note')`), null);
      assert.equal(await run(`document.getElementById('pages-menu')`), null);
      assert.equal(await run(`Boolean(document.getElementById('back-to-note'))`), true);
      assert.equal(await run(`document.querySelector('[role="dialog"]')`), null);
      await closePages();
      assert.equal(await run(`document.activeElement.id`), 'note');
      await run(`localStorage.removeItem('notepad.pages.v1'); localStorage.setItem('notepad.note.v1', 'A saved thought');`);
      await reload();
      assert.equal(await run(`document.getElementById('note').value`), 'A saved thought');
      const firstId = (await saved()).activeId;
      await input('note', 'First page text');
      assert.equal(await run(`document.getElementById('word-count').textContent`), '3 words');
      await click('add-page');
      assert.equal((await saved()).pages.length, 2);
      assert.equal(await run(`document.getElementById('note').value`), '');
      const secondId = (await saved()).activeId;
      await openPages();
      assert.equal(await run(`document.querySelector('[aria-current="page"]').textContent.trim()`), 'Empty note');
      await input('note', 'Second page text\nMore details');
      await openPages();
      assert.equal(await run(`document.querySelector('[aria-current="page"]').textContent.trim()`), 'Second page text');
      assert.equal(await run(`document.getElementById('page-title')`), null);
      await select(firstId);
      assert.equal(await run(`document.getElementById('note').value`), 'First page text');
      await select(secondId);
      await reload();
      await openPages();
      assert.equal(await run(`document.querySelector('[aria-current="page"]').textContent.trim()`), 'Second page text');
      await closePages();
      assert.equal(await run(`document.getElementById('note').value`), 'Second page text\nMore details');
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
      await closePages();
      assert.equal(await run(`document.getElementById('note').value`), '');
      assert.equal(await run(`typeof window.notepad.close`), 'function');
      assert.equal(await run(`typeof require`), 'undefined');
      assert.equal(BrowserWindow.getAllWindows().length, 1);
      console.log('Passed: separate list/editor views, menu/back navigation, editor focus, first-line previews, migration, creation, switching, persistence, deletion/cancel, always-on-top, and isolated preload.');
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
