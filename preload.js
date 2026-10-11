'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('setupApi', {
  save: (cfg) => ipcRenderer.invoke('setup:save', cfg),
  pick: () => ipcRenderer.invoke('setup:pick'),
  cancel: () => ipcRenderer.invoke('setup:cancel'),
});
contextBridge.exposeInMainWorld('resetApi', {
  save: (pw) => ipcRenderer.invoke('reset:save', pw),
  cancel: () => ipcRenderer.invoke('reset:cancel'),
});
