const { app, BrowserWindow, ipcMain, screen, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { readBounds, saveBounds } = require('./window-state');
const profileDirectory = app.commandLine.getSwitchValue('user-data-dir');
if (profileDirectory) {
	require('node:fs').mkdirSync(profileDirectory, { recursive: true });
	app.setPath('userData', profileDirectory);
}

let mainWindow;
function createWindow() {
	mainWindow = new BrowserWindow({
		...readBounds(app.getPath('userData'), screen.getAllDisplays()),
		minWidth: 280,
		minHeight: 320,
		title: 'Notepad',
		frame: false,
		maximizable: false,
		fullscreenable: false,
		alwaysOnTop: true,
		backgroundColor: '#17181b',
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
	mainWindow.webContents.on('will-prevent-unload', event => {
		const choice = dialog.showMessageBoxSync(mainWindow, { type: 'warning', title: 'Unsaved notes', message: 'Some changes have not been saved.', detail: 'Keep editing to export a copy or retry saving.', buttons: ['Keep editing', 'Close without saving'], defaultId: 0, cancelId: 0 });
		if (choice === 1) event.preventDefault();
	});
	mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
	let boundsTimer;
	const remember = () => saveBounds(app.getPath('userData'), mainWindow.getNormalBounds());
	for (const event of ['move', 'resize']) mainWindow.on(event, () => { clearTimeout(boundsTimer); boundsTimer = setTimeout(remember, 300); });
	mainWindow.on('close', () => { clearTimeout(boundsTimer); remember(); });
	const showFailure = () => {
		mainWindow.loadFile(path.join(__dirname, 'startup-error.html')).catch(error => dialog.showErrorBox('Notepad could not start', error.message));
		mainWindow.show();
	};
	mainWindow.webContents.on('render-process-gone', showFailure);
	mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html')).catch(showFailure);
	mainWindow.once('ready-to-show', () => mainWindow.show());
}

ipcMain.handle('notes:export', async (event, { text, kind } = {}) => {
	if (event.sender !== mainWindow?.webContents || typeof text !== 'string') throw new Error('Invalid export');
	const json = kind === 'json';
	const result = await dialog.showSaveDialog(mainWindow, { defaultPath: json ? 'notepad-backup.json' : 'note.txt', filters: [{ name: json ? 'Notebook backup' : 'Text file', extensions: [json ? 'json' : 'txt'] }] });
	if (result.canceled) return false;
	await fs.writeFile(result.filePath, text, 'utf8');
	return true;
});
ipcMain.handle('notes:import', async event => {
	if (event.sender !== mainWindow?.webContents) throw new Error('Invalid request');
	const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [{ name: 'Notebook backup', extensions: ['json'] }] });
	if (result.canceled) return null;
	if ((await fs.stat(result.filePaths[0])).size > 20 * 1024 * 1024) throw new Error('Backup exceeds 20 MB');
	return fs.readFile(result.filePaths[0], 'utf8');
});
ipcMain.on('app:retry', event => {
	if (event.sender === mainWindow?.webContents) mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html')).catch(error => dialog.showErrorBox('Notepad could not start', error.message));
});

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
