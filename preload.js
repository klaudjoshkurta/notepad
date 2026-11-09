const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notepad', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  exportFile: (text, kind) => ipcRenderer.invoke('notes:export', { text, kind }),
  importFile: () => ipcRenderer.invoke('notes:import'),
  retry: () => ipcRenderer.send('app:retry'),
});
