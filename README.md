# Course Compass Desktop

Electron-wrapped desktop build for the Vite + React app.

## Prerequisites

- Node 18+ and npm
- On Windows, ensure long path support is enabled for Electron installs if you hit path-length issues.

## Install

```bash
npm install
```

## Run in Electron (dev)

```bash
npm run electron:dev
```

Starts Vite on port 8080 and launches Electron pointing at the dev server.

## Build desktop app

```bash
npm run electron:build
```

Outputs installers/artifacts via electron-builder (see `dist/` and `dist_electron/` after the run).
# coursecompass
