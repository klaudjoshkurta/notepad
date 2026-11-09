const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const executable = path.resolve(process.argv[2] || 'release/win-unpacked/Notepad.exe');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'notepad-packaged-'));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function launch() {
  const port = await new Promise((resolve, reject) => {
    const server = require('node:net').createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
  });
  const child = spawn(executable, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  child.stderr.resume();
  let socket;
  const exited = new Promise(resolve => child.once('exit', resolve));
  try {
    let target;
    for (let attempt = 0; attempt < 300; attempt++) {
      try {
        const targets = await (await fetch(`http://127.0.0.1:${port}/json`, { signal: AbortSignal.timeout(500) })).json();
        target = targets.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
      } catch {}
      if (target) break;
      await delay(200);
    }
    assert.ok(target, 'Packaged window exists');
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    let sequence = 0;
    const pending = new Map();
    socket.addEventListener('message', event => {
      const response = JSON.parse(event.data);
      if (!pending.has(response.id)) return;
      const { resolve, reject, timer } = pending.get(response.id);
      pending.delete(response.id);
      clearTimeout(timer);
      response.error ? reject(new Error(response.error.message)) : resolve(response.result);
    });
    const command = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 10000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
      const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
      return result.result.value;
    };
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(`Boolean(document.getElementById('note'))`)) break;
      await delay(100);
    }
    assert.equal(await evaluate(`Boolean(document.getElementById('note'))`), true, 'Packaged React UI mounts');
    return { child, evaluate, command, close: async () => { await evaluate('window.notepad.close()').catch(() => {}); await Promise.race([exited, delay(5000)]); socket.close(); if (child.exitCode === null) child.kill(); } };
  } catch (error) {
    socket?.close();
    child.kill();
    throw error;
  }
}

(async () => {
  let app;
  try {
    app = await launch();
    await app.evaluate(`(() => { const editor = document.getElementById('note'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(editor, 'Packaged persistence check'); editor.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await app.evaluate(`document.getElementById('pages-menu').click()`);
    assert.equal(await app.evaluate(`document.querySelector('[data-page-id]').textContent.trim()`), 'Packaged persistence check');
    const image = await app.command('Page.captureScreenshot');
    fs.writeFileSync(path.resolve('release/pages-preview.png'), Buffer.from(image.data, 'base64'));
    await app.close();
    app = await launch();
    assert.equal(await app.evaluate(`document.getElementById('note').value`), 'Packaged persistence check');
    assert.ok(fs.existsSync(path.join(profile, 'window-state.json')), 'Window bounds saved');
    await app.close();
    app = null;
    console.log('Passed: packaged UI, page navigation, note persistence across process restarts, and window state saving.');
  } finally { if (app) await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
