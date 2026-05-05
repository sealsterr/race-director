# Architecture

RaceDirector is an Electron desktop app for controlling Le Mans Ultimate broadcast overlays. The
app is split into four main layers: Electron main, preload IPC, React renderer windows, and shared
contracts.

```mermaid
flowchart TD
  LMU["Le Mans Ultimate REST API"] --> MainApi["main/api lmuApi"]
  Bridge["LMU telemetry bridge (.NET)"] --> MainTelemetry["main/api lmuTelemetryBridge"]
  MainApi --> MainIpc["main/ipc handlers"]
  MainTelemetry --> MainIpc
  MainIpc --> Preload["preload api"]
  Preload --> Renderer["renderer windows"]
  Shared["shared contracts"] --> MainIpc
  Shared --> Preload
  Shared --> Renderer
  Renderer --> OverlayStore["overlay/race state stores"]
  Renderer --> Overlays["broadcast overlay windows"]
```

## Layers

### Electron Main

The main process owns OS-level behavior and external integrations:

- REST API connection and polling
- telemetry bridge process access
- window lifecycle and overlay window positioning
- updater integration
- preset file dialogs and persistence

Renderer code should not call Electron or Node APIs directly. Add main-process behavior behind a
small IPC handler and expose only the needed method from preload.

### Preload Bridge

The preload layer exposes `window.api` through Electron's `contextBridge`. It is the public contract
between renderer UI and the main process.

Keep preload methods explicit and narrow. Prefer typed method names such as `overlay.savePreset` or
`updater.check` over a generic command dispatcher.

### Renderer Windows

The renderer owns UI only:

- main dashboard
- info window
- overlay control window
- broadcast overlay windows
- system dialogs and settings UI

Business logic should live in hooks, stores, shared helpers, or main-process services rather than
inside large components. Components should stay readable and focused.

### Shared Contracts

The `src/shared` directory contains types and small shared helpers used across main, preload, and
renderer. Use it for stable contracts such as overlay configuration, updater state, language,
measurement units, and LMU data models.

Avoid importing renderer-only code into shared modules. Shared files need to stay safe for both
Electron main and renderer builds.

## Runtime Flow

```mermaid
sequenceDiagram
  participant UI as Renderer UI
  participant Preload as Preload API
  participant Main as Main IPC
  participant LMU as REST API
  participant Telemetry as Telemetry Bridge

  UI->>Preload: connect(url, pollRate)
  Preload->>Main: ipcRenderer.invoke("lmu:connect")
  Main->>LMU: poll session and standings
  Main->>Telemetry: read telemetry snapshots
  Main-->>Preload: state and telemetry events
  Preload-->>UI: typed callbacks
  UI->>UI: update stores and windows
```

The renderer requests a connection through preload. The main process owns polling and broadcasts
typed state updates back to every relevant window. Overlay windows consume the same application state
as the dashboard, but render it for broadcast display.

## Overlay Flow

```mermaid
sequenceDiagram
  participant Control as Overlay Control
  participant Preload as Preload API
  participant Main as Main Process
  participant Overlay as Overlay Window

  Control->>Preload: broadcastConfig(config)
  Preload->>Main: overlay:broadcastConfig
  Main-->>Overlay: overlay:configUpdate
  Overlay->>Preload: updateBounds(id, x, y, w, h)
  Preload->>Main: overlay:updateBounds
  Main-->>Control: overlay:boundsChanged
```

Overlay control changes should go through the main process so every window sees the same config and
saved bounds. Presets should remain versioned, validated, and recoverable when possible.

## Updater Flow

The updater state is centralized in the main process and exposed through the preload API. Renderer
UI should treat updater state as read-only and trigger explicit commands:

- `updater.check`
- `updater.download`
- `updater.install`

Keep updater status transitions deterministic so they can be tested without publishing real releases.

## Contribution Guidelines For Architecture Changes

- Keep UI and logic separate.
- Add shared types before duplicating contracts across main, preload, and renderer.
- Prefer small IPC methods with typed payloads over generic channels.
- Keep file persistence and OS access in the main process.