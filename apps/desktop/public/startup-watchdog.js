function showStartupError() {
  const root = document.getElementById('root');
  if (!root || document.getElementById('startup-failure')) return;
  root.replaceChildren();
  const message = document.createElement('section');
  message.id = 'startup-failure';
  message.className = 'p-6 text-sm';
  const heading = document.createElement('h1');
  heading.textContent = 'Notepad could not start';
  const detail = document.createElement('p');
  detail.textContent = 'Your saved notes have not been changed.';
  const retry = document.createElement('button');
  retry.textContent = 'Try again';
  retry.className = 'mt-4 rounded border px-3 py-2';
  retry.onclick = () => location.reload();
  const close = document.createElement('button');
  close.textContent = 'Close';
  close.className = 'ml-2 rounded border px-3 py-2';
  close.onclick = () => window.notepad.close();
  message.append(heading, detail, retry, close);
  root.append(message);
}
window.addEventListener('error', () => { if (!document.getElementById('app-ready')) showStartupError(); }, true);
setTimeout(() => { if (!document.getElementById('app-ready')) showStartupError(); }, 8000);
