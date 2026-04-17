import { create } from 'zustand'
import type { AppState, ConnectionStatus, DriverStanding, SessionInfo } from '../types/lmu'

interface RaceStore extends AppState {
  setConnection: (status: ConnectionStatus) => void
  setSession: (session: SessionInfo | null) => void
  setStandings: (standings: DriverStanding[]) => void
}

export const useRaceStore = create<RaceStore>((set) => ({
  connection: 'DISCONNECTED',
  session: null,
  standings: [],
  lastUpdated: null,

  setConnection: (status) => set({ connection: status }),
  setSession: (session) => set({ session }),
  setStandings: (standings) => set({ standings, lastUpdated: Date.now() })
}))
