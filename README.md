<div align="center">

# RaceDirector

### Professional streamer and commentator broadcast overlay for Le Mans Ultimate

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-0.2.0-blue)
![Status](https://img.shields.io/badge/status-Early%20Development-orange)
![Built with Electron](https://img.shields.io/badge/Electron-36393f?logo=electron)
![Built with React](https://img.shields.io/badge/React-20232a?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007acc?logo=typescript)

</div>

## Overview

**RaceDirector** is an open-source broadcast overlay for **Le Mans Ultimate**.
Inspired by real TV broadcasts, it gives streamers and commentators the tools to
build a cleaner and more professional race presentation.

Join the [Discord server](https://discord.gg/ncqVwZtQED) for updates and support.

## Getting Started

### Option A - Install (recommended)

Download the latest installer from the
[Releases](https://github.com/sealsterr/race-director/releases) page and run it.

### Option B - Run from source

#### Requirements

- [Node.js](https://nodejs.org/) v22 or higher
- Le Mans Ultimate running with the REST API enabled

#### Steps

```bash
git clone https://github.com/sealsterr/race-director.git
cd race-director
npm install
npm run dev
```

### Enabling the LMU REST API

Before launching RaceDirector, make sure the REST API is active in LMU:

1. Launch **Le Mans Ultimate**
2. Go to **Settings -> Gameplay**
3. Enable **REST API** (default port: `6397`)
4. Join a session
5. Connect RaceDirector to `http://localhost:6397`

## Features - v0.2.0

### 🖥️ Main Dashboard

- Central control hub for the entire application
- Resizable workspace with connection, session, and activity panels
- Connect and disconnect from the LMU REST API
- Built-in activity log for connection, window, and system events
- Settings tab with general, network, overlay, and advanced tabs
- Accent presets, measurement units, motion preferences, and startup behavior options
- In-app update checking

### 📋 Info Window

- Live standings table with configurable columns
- Car status badges and penalty visibility
- Car class filtering
- Driver highlighting
- One-click camera focus

### 🎛️ Overlay Dashboard

- Dedicated control window for all broadcast overlays
- Enable and disable overlays independently
- Adjust overlay opacity, scale, display target, and screen position
- Switch between drag mode and click-through mode
- Save and load overlay presets for reusable layouts

### 📺 Stream Overlays

#### Live Standings Overlay

- Filtered tower layouts
- Multiple display modes
- Fight detection and battle highlighting
- Car class & tyre colors, pit markers, and finish indicators

#### Driver Card Overlay

- Driver identity and class presentation
- Telemetry widgets including speed, laptime and fuel data

#### Gap Overlay

- Focused battle view
- Adjustable trigger threshold
- Optional car class display

#### Session Info Overlay

- Session label and type
- Time remaining and lap count
- Session flag state
- Animated session progress bar

## 🗺️ To-do

| Feature | Status |
| --- | --- |
| Main Dashboard | ✅ Done |
| Info Window | ✅ Done |
| Overlay Dashboard | ✅ Done |
| Stream Overlays | ✅ Done |
| Flag & Penalty System | 🔜 Coming soon |
| Teleprompter | 🔜 Coming soon |

## License

[MIT](LICENSE) Copyright (c) 2026 sealsterr
