import { app } from 'electron'
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { DriverTelemetrySnapshot, TelemetrySnapshot } from '../../shared/types'

export type TelemetryDriverSnapshot = DriverTelemetrySnapshot

interface RawTelemetrySnapshot {
  timestamp?: number
  cars?: DriverTelemetrySnapshot[]
  error?: string | null
  Timestamp?: number
  Cars?: DriverTelemetrySnapshot[]
  Error?: string | null
}

const EMPTY_SNAPSHOT: TelemetrySnapshot = {
  timestamp: 0,
  cars: [],
  error: null
}

export class LmuTelemetryBridge {
  private process: ChildProcess | null = null
  private latestSnapshot: TelemetrySnapshot = EMPTY_SNAPSHOT
  private stdoutBuffer = ''
  private onSnapshot: ((snapshot: TelemetrySnapshot) => void) | null = null

  public start(intervalMs: number): void {
    if (this.process) {
      return
    }

    const packagedDllPath = join(
      process.resourcesPath,
      'telemetry-bridge',
      'LmuTelemetryBridge.dll'
    )
    const projectPath = join(
      process.cwd(),
      'src',
      'main',
      'lmu-telemetry-bridge',
      'LmuTelemetryBridge.csproj'
    )

    const commandArgs =
      app.isPackaged && existsSync(packagedDllPath)
        ? [packagedDllPath, String(intervalMs)]
        : existsSync(projectPath)
          ? ['run', '--project', projectPath, '--no-launch-profile', '--', String(intervalMs)]
          : null

    if (!commandArgs) {
      return
    }

    const child = spawn('dotnet', commandArgs, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    })
    this.process = child

    child.stdout?.on('data', (chunk: Buffer) => {
      this.stdoutBuffer += chunk.toString('utf8')
      this.consumeStdoutBuffer()
    })
    child.stderr?.on('data', () => undefined)

    child.on('error', () => {
      this.process = null
      this.stdoutBuffer = ''
    })

    child.on('exit', () => {
      this.process = null
      this.stdoutBuffer = ''
    })
  }

  public stop(): void {
    this.process?.kill()
    this.process = null
    this.stdoutBuffer = ''
    this.latestSnapshot = EMPTY_SNAPSHOT
    this.onSnapshot?.(this.getLatestSnapshot())
  }

  public getLatestSnapshot(): TelemetrySnapshot {
    return {
      timestamp: this.latestSnapshot.timestamp ?? 0,
      cars: Array.isArray(this.latestSnapshot.cars) ? this.latestSnapshot.cars : [],
      error: this.latestSnapshot.error ?? null
    }
  }

  public setSnapshotCallback(callback: ((snapshot: TelemetrySnapshot) => void) | null): void {
    this.onSnapshot = callback
  }

  private consumeStdoutBuffer(): void {
    const lines = this.stdoutBuffer.split(/\r?\n/)
    this.stdoutBuffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) {
        continue
      }

      try {
        const parsed = JSON.parse(trimmed) as RawTelemetrySnapshot
        this.latestSnapshot = {
          timestamp: parsed.timestamp ?? parsed.Timestamp ?? 0,
          cars: parsed.cars ?? parsed.Cars ?? [],
          error: parsed.error ?? parsed.Error ?? null
        }
        this.onSnapshot?.(this.getLatestSnapshot())
      } catch (error) {
        console.warn('Ignoring malformed telemetry bridge line:', error)
      }
    }
  }
}

export const telemetryBridge = new LmuTelemetryBridge()
