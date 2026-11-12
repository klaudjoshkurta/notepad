'use client';

import { useState } from 'react';

const initialNote = `A little space to think.

Build something useful.
Keep the good ideas.
Make room for the next one.

One thought at a time.`;

export function NotePreview() {
  const [dark, setDark] = useState(false);
  const [text, setText] = useState(initialNote);
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  return <div className="preview-stage">
    <div className={`note-window ${dark ? 'note-dark' : ''}`}>
      <div className="note-titlebar"><img src="/logo.svg" width="18" height="18" alt="" aria-hidden="true" /><span>Digital Notepad</span><div className="window-controls" aria-hidden="true"><span>−</span><span>□</span><span>×</span></div></div>
      <div className="note-toolbar"><span>File</span><span>Edit</span><span>Pages</span><span>Settings</span><span>Help</span></div>
      <textarea aria-label="Try writing a note in the preview" spellCheck={false} value={text} onChange={event => setText(event.target.value)} />
      <div className="note-status"><span><i />Interactive preview</span><span>{words} words</span></div>
    </div>
    <div className="preview-caption"><span>Try it here. Your words won’t be saved.</span><button type="button" onClick={() => setDark(!dark)} aria-pressed={dark}>{dark ? '☀ Light' : '☾ Dark'} mode <span aria-hidden="true">↗</span></button></div>
  </div>;
}
