import { useState } from 'react';
import { RiAddLine, RiDeleteBinLine, RiSubtractLine, RiCloseLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createPage, readPages, savePages } from '@/lib/pages';

export default function App() {
	const [notebook, setNotebook] = useState(readPages);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const note = notebook.pages.find(page => page.id === notebook.activeId);
	const words = note.text.trim() ? note.text.trim().split(/\s+/u).length : 0;

	function updateNotebook(next) { setNotebook(savePages(next)); }
	function updatePage(changes) {
		updateNotebook({ ...notebook, pages: notebook.pages.map(page => page.id === note.id ? { ...page, ...changes } : page) });
	}
	function addPage() {
		const page = createPage();
		updateNotebook({ ...notebook, pages: [...notebook.pages, page], activeId: page.id });
		setConfirmDelete(false);
	}
	function deletePage() {
		const index = notebook.pages.findIndex(page => page.id === note.id);
		const pages = notebook.pages.filter(page => page.id !== note.id);
		if (!pages.length) pages.push(createPage('Page 1'));
		updateNotebook({ ...notebook, pages, activeId: pages[Math.min(index, pages.length - 1)].id });
		setConfirmDelete(false);
	}

	return (
		<div className="flex h-dvh flex-col overflow-hidden border border-border bg-background text-foreground">
			<header className="flex h-11 shrink-0 select-none items-center justify-between border-b border-border pl-4 [-webkit-app-region:drag] [app-region:drag]">
				<div className="flex-1" />
				<div className="flex h-full [-webkit-app-region:no-drag] [app-region:no-drag]">
					<Button id="minimize" variant="ghost" size="icon" className="h-full w-10 rounded-none" aria-label="Minimize" title="Minimize" onClick={() => window.notepad.minimize()}><RiSubtractLine aria-hidden="true" /></Button>
					<Button id="close" variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-red-600 hover:text-white" aria-label="Close" title="Close" onClick={() => window.notepad.close()}><RiCloseLine aria-hidden="true" /></Button>
				</div>
			</header>
			<main className="flex min-h-0 flex-1 flex-col px-5 pt-6">
				<div className="mb-3 flex shrink-0 items-center gap-1">
					<label className="sr-only" htmlFor="page-select">Pages</label>
					<select id="page-select" className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" value={note.id} onChange={event => { updateNotebook({ ...notebook, activeId: event.target.value }); setConfirmDelete(false); }}>
						{notebook.pages.map(page => <option key={page.id} value={page.id}>{page.title.trim() || 'Untitled page'}</option>)}
					</select>
					<Button id="add-page" variant="ghost" size="icon" className="size-8 shrink-0" title="New page" aria-label="New page" onClick={addPage}><RiAddLine aria-hidden="true" /></Button>
					<Button id="delete-page" variant="ghost" size="icon" className="size-8 shrink-0" title="Delete page" aria-label="Delete page" onClick={() => setConfirmDelete(true)}><RiDeleteBinLine aria-hidden="true" /></Button>
				</div>
				{confirmDelete && <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2 rounded-md border border-border p-2 text-xs" role="group" aria-label="Confirm page deletion">
					<span className="w-full">Delete this page and its contents?</span>
					<Button id="confirm-delete" size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={deletePage}>Delete page</Button>
					<Button id="cancel-delete" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
				</div>}
				<label className="sr-only" htmlFor="page-title">Page title</label>
				<input id="page-title" className="mb-3 h-8 w-full shrink-0 rounded-sm bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" placeholder="Untitled page" maxLength={100} value={note.title} onChange={event => updatePage({ title: event.target.value })} />
				<label className="sr-only" htmlFor="note">Your note</label>
				<Textarea key={note.id} id="note" className="min-h-0 flex-1 resize-none rounded-none border-0 p-0 pb-4 text-[15px] leading-7 caret-primary shadow-none selection:bg-[#dce6d2] focus-visible:ring-0 [&::-webkit-scrollbar]:w-1.25 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d8cb]" placeholder="Write something down…" spellCheck autoFocus value={note.text} onChange={event => updatePage({ text: event.target.value })} />
			</main>
			<footer className="flex shrink-0 select-none justify-between border-t border-border px-5 py-3 text-[10px] text-muted-foreground">
				<span id="save-status" role="status">{notebook.status}</span>
				<span id="word-count">{words} {words === 1 ? 'word' : 'words'}</span>
			</footer>
		</div>
	);
}
