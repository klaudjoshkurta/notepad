import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { RiAddLine, RiArrowLeftLine, RiDeleteBinLine, RiSubtractLine, RiCloseLine, RiMenuLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createPage, readPages, savePages, restoreBackup, serializeNotebook, parseNotebook, pagesKey } from '@/lib/pages';

export default function App() {
  const [notebook, setNotebook] = useState(readPages);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [restorePending, setRestorePending] = useState(false);
  const [query, setQuery] = useState('');
  const editors = useRef(new Map());
  const scrollPositions = useRef(new Map());
  const searchInput = useRef(null);
  const note = notebook.pages.find(page => page.id === notebook.activeId);
  const words = note.text.trim() ? note.text.trim().split(/\s+/u).length : 0;
  const filteredPages = notebook.pages.filter(page => page.text.toLocaleLowerCase().includes(query.toLocaleLowerCase()));

  useLayoutEffect(() => {
    for (const page of notebook.pages) {
      const editor = editors.current.get(page.id);
      if (editor && editor.value !== page.text) editor.value = page.text;
    }
    if (!pagesOpen) {
      const editor = editors.current.get(note.id);
      editor?.focus();
      if (editor) editor.scrollTop = scrollPositions.current.get(note.id) ?? 0;
    }
  }, [notebook.pages, note.id, pagesOpen]);

  useEffect(() => {
    function beforeUnload(event) {
      if (notebook.saveFailed || (notebook.storageBlocked && notebook.pages.some(page => page.text))) {
        event.preventDefault();
        event.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [notebook]);

  useEffect(() => {
    function onKey(event) {
      if (event.isComposing) return;
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (mod && key === 'n' && !event.shiftKey) { event.preventDefault(); addPage(); }
      else if (mod && key === 'p' && event.shiftKey) { event.preventDefault(); if (pagesOpen) showEditor(); else showPages(); }
      else if (mod && key === 'f') { event.preventDefault(); showPages(); requestAnimationFrame(() => searchInput.current?.focus()); }
      else if (mod && key === 'e') { event.preventDefault(); exportNotes(event.shiftKey ? 'json' : 'txt'); }
      else if (mod && event.shiftKey && key === 't') { event.preventDefault(); undoDelete(); }
      else if (event.key === 'Escape' && pagesOpen) { event.preventDefault(); showEditor(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function updateNotebook(next) { setNotebook(savePages(next)); }
  async function exportNotes(kind = 'json', raw = false) {
    try {
      const text = raw ? localStorage.getItem(pagesKey) ?? '' : kind === 'json' ? serializeNotebook(notebook) : note.text;
      if (await window.notepad.exportFile(text, kind)) setMessage('Exported successfully.');
    } catch { setMessage('Export failed. Please try another location.'); }
  }
  async function importNotes() {
    try {
      const raw = await window.notepad.importFile();
      if (raw === null) return;
      const imported = parseNotebook(raw);
      const pages = imported.pages.map(page => createPage(page.text));
      setNotebook(savePages({ ...notebook, pages: [...notebook.pages, ...pages], activeId: pages[0].id }, { recover: true }));
      setMessage('Backup imported as additional pages.');
    } catch { setMessage('Could not import this backup. Choose a valid Notepad JSON backup.'); }
  }
  function recoverBackup() {
    try { setNotebook(restoreBackup()); setMessage('Backup restored.'); }
    catch (error) { setMessage(error.message); }
    setRestorePending(false);
  }
  function showEditor() { setPagesOpen(false); setConfirmDelete(false); setRestorePending(false); }
  function showPages() {
    const editor = editors.current.get(note.id);
    if (editor) scrollPositions.current.set(note.id, editor.scrollTop);
    setPagesOpen(true);
  }
  function addPage() {
    const page = createPage();
    updateNotebook({ ...notebook, pages: [...notebook.pages, page], activeId: page.id });
    showEditor();
  }
  function deletePage() {
    const index = notebook.pages.findIndex(page => page.id === note.id);
    const pages = notebook.pages.filter(page => page.id !== note.id);
    let fallbackId;
    if (!pages.length) { const blank = createPage(); pages.push(blank); fallbackId = blank.id; }
    const trash = [...(notebook.trash ?? []), { page: note, index, fallbackId }].slice(-20);
    updateNotebook({ ...notebook, pages, trash, activeId: pages[Math.min(index, pages.length - 1)].id });
    setConfirmDelete(false);
  }
  function undoDelete() {
    const trash = [...(notebook.trash ?? [])];
    const item = trash.pop();
    if (!item) return;
    const pages = notebook.pages.filter(page => !(page.id === item.fallbackId && !page.text));
    const page = pages.some(page => page.id === item.page.id) ? createPage(item.page.text) : item.page;
    pages.splice(Math.max(0, Math.min(item.index ?? pages.length, pages.length)), 0, page);
    updateNotebook({ ...notebook, pages, trash, activeId: page.id });
    showEditor();
    setMessage('Deleted page restored.');
  }

  return (
    <div id="app-ready" className="flex h-dvh flex-col overflow-hidden border border-border bg-background text-foreground">
      <header className="flex h-11 shrink-0 select-none items-center justify-between pl-0.5 [-webkit-app-region:drag] [app-region:drag]">
        <div className="flex flex-1 items-center gap-2">
          <Button key={pagesOpen ? 'back' : 'menu'} id={pagesOpen ? 'back-to-note' : 'pages-menu'} size="icon" variant="ghost" autoFocus={pagesOpen} aria-label={pagesOpen ? 'Back to note' : 'Pages'} title={pagesOpen ? 'Back to note' : 'Pages (Ctrl+Shift+P)'} className="[-webkit-app-region:no-drag] [app-region:no-drag]" onClick={() => { if (pagesOpen) showEditor(); else showPages(); }}>
            {pagesOpen ? <RiArrowLeftLine aria-hidden="true" /> : <RiMenuLine aria-hidden="true" />}
          </Button>
          {pagesOpen && <h1 className="text-xs font-medium text-muted-foreground">Pages</h1>}
        </div>
        <div className="flex h-full [-webkit-app-region:no-drag] [app-region:no-drag]">
          <Button id="minimize" variant="ghost" size="icon" className="h-full w-10 rounded-none" aria-label="Minimize" title="Minimize" onClick={() => window.notepad.minimize()}><RiSubtractLine aria-hidden="true" /></Button>
          <Button id="close" variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-red-600 hover:text-white" aria-label="Close" title="Close" onClick={() => window.notepad.close()}><RiCloseLine aria-hidden="true" /></Button>
        </div>
      </header>
      {(notebook.storageBlocked || notebook.saveFailed) && <div className="shrink-0 px-5 py-2 text-xs" role="alert">
        <p>{notebook.status}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button id="retry-save" size="sm" variant="outline" onClick={() => setNotebook(savePages(notebook, { recover: true }))}>Save current pages</Button>
          <Button size="sm" variant="ghost" onClick={() => exportNotes()}>Export current pages</Button>
          {notebook.storageBlocked && <Button size="sm" variant="ghost" onClick={() => exportNotes('json', true)}>Export unreadable data</Button>}
        </div>
      </div>}

      {pagesOpen && (
        <main id="pages-view" aria-label="Pages" className="flex min-h-0 flex-1 flex-col px-4 pb-3 pt-3">
          <label className="sr-only" htmlFor="search-pages">Search notes</label>
          <input ref={searchInput} id="search-pages" type="search" placeholder="Search notes…" value={query} onChange={event => setQuery(event.target.value)} className="mb-2 h-9 shrink-0 rounded-md border border-input bg-transparent px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <Button id="add-page" variant="ghost" className="mb-3 h-9 shrink-0 justify-start px-3 text-xs font-normal text-muted-foreground hover:bg-neutral-100 hover:text-foreground" onClick={addPage}><RiAddLine aria-hidden="true" />New page</Button>
          <nav aria-label="Pages" className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-200">
            {filteredPages.map(page => <Button key={page.id} data-page-id={page.id} aria-current={page.id === note.id ? 'page' : undefined} variant="ghost" className={`h-10 w-full shrink-0 justify-start rounded-md px-3 text-left text-[13px] font-normal hover:bg-neutral-100 hover:text-foreground ${page.id === note.id ? 'bg-neutral-100 text-foreground' : 'text-neutral-500'}`} onClick={() => { updateNotebook({ ...notebook, activeId: page.id }); showEditor(); }}>
              <span className="min-w-0 truncate">{page.text.split(/\r\n|\r|\n/u, 1)[0].trim() || 'Empty note'}</span>
            </Button>)}
            {!filteredPages.length && <p className="px-3 py-4 text-xs text-muted-foreground">No matching notes.</p>}
          </nav>
          <div className="mt-3 flex shrink-0 flex-col gap-2 pt-2">
            <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer px-3 py-2">Backup and files</summary>
            <div className="flex flex-wrap gap-1">
              <Button id="export-notebook" size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => exportNotes()}>Export all</Button>
              <Button id="export-note" size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => exportNotes('txt')}>Export selected note</Button>
              <Button id="import-notebook" size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={importNotes}>Import</Button>
              <Button id="restore-backup" size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => setRestorePending(true)}>Restore backup</Button>
            </div>
            {restorePending && <div className="rounded bg-neutral-50 p-3 text-xs"><p>Replace current pages with the previous saved backup? Export a copy first to keep unsaved changes.</p><Button id="confirm-restore" size="sm" onClick={recoverBackup}>Restore</Button><Button size="sm" variant="ghost" onClick={() => setRestorePending(false)}>Cancel</Button></div>}
            </details>
            {!!notebook.trash?.length && <Button id="undo-delete" size="sm" variant="ghost" className="justify-start text-xs text-muted-foreground" onClick={undoDelete}>Restore last deleted page</Button>}
            {confirmDelete ? <div className="flex flex-wrap items-center gap-2 rounded-md bg-neutral-50 p-3 text-xs" role="group" aria-label="Confirm page deletion">
              <span className="w-full">Delete the selected page and its contents?</span>
              <Button id="confirm-delete" size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={deletePage}>Delete page</Button>
              <Button id="cancel-delete" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div> : <Button id="delete-page" variant="ghost" className="h-8 justify-start px-3 text-xs font-normal text-muted-foreground hover:bg-red-50 hover:text-red-600" onClick={() => setConfirmDelete(true)}><RiDeleteBinLine aria-hidden="true" />Delete selected page</Button>}
          </div>
        </main>
      )}
        <main id="editor-view" className={pagesOpen ? 'hidden' : 'flex min-h-0 flex-1 flex-col px-5 pt-6'} aria-hidden={pagesOpen || undefined}>
          {notebook.pages.map(page => <Textarea key={page.id} ref={element => { if (element) editors.current.set(page.id, element); else editors.current.delete(page.id); }} id={page.id === note.id ? 'note' : undefined} aria-label="Your note" data-editor-id={page.id} className={page.id !== note.id ? 'hidden' : 'min-h-0 flex-1 resize-none rounded-none border-0 p-0 pb-4 text-[15px] leading-7 caret-primary shadow-none selection:bg-[#dce6d2] focus-visible:ring-0 [&::-webkit-scrollbar]:w-1.25 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d8cb]'} placeholder="Write something down…" spellCheck defaultValue={page.text} onScroll={event => scrollPositions.current.set(page.id, event.currentTarget.scrollTop)} onChange={event => updateNotebook({ ...notebook, pages: notebook.pages.map(item => item.id === page.id ? { ...item, text: event.target.value } : item) })} />)}
        </main>

      <footer className="flex shrink-0 select-none justify-between px-5 py-3 text-[10px] text-muted-foreground">
        <span id="save-status" role="status">{notebook.status}</span>
        {pagesOpen ? <span>{notebook.pages.length} {notebook.pages.length === 1 ? 'page' : 'pages'}</span> : <span id="word-count">{words} {words === 1 ? 'word' : 'words'}</span>}
      </footer>
      {message && <div className="flex shrink-0 items-center justify-between gap-2 px-5 pb-3 text-xs" role="status"><span>{message}</span><Button size="icon" variant="ghost" className="size-6" aria-label="Dismiss message" onClick={() => setMessage('')}><RiCloseLine aria-hidden="true" /></Button></div>}
    </div>
  );
}
