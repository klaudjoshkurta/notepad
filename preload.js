const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notepad', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
});
