// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

// Quick Start Code

// window.addEventListener('DOMContentLoaded',  () => {
//     const replaceText = (selector, text) => {
//         const element = document.getElementById(selector);
//         if (element) {
//             element.innerText = text
//         }
//     }

//     for (const dependency of ['chrome', 'node', 'electron']) {
//         replaceText(`${dependency}-version`, process.versions[dependency])
//     }
//     console.log(process)
// })

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping'),
    // we can also expose varialbes, not just functions
})
