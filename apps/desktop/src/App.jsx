import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { RiSubtractLine, RiCloseLine } from '@remixicon/react';
import { Menubar } from 'radix-ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShortcutsView } from '@/components/shortcuts-view';
import { createPage, readPages, savePages, restoreBackup, serializeNotebook, parseNotebook, pagesKey } from '@/lib/pages';

export default function App() {
	const [theme, setTheme] = useState(() => {
		try { const saved = localStorage.getItem('notepad.theme'); if (saved === 'light' || saved === 'dark') return saved; } catch { }
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	});
	useLayoutEffect(() => {
		document.documentElement.dataset.theme = theme;
		try { localStorage.setItem('notepad.theme', theme); } catch { }
	}, [theme]);
	const [notebook, setNotebook] = useState(readPages);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [menu, setMenu] = useState('');
	const [findOpen, setFindOpen] = useState(false);
	const [shortcutsOpen, setShortcutsOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [restorePending, setRestorePending] = useState(false);
	const [query, setQuery] = useState('');
	const editors = useRef(new Map());
	const scrollPositions = useRef(new Map());
	const searchInput = useRef(null);
	const menuFocusTarget = useRef(null);
	const note = notebook.pages.find(page => page.id === notebook.activeId);
	const words = note.text.trim() ? note.text.trim().split(/\s+/u).length : 0;


	useLayoutEffect(() => {
		for (const page of notebook.pages) {
			const editor = editors.current.get(page.id);
			if (editor && editor.value !== page.text) editor.value = page.text;
		}
		if (!shortcutsOpen && !menu && !findOpen) {
			const editor = editors.current.get(note.id);
			editor?.focus({ preventScroll: true });
			if (editor) editor.scrollTop = scrollPositions.current.get(note.id) ?? 0;
		}
	}, [notebook.pages, note.id, shortcutsOpen]);

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
			else if (mod && key === 'p' && event.shiftKey) { event.preventDefault(); setMenu(menu ? '' : 'pages'); }
			else if (mod && key === 'f' && !shortcutsOpen) { event.preventDefault(); setFindOpen(true); requestAnimationFrame(() => searchInput.current?.focus()); }
			else if (mod && key === 'e') { event.preventDefault(); exportNotes(event.shiftKey ? 'json' : 'txt'); }
			else if (mod && event.shiftKey && key === 't') { event.preventDefault(); undoDelete(); }
			else if (event.key === 'Escape') { setFindOpen(false); if (menu) setMenu(''); else setShortcutsOpen(false); }
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function restoreMenuFocus(event) {
		event.preventDefault();
		const target = menuFocusTarget.current;
		menuFocusTarget.current = null;
		if (target === 'find') searchInput.current?.focus();
		else if (target !== 'shortcuts' && !shortcutsOpen) editors.current.get(note.id)?.focus({ preventScroll: true });
	}
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
		} catch { setMessage('Could not import this backup. Choose a valid Digital Notepad JSON backup.'); }
	}
	function recoverBackup() {
		try { setNotebook(restoreBackup()); setMessage('Backup restored.'); }
		catch (error) { setMessage(error.message); }
		setRestorePending(false);
	}
	function showEditor() { setShortcutsOpen(false); setMenu(''); setConfirmDelete(false); setRestorePending(false); }
	function selectPage(id) {
		const editor = editors.current.get(note.id);
		if (editor) scrollPositions.current.set(note.id, editor.scrollTop);
		updateNotebook({ ...notebook, activeId: id });
		showEditor();
	}
	function edit(command) { showEditor(); requestAnimationFrame(() => { editors.current.get(note.id)?.focus({ preventScroll: true }); document.execCommand(command); }); }
	function findNext() {
		const editor = editors.current.get(note.id);
		if (!query || !editor) return;
		const text = editor.value.toLocaleLowerCase();
		let index = text.indexOf(query.toLocaleLowerCase(), editor.selectionEnd);
		if (index < 0) index = text.indexOf(query.toLocaleLowerCase());
		if (index < 0) { setMessage('No matches found.'); return; }
		editor.focus(); editor.setSelectionRange(index, index + query.length);
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
			<header className="desktop-titlebar">
				<Menubar.Root className="desktop-menubar" value={menu} onValueChange={setMenu} aria-label="Application menu">
					<Menubar.Menu value="file"><Menubar.Trigger id="file-menu">File</Menubar.Trigger><Menubar.Portal><Menubar.Content className="desktop-menu" onCloseAutoFocus={restoreMenuFocus} align="start" sideOffset={4}>

						<Menubar.Item id="import-notebook" onSelect={importNotes}>Import backup…</Menubar.Item>
						<Menubar.Item id="export-note" onSelect={() => exportNotes('txt')}>Export page…<span>Ctrl+E</span></Menubar.Item>
						<Menubar.Item id="export-notebook" onSelect={() => exportNotes()}>Export all pages…</Menubar.Item>
						<Menubar.Item id="restore-backup" onSelect={() => setRestorePending(true)}>Restore backup…</Menubar.Item>
						<Menubar.Separator />
						<Menubar.Item id="delete-page" onSelect={() => setConfirmDelete(true)}>Delete current page…</Menubar.Item>
						<Menubar.Separator />
						<Menubar.Item onSelect={() => window.notepad.close()}>Close</Menubar.Item>
					</Menubar.Content></Menubar.Portal></Menubar.Menu>
					<Menubar.Menu value="edit"><Menubar.Trigger id="edit-menu">Edit</Menubar.Trigger><Menubar.Portal><Menubar.Content className="desktop-menu" onCloseAutoFocus={restoreMenuFocus} align="start" sideOffset={4}>
						<Menubar.Item onSelect={() => edit('undo')}>Undo<span>Ctrl+Z</span></Menubar.Item>
						<Menubar.Item onSelect={() => edit('redo')}>Redo<span>Ctrl+Y</span></Menubar.Item>
						<Menubar.Separator />
						<Menubar.Item onSelect={() => edit('cut')}>Cut<span>Ctrl+X</span></Menubar.Item>
						<Menubar.Item onSelect={() => edit('copy')}>Copy<span>Ctrl+C</span></Menubar.Item>
						<Menubar.Item onSelect={() => edit('paste')}>Paste<span>Ctrl+V</span></Menubar.Item>
						<Menubar.Item onSelect={() => edit('selectAll')}>Select all<span>Ctrl+A</span></Menubar.Item>
						<Menubar.Separator />
						<Menubar.Item id="find-menu-item" onSelect={() => { menuFocusTarget.current = 'find'; setFindOpen(true); }}>Find…<span>Ctrl+F</span></Menubar.Item>
						<Menubar.Item id="undo-delete" disabled={!notebook.trash?.length} onSelect={undoDelete}>Restore deleted page</Menubar.Item>
					</Menubar.Content></Menubar.Portal></Menubar.Menu>
					<Menubar.Menu value="pages"><Menubar.Trigger id="pages-menu">Pages</Menubar.Trigger><Menubar.Portal><Menubar.Content className="desktop-menu" onCloseAutoFocus={restoreMenuFocus} align="start" sideOffset={4}>

						<Menubar.Item id="add-page" onSelect={addPage}>New page<span>Ctrl+N</span></Menubar.Item>
						<Menubar.Separator />
						<Menubar.RadioGroup value={note.id} onValueChange={selectPage}>
							{notebook.pages.map((page, index) => <Menubar.RadioItem key={page.id} data-page-id={page.id} value={page.id} aria-current={page.id === note.id ? 'page' : undefined}><span className="menu-check"><Menubar.ItemIndicator>✓</Menubar.ItemIndicator></span><span data-page-label className="menu-page-label">{page.text.split(/\r\n|\r|\n/u, 1)[0].trim() || 'Empty note'}</span></Menubar.RadioItem>)}
						</Menubar.RadioGroup>
					</Menubar.Content></Menubar.Portal></Menubar.Menu>
					<Menubar.Menu value="settings"><Menubar.Trigger id="settings-menu">Settings</Menubar.Trigger><Menubar.Portal><Menubar.Content className="desktop-menu" onCloseAutoFocus={restoreMenuFocus} align="start" sideOffset={4}>
						<Menubar.Item id="theme-toggle" onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</Menubar.Item>
					</Menubar.Content></Menubar.Portal></Menubar.Menu>
					<Menubar.Menu value="help"><Menubar.Trigger id="help-menu">Help</Menubar.Trigger><Menubar.Portal><Menubar.Content className="desktop-menu" onCloseAutoFocus={restoreMenuFocus} align="start" sideOffset={4}>
						<Menubar.Item id="shortcuts-menu-item" onSelect={() => { menuFocusTarget.current = 'shortcuts'; const editor = editors.current.get(note.id); if (editor && !shortcutsOpen) scrollPositions.current.set(note.id, editor.scrollTop); setFindOpen(false); setShortcutsOpen(true); }}>Keyboard shortcuts</Menubar.Item>
					</Menubar.Content></Menubar.Portal></Menubar.Menu>
				</Menubar.Root>
				<div className="window-controls">
					<Button id="minimize" variant="ghost" size="icon" aria-label="Minimize" onClick={() => window.notepad.minimize()}><RiSubtractLine aria-hidden="true" /></Button>
					<Button id="close" variant="ghost" size="icon" aria-label="Close" onClick={() => window.notepad.close()}><RiCloseLine aria-hidden="true" /></Button>
				</div>
			</header>
			{(notebook.storageBlocked || notebook.saveFailed) && <div className="max-h-40 shrink-0 overflow-y-auto border-b border-amber-300/20 bg-amber-300/5 px-5 py-3 text-base text-amber-200" role="alert">
				<p>{notebook.status}</p>
				<div className="mt-2 flex flex-wrap gap-2">
					<Button id="retry-save" size="sm" variant="outline" onClick={() => setNotebook(savePages(notebook, { recover: true }))}>Save current pages</Button>
					<Button size="sm" variant="ghost" onClick={() => exportNotes()}>Export current pages</Button>
					{notebook.storageBlocked && <Button size="sm" variant="ghost" onClick={() => exportNotes('json', true)}>Export unreadable data</Button>}
				</div>
			</div>}

			{(confirmDelete || restorePending) && <div className="confirmation" role="alertdialog" aria-modal="false" aria-label={confirmDelete ? 'Delete page' : 'Restore backup'}>
				<p>{confirmDelete ? 'Delete the current page?' : 'Replace current pages with the previous backup? Export a copy first to keep your changes.'}</p>
				<div><Button id={confirmDelete ? 'confirm-delete' : 'confirm-restore'} onClick={confirmDelete ? deletePage : recoverBackup}>{confirmDelete ? 'Delete' : 'Restore'}</Button><Button id="cancel-delete" variant="ghost" onClick={() => { setConfirmDelete(false); setRestorePending(false); }}>Cancel</Button></div>
			</div>}
			{findOpen && <form className="find-bar" onSubmit={event => { event.preventDefault(); findNext(); }}><input ref={searchInput} id="find-input" aria-label="Find in page" placeholder="Find in page" value={query} onChange={event => setQuery(event.target.value)} /><Button type="submit" variant="ghost">Find next</Button><Button type="button" variant="ghost" size="icon" aria-label="Close find" onClick={() => setFindOpen(false)}><RiCloseLine aria-hidden="true" /></Button></form>}

			{shortcutsOpen && <ShortcutsView onBack={() => setShortcutsOpen(false)} />}
			<main id="editor-view" className={shortcutsOpen ? 'hidden' : 'flex min-h-0 flex-1 flex-col px-6 pt-7'}>
				{notebook.pages.map(page => <Textarea key={page.id} ref={element => { if (element) editors.current.set(page.id, element); else editors.current.delete(page.id); }} id={page.id === note.id ? 'note' : undefined} aria-label="Your note" data-editor-id={page.id} className={page.id !== note.id ? 'hidden' : 'min-h-0 flex-1 resize-none rounded-none border-0 p-0 pb-4 text-base leading-7.5 tracking-[0.005em] caret-foreground shadow-none placeholder:text-muted-foreground/60 selection:bg-accent selection:text-foreground focus-visible:ring-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border'} placeholder="Write something down…" spellCheck defaultValue={page.text} onScroll={event => { if (!shortcutsOpen && !menu && page.id === note.id) scrollPositions.current.set(page.id, event.currentTarget.scrollTop); }} onChange={event => updateNotebook({ ...notebook, pages: notebook.pages.map(item => item.id === page.id ? { ...item, text: event.target.value } : item) })} />)}
			</main>

			{!shortcutsOpen && <footer className="flex shrink-0 select-none items-center justify-between gap-3 px-6 py-4 text-base text-muted-foreground">
				<span id="save-status" role="status" className="flex min-w-0 items-center gap-1.5"><span aria-hidden="true" className={`size-1 shrink-0 rounded-full ${notebook.saveFailed || notebook.storageBlocked ? 'bg-amber-300' : 'bg-emerald-300/60'}`} /><span className="truncate">{notebook.status}</span></span>
				<span id="word-count">{words} {words === 1 ? 'word' : 'words'}</span>
			</footer>}
			{message && <div className="mx-4 mb-3 flex shrink-0 items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-base" role="status"><span>{message}</span><Button size="icon" variant="ghost" className="size-6" aria-label="Dismiss message" onClick={() => setMessage('')}><RiCloseLine aria-hidden="true" /></Button></div>}
		</div>
	);
}
