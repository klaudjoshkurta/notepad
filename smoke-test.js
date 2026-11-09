const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

// Keep verification separate from the user's saved note.
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'notepad-test-')));
const timeout = setTimeout(() => {
  console.error('App did not finish startup within 20 seconds.');
  app.exit(1);
}, 20000);

app.on('browser-window-created', (_, window) => {
  window.webContents.once('did-finish-load', async () => {
    try {
      assert.equal(window.isAlwaysOnTop(), true);
      assert.deepEqual(window.getSize(), [340, 520]);
      // Module scripts mount React after the document loads.
      await window.webContents.executeJavaScript(`new Promise((resolve, reject) => {
        const deadline = Date.now() + 5000;
        const check = () => document.getElementById('note') ? resolve() :
          Date.now() > deadline ? reject(new Error('React did not mount')) : setTimeout(check, 20);
        check();
      })`);
      await window.webContents.executeJavaScript(`
        (() => {
          const editor = document.getElementById('note');
          Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(editor, 'A saved thought');
          editor.dispatchEvent(new Event('input', { bubbles: true }));
        })()
      `);
      const result = await window.webContents.executeJavaScript(`
        (() => {
          return {
            saved: localStorage.getItem('notepad.note.v1'),
            count: document.getElementById('word-count').textContent,
            bridge: typeof window.notepad.close,
            node: typeof require
          };
        })()
      `);
      assert.deepEqual(result, {
        saved: 'A saved thought', count: '3 words', bridge: 'function', node: 'undefined',
      });
      const reloaded = new Promise(resolve => window.webContents.once('did-finish-load', resolve));
      window.webContents.reload();
      await reloaded;
      assert.equal(await window.webContents.executeJavaScript(`new Promise((resolve, reject) => {
        const deadline = Date.now() + 5000;
        const check = () => {
          const editor = document.getElementById('note');
          if (editor) resolve(editor.value);
          else if (Date.now() > deadline) reject(new Error('React did not remount'));
          else setTimeout(check, 20);
        };
        check();
      })`), 'A saved thought');
      assert.equal(BrowserWindow.getAllWindows().length, 1);
      console.log('Passed: window size, always-on-top, editing, saving, reload persistence, and isolated preload.');
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
