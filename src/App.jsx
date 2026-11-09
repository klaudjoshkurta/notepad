import { useState } from 'react';
import { RiStickyNoteLine, RiPushpinLine, RiSubtractLine, RiCloseLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const storageKey = 'notepad.note.v1';

function readNote() {
	try {
		return { text: localStorage.getItem(storageKey) ?? '', status: 'Saved on this device' };
	} catch {
		return { text: '', status: 'Storage unavailable' };
	}
}

export default function App() {
	const [note, setNote] = useState(readNote);
	const words = note.text.trim() ? note.text.trim().split(/\s+/u).length : 0;

	function changeNote(event) {
		const text = event.target.value;
		try {
			localStorage.setItem(storageKey, text);
			setNote({ text, status: 'Saved on this device' });
		} catch {
			setNote({ text, status: 'Could not save note' });
		}
	}

	return (
		<div className="flex h-dvh flex-col overflow-hidden border border-border bg-background text-foreground">
			<header className="flex h-11 shrink-0 select-none items-center justify-between border-b border-border pl-4 [-webkit-app-region:drag] [app-region:drag]">
				<div className="flex-1"></div>
				<div className="flex h-full [-webkit-app-region:no-drag] [app-region:no-drag]">
					<Button id="minimize" variant="ghost" size="icon" className="h-full w-10 rounded-none" aria-label="Minimize" title="Minimize" onClick={() => window.notepad.minimize()}><RiSubtractLine aria-hidden="true" /></Button>
					<Button id="close" variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-red-600 hover:text-white" aria-label="Close" title="Close" onClick={() => window.notepad.close()}><RiCloseLine aria-hidden="true" /></Button>
				</div>
			</header>
			<main className="flex min-h-0 flex-1 flex-col px-5 pt-6">
				<div className="mb-5 flex items-center justify-between gap-2">
					<h1 className="text-xs font-medium text-muted-foreground">A little space to think.</h1>
					<span className="flex items-center gap-1 whitespace-nowrap rounded bg-accent px-2 py-1 text-[10px] text-primary" title="Always on top"><RiPushpinLine className="size-3" aria-hidden="true" />Pinned</span>
				</div>
				<label className="sr-only" htmlFor="note">Your note</label>
				<Textarea id="note" className="min-h-0 flex-1 resize-none rounded-none border-0 p-0 pb-4 text-[15px] leading-7 caret-primary shadow-none selection:bg-[#dce6d2] focus-visible:ring-0 [&::-webkit-scrollbar]:w-1.25 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d8cb]" placeholder="Write something down…" spellCheck autoFocus value={note.text} onChange={changeNote} />
			</main>
			<footer className="flex shrink-0 select-none justify-between border-t border-border px-5 py-3 text-[10px] text-muted-foreground">
				<span id="save-status" role="status">{note.status}</span>
				<span id="word-count">{words} {words === 1 ? 'word' : 'words'}</span>
			</footer>
		</div>
	);
}
