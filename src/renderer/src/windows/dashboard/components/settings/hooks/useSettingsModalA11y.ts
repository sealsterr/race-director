import { useCallback, useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import type { SettingsTabId } from "../../../settings/types";

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const DISCARD_CHANGES_MESSAGE =
  "Discard your unsaved settings changes?";

interface UseSettingsModalA11yParams {
  activeTab: SettingsTabId;
  isDirty: boolean;
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: SettingsTabId) => void;
  tabs: readonly SettingsTabId[];
}

interface UseSettingsModalA11yResult {
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
  handleDialogKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  handleTabKeyDown: (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number
  ) => void;
  requestClose: () => void;
  setTabRef: (index: number, node: HTMLButtonElement | null) => void;
}

const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true"
  );
};

const useSettingsModalA11y = ({
  activeTab,
  isDirty,
  isOpen,
  onClose,
  onTabChange,
  tabs,
}: UseSettingsModalA11yParams): UseSettingsModalA11yResult => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const frameId = globalThis.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      globalThis.cancelAnimationFrame(frameId);
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  const requestClose = useCallback(() => {
    if (isDirty && !globalThis.confirm(DISCARD_CHANGES_MESSAGE)) {
      return;
    }

    onClose();
  }, [isDirty, onClose]);

  const setTabRef = useCallback((index: number, node: HTMLButtonElement | null) => {
    tabRefs.current[index] = node;
  }, []);

  const focusTabByIndex = useCallback(
    (index: number) => {
      const nextTab = tabs[index];
      if (!nextTab) return;

      onTabChange(nextTab);
      globalThis.requestAnimationFrame(() => {
        tabRefs.current[index]?.focus();
      });
    },
    [onTabChange, tabs]
  );

  const handleTabKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      if (tabs.length === 0) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusTabByIndex((index + 1) % tabs.length);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusTabByIndex((index - 1 + tabs.length) % tabs.length);
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusTabByIndex(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        focusTabByIndex(tabs.length - 1);
      }
    },
    [focusTabByIndex, tabs.length]
  );

  const handleDialogKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    },
    [requestClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    const activeIndex = tabs.indexOf(activeTab);
    if (activeIndex >= 0) {
      tabRefs.current[activeIndex]?.setAttribute("tabindex", "0");
    }
  }, [activeTab, isOpen, tabs]);

  return {
    closeButtonRef,
    dialogRef,
    handleDialogKeyDown,
    handleTabKeyDown,
    requestClose,
    setTabRef,
  };
};

export default useSettingsModalA11y;
