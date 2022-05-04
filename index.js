const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 700,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.removeMenu();
  win.loadFile('gui/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

async function askSavePath(){
  let save = await dialog.showSaveDialog({
    title: 'Save PDF as...',
    buttonLabel: 'Generate',
    filters: [
      {
        name: 'PDF Documents',
        extensions: ['pdf']
      }
    ]
  });

  if(save.canceled){
    return(null);
  }else{
    return(save.filePath);
  }
}

ipcMain.on('askSavePath', async (event) => {
  event.reply('returnSavePath', await askSavePath());
});
