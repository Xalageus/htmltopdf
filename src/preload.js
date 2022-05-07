const { contextBridge, ipcRenderer } = require('electron');
const pdf = require('./pdf');
//const chpre = require('./chromium-prepare');

//Receive callbacks
let receiveSavePathCall = null;

function ipcSend(channel, data){
    let validChannels = ['askSavePath'];
    if(validChannels.includes(channel)){
      ipcRenderer.send(channel, data);
    }
}

function connectSavePathCallback(callback){
    receiveSavePathCall = callback;
}

contextBridge.exposeInMainWorld(
    'api', {
        convertToPDF: (/** @type {String} */ url, /** @type {String} */ filename, /** @type {function} */ callback, /** @type {function} */ dcCallback, /** @type {typeof pdf.defaults} */ options) => pdf.convertToPDF(url, filename, callback, dcCallback, options),
        askSavePath: () => ipcSend('askSavePath', null)
    }
);

contextBridge.exposeInMainWorld(
    'callbackConnect', {
        receiveSavePath: (/** @type {function} */ callback) => connectSavePathCallback(callback)
    }
)

//IPC receives
ipcRenderer.on('returnSavePath', (event, args) => {
    receiveSavePathCall(args);
});
