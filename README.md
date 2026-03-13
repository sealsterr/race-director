<div align="center">

# 🏁 RaceDirector

### Professional streamer & commentator broadcast overlay for Le Mans Ultimate

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Status](https://img.shields.io/badge/status-Early%20Development-orange)
![Built with Electron](https://img.shields.io/badge/Electron-36393f?logo=electron)
![Built with React](https://img.shields.io/badge/React-20232a?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007acc?logo=typescript)

</div>

## 📺 Overview

**RaceDirector** is an open-source broadcast overlay
for **Le Mans Ultimate**. Inspired by real-life
TV broadcasts, it gives streamers and commentators tools to deliver a stunning viewing experience.

Join the [Discord server](https://discord.gg/ncqVwZtQED) for updates & support!

## 🚀 Getting Started

### Option A - Install (recommended)

Download the latest installer from the
[Releases](https://github.com/sealsterr/race-director/releases) page and run it.
No setup required!

### Option B - Run from source

#### Requirements
- [Node.js](https://nodejs.org/) v22 or higher
- Le Mans Ultimate (running with REST API enabled)

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
2. Go to **Settings → Gameplay**
3. Enable **REST API** (default port: `6397`)
4. Join a session
5. Connect RaceDirector to `http://localhost:6397`

## ✨ Features - v0.1.0

### 🖥️ Main Dashboard
- Central control hub for the entire application
- Connect / disconnect to LMU REST API
- Live session info
- Launch panel for all child windows
- Activity log

### 📋 Info Window
- Live standings table with 15 configurable columns
- Car status badges
- Car class filter
- Visually distinguished cars
- Camera focus

## 🗺️ Roadmap

| Feature | Status |
|---|---|
| Main Dashboard | ✅ Done |
| Info Window | ✅ Done |
| Overlay Dashboard | 🔜 Coming soon |
| Flag & Penalty System | 🔜 Coming soon |
| Stream Overlays | 🔜 Coming soon |
| Teleprompter | 🔜 Coming soon

## 📄 License

[MIT](LICENSE) © sealsterr
