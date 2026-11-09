export const pagesKey = 'notepad.pages.v1';
export function createPage(title = 'Untitled page', text = '') {
  return { id: crypto.randomUUID(), title, text };
}
export function readPages() {
  try {
    const raw = localStorage.getItem(pagesKey);
    if (raw !== null) {
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved.pages) || !saved.pages.length ||
        saved.pages.some(page => !page || typeof page.id !== 'string' || typeof page.title !== 'string' || typeof page.text !== 'string') ||
        new Set(saved.pages.map(page => page.id)).size !== saved.pages.length) throw new Error('Invalid pages');
      return { ...saved, activeId: saved.pages.some(page => page.id === saved.activeId) ? saved.activeId : saved.pages[0].id, status: 'Saved on this device' };
    }
    const page = createPage('Page 1', localStorage.getItem('notepad.note.v1') ?? '');
    const data = { pages: [page], activeId: page.id };
    localStorage.setItem(pagesKey, JSON.stringify(data));
    return { ...data, status: 'Saved on this device' };
  } catch {
    // Preserve unreadable storage instead of overwriting it.
    const page = createPage('Page 1');
    return { pages: [page], activeId: page.id, status: 'Could not load saved pages', storageBlocked: true };
  }
}
export function savePages(data) {
  if (data.storageBlocked) return data;
  try {
    localStorage.setItem(pagesKey, JSON.stringify({ pages: data.pages, activeId: data.activeId }));
    return { ...data, status: 'Saved on this device' };
  } catch {
    return { ...data, status: 'Could not save pages' };
  }
}
