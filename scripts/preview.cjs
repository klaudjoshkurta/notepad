const { app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'notepad-preview-')));
const timeout = setTimeout(() => app.exit(1), 20000);
app.on('browser-window-created', (_, window) => {
  window.webContents.once('did-finish-load', async () => {
    try {
      const notebook = { activeId: 'one', pages: [
        { id: 'one', text: 'A few things for today\n\nKeep it simple. Make a little progress.\n\n• Finish the first draft\n• Take a walk without my phone\n• Leave room for a good idea\n\nOne thing at a time.' },
        { id: 'two', text: 'Ideas worth keeping\nA small collection of things to try next.' },
        { id: 'three', text: 'Weekend plans\nCoffee, the bookshop, and nowhere to rush.' },
      ], trash: [] };
      await window.webContents.executeJavaScript(`localStorage.setItem('notepad.pages.v1', ${JSON.stringify(JSON.stringify(notebook))})`);
      const loaded = new Promise(resolve => window.webContents.once('did-finish-load', resolve));
      window.webContents.reload();
      await loaded;
      await window.webContents.executeJavaScript(`new Promise(resolve => { const check = () => document.getElementById('note') ? resolve() : setTimeout(check, 20); check(); })`);
      fs.mkdirSync(path.join(__dirname, '../release'), { recursive: true });
      for (const [name, width, height] of [['editor', 440, 620], ['pages', 440, 620], ['compact', 280, 320]]) {
        window.setSize(width, height);
        if (name === 'pages') await window.webContents.executeJavaScript(`document.getElementById('pages-menu').click(); document.activeElement.blur()`);
        await new Promise(resolve => setTimeout(resolve, 200));
        fs.writeFileSync(path.join(__dirname, `../release/redesign-${name}.png`), (await window.webContents.capturePage()).toPNG());
      }
      clearTimeout(timeout);
      app.exit(0);
    } catch (error) { console.error(error); app.exit(1); }
  });
});
require('../main');
