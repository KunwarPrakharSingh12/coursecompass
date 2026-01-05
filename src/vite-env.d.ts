/// <reference types="vite/client" />

interface ElectronAPI {
	isElectron: boolean;
}

interface Window {
	electronAPI?: ElectronAPI;
}
