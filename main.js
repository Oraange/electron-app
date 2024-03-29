const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let rendererProcessesCount = 0;

const createWindow = () => {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icons/win/readeo_icon.ico')
    })

    // Load the index.html of the app.
    ipcMain.handle('ping', () => 'pong')
    win.loadFile('index.html')

    // Open the Dev Tools.
    // win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
app.on('ready', () => {
    // createWindow()
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icons/win/readeo_icon.ico')
    });
    ipcMain.handle('ping', () => 'pong')
    mainWindow.loadFile('index.html')

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });

    mainWindow.webContents.on('did-create-window', () => {
        rendererProcessesCount++;
        console.log(`Number of renderer processes: ${rendererProcessesCount}`)
    })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.

const rendererProcesses = new Set();

setInterval(() => {
    // const windows = BrowserWindow.getAllWindows();
    // const aliveRendererProcessCount = windows.reduce((count, window) => {
    //     const webContents = window.webContents;
    //     if ( !webContents.isDestroyed() ) {
    //         rendererProcesses.add(webContents);
    //         return count + 1;
    //     } else {
    //         rendererProcesses.delete(webContents);
    //         return count;
    //     }
    // }, 0);

    // console.log(`Alive renderer processes: ${aliveRendererProcessCount}`);

    /////////////////////////////////////////

    // const numberOfProcesses = process.getProcessMemoryInfo().thcount;
    // console.log(`Number of processes: ${numberOfProcesses}`)
}, 1000);
