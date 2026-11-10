import { useEffect, useRef, useState } from 'react';
import { RiArrowLeftLine, RiCloseLine, RiSearchLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';

const groups = [
  { title: 'Pages and files', items: [
    ['New page', ['Ctrl', 'N']],
    ['Open Pages menu', ['Ctrl', 'Shift', 'P']],
    ['Export current page', ['Ctrl', 'E']],
    ['Export all pages', ['Ctrl', 'Shift', 'E']],
    ['Restore deleted page', ['Ctrl', 'Shift', 'T']],
  ] },
  { title: 'Editing', items: [
    ['Undo', ['Ctrl', 'Z']], ['Redo', ['Ctrl', 'Y']],
    ['Cut', ['Ctrl', 'X']], ['Copy', ['Ctrl', 'C']],
    ['Paste', ['Ctrl', 'V']], ['Select all', ['Ctrl', 'A']],
    ['Find in page', ['Ctrl', 'F']], ['Find next match (in Find)', ['Enter']],
  ] },
  { title: 'Navigation', items: [
    ['Move between menus', ['←', '→']],
    ['Move between menu items', ['↑', '↓']],
    ['Open menu or run command', ['Enter']],
    ['Close menu, Find, or shortcuts', ['Esc']],
  ] },
];

export function ShortcutsView({ onBack }) {
  const [query, setQuery] = useState('');
  const input = useRef(null);
  useEffect(() => { const frame = requestAnimationFrame(() => input.current?.focus()); return () => cancelAnimationFrame(frame); }, []);
  const filtered = groups.map(group => ({ ...group, items: group.items.filter(([label, keys]) => `${label} ${keys.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())) })).filter(group => group.items.length);

  return <main id="shortcuts-view" aria-labelledby="shortcuts-title">
    <div className="shortcuts-heading">
      <Button id="back-to-editor" variant="ghost" size="icon" aria-label="Back to editor" onClick={onBack}><RiArrowLeftLine aria-hidden="true" /></Button>
      <h1 id="shortcuts-title">Keyboard shortcuts</h1>
    </div>
    <div className="shortcut-search">
      <RiSearchLine aria-hidden="true" />
      <input ref={input} id="shortcut-search" type="search" aria-label="Search shortcuts" placeholder="Search shortcuts" value={query} onChange={event => setQuery(event.target.value)} />
      {query && <Button variant="ghost" size="icon" aria-label="Clear shortcut search" onClick={() => { setQuery(''); input.current?.focus(); }}><RiCloseLine aria-hidden="true" /></Button>}
    </div>
    <div className="shortcuts-list">
      {filtered.map(group => <section key={group.title} aria-label={group.title}>
        <h2>{group.title}</h2>
        <dl>{group.items.map(([label, keys]) => <div className="shortcut-row" key={label}>
          <dt>{label}</dt><dd aria-label={keys.join(' + ')}>{keys.map((key, index) => <kbd key={index}>{key}</kbd>)}</dd>
        </div>)}</dl>
      </section>)}
      {!filtered.length && <p className="shortcuts-empty" role="status">No shortcuts found.</p>}
    </div>
  </main>;
}
