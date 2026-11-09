import { useState } from 'react';
import { RiAddLine, RiArrowLeftLine, RiDeleteBinLine, RiSubtractLine, RiCloseLine, RiMenuLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createPage, readPages, savePages } from '@/lib/pages';

export default function App() {
  const [notebook, setNotebook] = useState(readPages);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const note = notebook.pages.find(page => page.id === notebook.activeId);
  const words = note.text.trim() ? note.text.trim().split(/\s+/u).length : 0;

  function updateNotebook(next) { setNotebook(savePages(next)); }
  function showEditor() { setPagesOpen(false); setConfirmDelete(false); }
  function addPage() {
    const page = createPage();
    updateNotebook({ ...notebook, pages: [...notebook.pages, page], activeId: page.id });
    showEditor();
  }
  function deletePage() {
    const index = notebook.pages.findIndex(page => page.id === note.id);
    const pages = notebook.pages.filter(page => page.id !== note.id);
    if (!pages.length) pages.push(createPage());
    updateNotebook({ ...notebook, pages, activeId: pages[Math.min(index, pages.length - 1)].id });
    setConfirmDelete(false);
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden border border-border bg-background text-foreground">
      <header className="flex h-11 shrink-0 select-none items-center justify-between pl-0.5 [-webkit-app-region:drag] [app-region:drag]">
        <div className="flex flex-1 items-center gap-2">
          <Button key={pagesOpen ? 'back' : 'menu'} id={pagesOpen ? 'back-to-note' : 'pages-menu'} size="icon" variant="ghost" autoFocus={pagesOpen} aria-label={pagesOpen ? 'Back to note' : 'Pages'} title={pagesOpen ? 'Back to note' : 'Pages'} className="[-webkit-app-region:no-drag] [app-region:no-drag]" onClick={() => { if (pagesOpen) showEditor(); else setPagesOpen(true); }}>
            {pagesOpen ? <RiArrowLeftLine aria-hidden="true" /> : <RiMenuLine aria-hidden="true" />}
          </Button>
          {pagesOpen && <h1 className="text-xs font-medium text-muted-foreground">Pages</h1>}
        </div>
        <div className="flex h-full [-webkit-app-region:no-drag] [app-region:no-drag]">
          <Button id="minimize" variant="ghost" size="icon" className="h-full w-10 rounded-none" aria-label="Minimize" title="Minimize" onClick={() => window.notepad.minimize()}><RiSubtractLine aria-hidden="true" /></Button>
          <Button id="close" variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-red-600 hover:text-white" aria-label="Close" title="Close" onClick={() => window.notepad.close()}><RiCloseLine aria-hidden="true" /></Button>
        </div>
      </header>

      {pagesOpen ? (
        <main id="pages-view" aria-label="Pages" className="flex min-h-0 flex-1 flex-col px-4 pb-3 pt-3" onKeyDown={event => { if (event.key === 'Escape') showEditor(); }}>
          <Button id="add-page" variant="ghost" className="mb-3 h-9 shrink-0 justify-start px-3 text-xs font-normal text-muted-foreground hover:bg-neutral-100 hover:text-foreground" onClick={addPage}><RiAddLine aria-hidden="true" />New page</Button>
          <nav aria-label="Pages" className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-200">
            {notebook.pages.map(page => <Button key={page.id} data-page-id={page.id} aria-current={page.id === note.id ? 'page' : undefined} variant="ghost" className={`h-10 w-full shrink-0 justify-start rounded-md px-3 text-left text-[13px] font-normal hover:bg-neutral-100 hover:text-foreground ${page.id === note.id ? 'bg-neutral-100 text-foreground' : 'text-neutral-500'}`} onClick={() => { updateNotebook({ ...notebook, activeId: page.id }); showEditor(); }}>
              <span className="min-w-0 truncate">{page.text.split(/\r\n|\r|\n/u, 1)[0].trim() || 'Empty note'}</span>
            </Button>)}
          </nav>
          <div className="mt-3 flex shrink-0 flex-col gap-2 pt-2">
            {confirmDelete ? <div className="flex flex-wrap items-center gap-2 rounded-md bg-neutral-50 p-3 text-xs" role="group" aria-label="Confirm page deletion">
              <span className="w-full">Delete the selected page and its contents?</span>
              <Button id="confirm-delete" size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={deletePage}>Delete page</Button>
              <Button id="cancel-delete" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div> : <Button id="delete-page" variant="ghost" className="h-8 justify-start px-3 text-xs font-normal text-muted-foreground hover:bg-red-50 hover:text-red-600" onClick={() => setConfirmDelete(true)}><RiDeleteBinLine aria-hidden="true" />Delete selected page</Button>}
          </div>
        </main>
      ) : (
        <main id="editor-view" className="flex min-h-0 flex-1 flex-col px-5 pt-6">
          <label className="sr-only" htmlFor="note">Your note</label>
          <Textarea key={note.id} id="note" className="min-h-0 flex-1 resize-none rounded-none border-0 p-0 pb-4 text-[15px] leading-7 caret-primary shadow-none selection:bg-[#dce6d2] focus-visible:ring-0 [&::-webkit-scrollbar]:w-1.25 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d8cb]" placeholder="Write something down…" spellCheck autoFocus value={note.text} onChange={event => updateNotebook({ ...notebook, pages: notebook.pages.map(page => page.id === note.id ? { ...page, text: event.target.value } : page) })} />
        </main>
      )}

      <footer className="flex shrink-0 select-none justify-between px-5 py-3 text-[10px] text-muted-foreground">
        <span id="save-status" role="status">{notebook.status}</span>
        {pagesOpen ? <span>{notebook.pages.length} {notebook.pages.length === 1 ? 'page' : 'pages'}</span> : <span id="word-count">{words} {words === 1 ? 'word' : 'words'}</span>}
      </footer>
    </div>
  );
}
