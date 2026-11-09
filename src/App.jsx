import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { RiAddLine, RiArrowLeftLine, RiArrowRightSLine, RiDeleteBinLine, RiSubtractLine, RiCloseLine, RiMenuLine, RiSearchLine, RiPushpinLine, RiArrowGoBackLine, RiDownloadLine, RiUploadLine } from '@remixicon/react';
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
    <div id="app-ready" className="flex h-dvh flex-col overflow-hidden border border-border bg-background text-foreground antialiased">
      <header className="flex h-12 shrink-0 select-none items-center justify-between border-b border-border/50 pl-2 [-webkit-app-region:drag] [app-region:drag]">
				<div className="flex flex-1 items-center gap-2">
          <Button key={pagesOpen ? 'back' : 'menu'} id={pagesOpen ? 'back-to-note' : 'pages-menu'} size="icon" variant="ghost" autoFocus={pagesOpen} aria-label={pagesOpen ? 'Back to note' : 'Pages'} title={pagesOpen ? 'Back to note' : 'Pages (Ctrl+Shift+P)'} className="size-8 text-muted-foreground hover:text-foreground [-webkit-app-region:no-drag] [app-region:no-drag]" onClick={() => { if (pagesOpen) showEditor(); else showPages(); }}>
						{pagesOpen ? <RiArrowLeftLine aria-hidden="true" /> : <RiMenuLine aria-hidden="true" />}
					</Button>
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">notepad</span>
          <RiPushpinLine className="ml-1 size-3 text-muted-foreground/60" aria-label="Always on top" role="img" />
				</div>
				<div className="flex h-full [-webkit-app-region:no-drag] [app-region:no-drag]">
          <Button id="minimize" variant="ghost" size="icon" className="h-full w-10 rounded-none text-muted-foreground" aria-label="Minimize" title="Minimize" onClick={() => window.notepad.minimize()}><RiSubtractLine aria-hidden="true" /></Button>
          <Button id="close" variant="ghost" size="icon" className="h-full w-10 rounded-none text-muted-foreground hover:bg-red-500/20 hover:text-red-300" aria-label="Close" title="Close" onClick={() => window.notepad.close()}><RiCloseLine aria-hidden="true" /></Button>
				</div>
			</header>
      {(notebook.storageBlocked || notebook.saveFailed) && <div className="max-h-40 shrink-0 overflow-y-auto border-b border-amber-300/20 bg-amber-300/5 px-5 py-3 text-xs text-amber-200" role="alert">
				<p>{notebook.status}</p>
				<div className="mt-2 flex flex-wrap gap-2">
					<Button id="retry-save" size="sm" variant="outline" onClick={() => setNotebook(savePages(notebook, { recover: true }))}>Save current pages</Button>
					<Button size="sm" variant="ghost" onClick={() => exportNotes()}>Export current pages</Button>
					{notebook.storageBlocked && <Button size="sm" variant="ghost" onClick={() => exportNotes('json', true)}>Export unreadable data</Button>}
				</div>
			</div>}

			{pagesOpen && (
        <main id="pages-view" aria-label="Pages" className="flex min-h-0 flex-1 flex-col px-5 pb-2 pt-6 [@media(max-height:420px)]:overflow-y-auto [@media(max-height:420px)]:pt-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
          <div className="mb-5 flex shrink-0 items-center justify-between gap-3 [@media(max-height:420px)]:mb-3">
            <div><h1 className="text-xl font-medium tracking-tight">Your pages<span className="ml-2 align-middle text-xs font-normal text-muted-foreground">{notebook.pages.length}</span></h1><p className="mt-1 text-[11px] text-muted-foreground [@media(max-height:420px)]:hidden">A place for whatever’s on your mind.</p></div>
            <Button id="add-page" size="icon" className="size-8 shrink-0 bg-foreground text-background hover:bg-foreground/85" aria-label="New page" title="New page (Ctrl+N)" onClick={addPage}><RiAddLine aria-hidden="true" /></Button>
          </div>
					<label className="sr-only" htmlFor="search-pages">Search notes</label>
          <div className="relative mb-4 shrink-0"><RiSearchLine className="pointer-events-none absolute left-3 top-3 size-3.5 text-muted-foreground" aria-hidden="true" /><input ref={searchInput} id="search-pages" type="search" placeholder="Find a page…" value={query} onChange={event => setQuery(event.target.value)} className="h-10 w-full rounded-lg border border-border/60 bg-surface pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-ring" /></div>
          <nav aria-label="Pages" className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto [@media(max-height:420px)]:flex-none [@media(max-height:420px)]:overflow-visible [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
            {filteredPages.map(page => <Button key={page.id} data-page-id={page.id} aria-current={page.id === note.id ? 'page' : undefined} variant="ghost" className={`group h-[68px] w-full shrink-0 justify-start gap-3 rounded-lg border px-3.5 text-left font-normal hover:bg-surface ${page.id === note.id ? 'border-border bg-surface' : 'border-transparent text-muted-foreground'}`} onClick={() => { updateNotebook({ ...notebook, activeId: page.id }); showEditor(); }}>
              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${page.id === note.id ? 'bg-foreground/70' : 'bg-border'}`} />
              <span className="flex min-w-0 flex-1 flex-col gap-1"><span data-page-label className="truncate text-[13px] text-foreground">{page.text.split(/\r\n|\r|\n/u, 1)[0].trim() || 'Empty note'}</span><span className="truncate text-[11px] font-normal text-muted-foreground">{page.text.split(/\r\n|\r|\n/u).slice(1).join(' ').trim() || (page.text.trim() ? 'Open to keep writing' : 'A fresh start')}</span></span>
              <RiArrowRightSLine aria-hidden="true" className="text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
						</Button>)}
            {!filteredPages.length && <div className="px-3 py-10 text-center"><RiSearchLine className="mx-auto mb-3 size-5 text-muted-foreground/50" aria-hidden="true" /><p className="text-xs text-muted-foreground">No pages found</p><p className="mt-1 text-[11px] text-muted-foreground/70">Try a different word.</p></div>}
					</nav>
          <div className="mt-3 flex max-h-[45%] shrink-0 flex-col gap-1 overflow-y-auto border-t border-border/60 pt-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border">
						<details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer rounded-lg px-2 py-2.5 transition-colors hover:bg-surface hover:text-foreground">Backup and files</summary>
							<div className="flex flex-wrap gap-1">
              <Button id="export-notebook" size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => exportNotes()}><RiDownloadLine aria-hidden="true" />Export all</Button>
								<Button id="export-note" size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => exportNotes('txt')}>Export selected note</Button>
              <Button id="import-notebook" size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={importNotes}><RiUploadLine aria-hidden="true" />Import</Button>
								<Button id="restore-backup" size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => setRestorePending(true)}>Restore backup</Button>
							</div>
            {restorePending && <div className="rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed"><p className="mb-3">Replace current pages with the previous saved backup? Export a copy first to keep unsaved changes.</p><Button id="confirm-restore" size="sm" onClick={recoverBackup}>Restore</Button><Button size="sm" variant="ghost" onClick={() => setRestorePending(false)}>Cancel</Button></div>}
						</details>
            {!!notebook.trash?.length && <Button id="undo-delete" size="sm" variant="ghost" className="shrink-0 justify-start px-2 text-xs font-normal text-muted-foreground" onClick={undoDelete}><RiArrowGoBackLine aria-hidden="true" />Restore last deleted page</Button>}
            {confirmDelete ? <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-lg border border-red-300/20 bg-red-300/5 p-3 text-xs" role="group" aria-label="Confirm page deletion">
							<span className="w-full">Delete the selected page and its contents?</span>
							<Button id="confirm-delete" size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={deletePage}>Delete page</Button>
							<Button id="cancel-delete" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div> : <Button id="delete-page" variant="ghost" className="h-8 shrink-0 justify-start px-2 text-xs font-normal text-muted-foreground hover:bg-red-400/10 hover:text-red-300" onClick={() => setConfirmDelete(true)}><RiDeleteBinLine aria-hidden="true" />Delete selected page</Button>}
					</div>
				</main>
			)}
        <main id="editor-view" className={pagesOpen ? 'hidden' : 'flex min-h-0 flex-1 flex-col px-6 pt-7'} aria-hidden={pagesOpen || undefined}>
				{notebook.pages.map(page => <Textarea key={page.id} ref={element => { if (element) editors.current.set(page.id, element); else editors.current.delete(page.id); }} id={page.id === note.id ? 'note' : undefined} aria-label="Your note" data-editor-id={page.id} className={page.id !== note.id ? 'hidden' : 'min-h-0 flex-1 resize-none rounded-none border-0 p-0 pb-4 text-[15px] leading-7.5 tracking-[0.005em] caret-foreground shadow-none placeholder:text-muted-foreground/60 selection:bg-accent selection:text-foreground focus-visible:ring-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border'} placeholder="Write something down…" spellCheck defaultValue={page.text} onScroll={event => scrollPositions.current.set(page.id, event.currentTarget.scrollTop)} onChange={event => updateNotebook({ ...notebook, pages: notebook.pages.map(item => item.id === page.id ? { ...item, text: event.target.value } : item) })} />)}
			</main>

			<footer className="flex shrink-0 select-none items-center justify-between gap-3 px-6 py-4 text-[10px] text-muted-foreground">
				<span id="save-status" role="status" className="flex min-w-0 items-center gap-1.5"><span aria-hidden="true" className={`size-1 shrink-0 rounded-full ${notebook.saveFailed || notebook.storageBlocked ? 'bg-amber-300' : 'bg-emerald-300/60'}`} /><span className="truncate">{notebook.status}</span></span>
				{pagesOpen ? <span>{notebook.pages.length} {notebook.pages.length === 1 ? 'page' : 'pages'}</span> : <span id="word-count">{words} {words === 1 ? 'word' : 'words'}</span>}
			</footer>
			{message && <div className="mx-4 mb-3 flex shrink-0 items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs" role="status"><span>{message}</span><Button size="icon" variant="ghost" className="size-6" aria-label="Dismiss message" onClick={() => setMessage('')}><RiCloseLine aria-hidden="true" /></Button></div>}
		</div>
	);
}
