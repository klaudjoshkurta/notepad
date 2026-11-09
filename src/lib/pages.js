export const pagesKey = 'notepad.pages.v1';
export const backupKey = 'notepad.pages.backup.v1';
export function createPage(text = '') { return { id: crypto.randomUUID(), text }; }
export function pageLabel(page) { return page.text.split(/\r\n|\r|\n/u, 1)[0].trim() || 'Empty note'; }

export function parseNotebook(raw) {
  const saved = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!saved || !Array.isArray(saved.pages) || !saved.pages.length ||
    saved.pages.some(page => !page || typeof page.id !== 'string' || !page.id || typeof page.text !== 'string') ||
    new Set(saved.pages.map(page => page.id)).size !== saved.pages.length) throw new Error('Invalid notebook');
  const trash = Array.isArray(saved.trash) ? saved.trash.filter(item => item?.page && typeof item.page.id === 'string' && typeof item.page.text === 'string').slice(-20) : [];
  return { pages: saved.pages, activeId: saved.pages.some(page => page.id === saved.activeId) ? saved.activeId : saved.pages[0].id, trash };
}
export function serializeNotebook(data) {
  return JSON.stringify({ pages: data.pages, activeId: data.activeId, trash: data.trash ?? [] }, null, 2);
}
export function readPages() {
  try {
    const raw = localStorage.getItem(pagesKey);
    if (raw !== null) return { ...parseNotebook(raw), status: 'Saved on this device' };
    const page = createPage(localStorage.getItem('notepad.note.v1') ?? '');
    return savePages({ pages: [page], activeId: page.id, trash: [] });
  } catch {
    const page = createPage();
    return { pages: [page], activeId: page.id, trash: [], status: 'Saved notes could not be loaded. Export or restore a backup.', storageBlocked: true };
  }
}
export function savePages(data, { recover = false } = {}) {
  if (data.storageBlocked && !recover) return data;
  try {
    const old = localStorage.getItem(pagesKey);
    if (old !== null) {
      try {
        parseNotebook(old);
        localStorage.setItem(backupKey, old);
      } catch (error) {
        if (!recover) throw error;
        // Keep unreadable data for recovery before replacing it.
        localStorage.setItem(`notepad.recovery.${Date.now()}`, old);
      }
    }
    localStorage.setItem(pagesKey, serializeNotebook(data));
    return { ...data, storageBlocked: false, saveFailed: false, status: 'Saved on this device' };
  } catch {
    return { ...data, saveFailed: true, status: 'Changes are not saved. Export a copy or retry.' };
  }
}
export function restoreBackup() {
  const raw = localStorage.getItem(backupKey);
  if (!raw) throw new Error('No backup is available.');
  return savePages(parseNotebook(raw), { recover: true });
}
