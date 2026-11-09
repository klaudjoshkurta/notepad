const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

let mainWindow;
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 440,
		height: 620,
		minWidth: 280,
		minHeight: 320,
		title: 'Notepad',
		frame: false,
		maximizable: false,
		fullscreenable: false,
		alwaysOnTop: true,
		backgroundColor: '#FFF',
		show: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});
	mainWindow.setAlwaysOnTop(true, 'floating');
	mainWindow.setMenu(null);
	mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
	mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
	mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
	mainWindow.once('ready-to-show', () => mainWindow.show());
}

ipcMain.on('window:minimize', (event) => {
	if (event.sender === mainWindow?.webContents) mainWindow.minimize();
});
ipcMain.on('window:close', (event) => {
	if (event.sender === mainWindow?.webContents) mainWindow.close();
});

if (!app.requestSingleInstanceLock()) {
	app.quit();
} else {
	app.on('second-instance', () => {
		if (!mainWindow || mainWindow.isDestroyed()) return;
		if (mainWindow.isMinimized()) mainWindow.restore();
		mainWindow.show();
		mainWindow.focus();
	});
	app.whenReady().then(createWindow);
	app.on('window-all-closed', () => app.quit());
}
