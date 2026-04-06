import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw, Settings2 } from 'lucide-react'
import CustomNumberField from '../../../components/ui/CustomNumberField'
import type { ConnectionStatus } from '../../../types/lmu'
import type { LogType } from '../../../types/dashboard'
import useConnectionPanelState from '../hooks/useConnectionPanelState'
import {
  getConnectionButtonClass,
  getConnectionButtonLabel,
  MAX_POLL_RATE_MS,
  MIN_POLL_RATE_MS
} from './connectionPanelUtils'

interface ConnectionPanelProps {
  connection: ConnectionStatus
  defaultApiUrl: string
  defaultPollRateMs: number
  onConnectionChange: (status: ConnectionStatus) => void
  onLog: (message: string, type?: LogType) => void
}

const ConnectionPanel = ({
  connection,
  defaultApiUrl,
  defaultPollRateMs,
  onConnectionChange,
  onLog
}: ConnectionPanelProps): React.ReactElement => {
  const {
    apiUrl,
    pollRateInput,
    isEditing,
    isBusy,
    errorMessage,
    validationMessage,
    statusRows,
    setApiUrl,
    setPollRateInput,
    toggleEditing,
    handleConnect,
    clearError
  } = useConnectionPanelState({
    connection,
    defaultApiUrl,
    defaultPollRateMs,
    onConnectionChange,
    onLog
  })

  const helperMessage = errorMessage ?? validationMessage

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-rd-border bg-rd-surface">
      <div className="flex items-center justify-between border-b border-rd-border px-4 py-3">
        <div className="flex items-center gap-2">
          {connection === 'CONNECTED' ? (
            <Wifi size={14} className="text-rd-success" />
          ) : (
            <WifiOff size={14} className="text-rd-muted" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-rd-text">
            Connection
          </span>
        </div>
        <button
          type="button"
          onClick={toggleEditing}
          className="text-rd-subtle transition-colors hover:text-rd-text"
          aria-expanded={isEditing}
          aria-controls="connection-panel-editor"
        >
          <Settings2 size={13} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-px p-1">
          {statusRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded px-3 py-2 hover:bg-rd-elevated"
            >
              <span className="text-xs text-rd-subtle">{row.label}</span>
              <span
                className={`max-w-[65%] text-right text-xs ${row.mono ? 'font-mono' : ''} text-rd-text`}
                title={row.value}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <motion.div
          id="connection-panel-editor"
          initial={false}
          animate={{ height: isEditing ? 'auto' : 0, opacity: isEditing ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex flex-col gap-3 border-t border-rd-border px-4 py-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="api-url" className="text-xs text-rd-muted">
                API URL
              </label>
              <input
                id="api-url"
                type="text"
                value={apiUrl}
                onChange={(e) => {
                  clearError()
                  setApiUrl(e.target.value)
                }}
                placeholder="http://127.0.0.1:6397"
                className="w-full rounded border border-rd-border bg-rd-elevated px-3 py-1.5 font-mono text-xs text-rd-text outline-none focus:border-rd-accent/60"
                aria-invalid={Boolean(validationMessage)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="poll-rate" className="text-xs text-rd-muted">
                Poll Rate (ms)
              </label>
              <CustomNumberField
                id="poll-rate"
                value={pollRateInput}
                min={MIN_POLL_RATE_MS}
                max={MAX_POLL_RATE_MS}
                step={50}
                suffix="ms"
                containerClassName="self-start"
                ariaInvalid={Boolean(validationMessage)}
                onChange={(nextValue) => {
                  clearError()
                  setPollRateInput(nextValue)
                }}
              />
            </div>

            {helperMessage ? (
              <p
                aria-live="polite"
                className={`rounded border px-3 py-2 text-xs ${
                  errorMessage
                    ? 'border-rd-error/30 bg-rd-error/10 text-rd-error'
                    : 'border-rd-gold/30 bg-rd-gold/10 text-rd-gold'
                }`}
              >
                {helperMessage}
              </p>
            ) : null}
          </div>
        </motion.div>

        <div className="mt-auto border-t border-rd-border p-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => void handleConnect()}
          disabled={isBusy || Boolean(validationMessage && connection !== 'CONNECTED')}
          className={`
            flex w-full items-center justify-center gap-2 rounded
            py-2 text-xs font-semibold uppercase tracking-wider
            transition-colors duration-150
            ${getConnectionButtonClass(connection)}
          `}
        >
          {isBusy ? <RefreshCw size={12} className="animate-spin" /> : null}
          {getConnectionButtonLabel(connection)}
        </motion.button>
        </div>
      </div>
    </div>
  )
}

export default ConnectionPanel
