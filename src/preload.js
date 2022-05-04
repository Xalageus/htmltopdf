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
        convertToPDF: (/** @type {String} */ url, /** @type {String} */ filename, /** @type {Boolean} */ ril, /** @type {Boolean} */ rel, /** @type {Array<String>} */ rlc, /** @type {function} */ callback, /** @type {function} */ dcCallback) => pdf.convertToPDF(url, filename, ril, rel, rlc, callback, dcCallback),
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
