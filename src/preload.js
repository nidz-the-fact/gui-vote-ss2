const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  startTransaction: (config) => ipcRenderer.invoke('start-transaction', config),
  stopTransaction: () => ipcRenderer.invoke('stop-transaction'),
  on: (channel, callback) => ipcRenderer.on(channel, callback)
});
