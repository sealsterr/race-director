import { useCallback, useEffect, useMemo, useState } from "react";
import type { ConnectionStatus } from "../../../types/lmu";
import type { LogType } from "../../../types/dashboard";
import useAsyncAction from "../../../hooks/useAsyncAction";
import {
  DEFAULT_POLL_RATE_MS,
  validateConnectionFields,
  getConnectionStatusValue,
} from "../components/connectionPanelUtils";

interface UseConnectionPanelStateParams {
  connection: ConnectionStatus;
  defaultApiUrl: string;
  defaultPollRateMs: number;
  onConnectionChange: (status: ConnectionStatus) => void;
  onLog: (message: string, type?: LogType) => void;
}

interface UseConnectionPanelStateResult {
  apiUrl: string;
  pollRateInput: string;
  isEditing: boolean;
  isBusy: boolean;
  errorMessage: string | null;
  validationMessage: string | null;
  statusRows: Array<{ label: string; value: string; mono: boolean }>;
  setApiUrl: (value: string) => void;
  setPollRateInput: (value: string) => void;
  toggleEditing: () => void;
  handleConnect: () => Promise<void>;
  clearError: () => void;
}

const useConnectionPanelState = ({
  connection,
  defaultApiUrl,
  defaultPollRateMs,
  onConnectionChange,
  onLog,
}: UseConnectionPanelStateParams): UseConnectionPanelStateResult => {
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [pollRateInput, setPollRateInput] = useState(
    String(defaultPollRateMs || DEFAULT_POLL_RATE_MS)
  );
  const [isEditing, setIsEditing] = useState(false);
  const { isRunning, errorMessage, clearError, run } = useAsyncAction();

  useEffect(() => {
    setApiUrl(defaultApiUrl);
  }, [defaultApiUrl]);

  useEffect(() => {
    setPollRateInput(String(defaultPollRateMs || DEFAULT_POLL_RATE_MS));
  }, [defaultPollRateMs]);

  const validation = useMemo(
    () => validateConnectionFields(apiUrl, pollRateInput),
    [apiUrl, pollRateInput]
  );

  const handleConnect = useCallback(async (): Promise<void> => {
    if (connection === "CONNECTED") {
      await run(async () => {
        await globalThis.api.disconnect();
        onLog("Disconnected from LMU API", "WARNING");
        onConnectionChange("DISCONNECTED");
      }, "Unable to disconnect from the LMU API.");
      return;
    }

    if (validation.errorMessage) {
      return;
    }

    onLog(`Attempting connection to ${validation.apiUrl}...`, "INFO");
    await run(async () => {
      await globalThis.api.connect(validation.apiUrl, validation.pollRate);
    }, `Unable to connect to ${validation.apiUrl}.`);
  }, [connection, onConnectionChange, onLog, run, validation]);

  const statusRows = useMemo(
    () => [
      { label: "API Endpoint", value: validation.apiUrl || apiUrl.trim() || "Not set", mono: true },
      { label: "Poll Rate", value: `${validation.pollRate}ms`, mono: true },
      { label: "Status", value: getConnectionStatusValue(connection), mono: false },
    ],
    [apiUrl, connection, validation.apiUrl, validation.pollRate]
  );

  return {
    apiUrl,
    pollRateInput,
    isEditing,
    isBusy: isRunning || connection === "CONNECTING",
    errorMessage,
    validationMessage: validation.errorMessage,
    statusRows,
    setApiUrl,
    setPollRateInput,
    toggleEditing: () => {
      clearError();
      setIsEditing((current) => !current);
    },
    handleConnect,
    clearError,
  };
};

export default useConnectionPanelState;
