const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  obtenerUsuarios: () => ipcRenderer.invoke('get-users'),
  crearUsuario: (usuario) => ipcRenderer.invoke('create-user', usuario)
});
