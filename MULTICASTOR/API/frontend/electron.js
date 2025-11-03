console.log('App is starting');
const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

process.on('uncaughtException', (error) => {
  dialog.showErrorBox('Uncaught Exception', error.message);
  console.error('Uncaught Exception:', error);
});

function createWindow() {
  console.log('App is starting');
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));
  win.webContents.openDevTools(); // pour debug
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
