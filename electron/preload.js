const { contextBridge } = require("electron");

// Expose a minimal flag so the renderer can detect Electron safely.
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
});
