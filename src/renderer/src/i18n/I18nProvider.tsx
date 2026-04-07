/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_APP_LANGUAGE, type AppLanguage } from '../../../shared/language'
import {
  DASHBOARD_SETTINGS_STORAGE_KEY,
  loadDashboardSettingsFromStorage
} from '../windows/dashboard/settings/defaults'
import {
  getLanguageLocale,
  translateMessage,
  type TranslationKey,
  type TranslationValues,
  type Translator
} from './messages'

interface I18nContextValue {
  language: AppLanguage
  locale: string
  t: Translator
}

const I18nContext = createContext<I18nContextValue>({
  language: DEFAULT_APP_LANGUAGE,
  locale: getLanguageLocale(DEFAULT_APP_LANGUAGE),
  t: (key, values) => translateMessage(DEFAULT_APP_LANGUAGE, key, values)
})

const getStoredLanguage = (): AppLanguage =>
  loadDashboardSettingsFromStorage(globalThis.localStorage).general.language

export const I18nProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const [language, setLanguage] = useState<AppLanguage>(() => getStoredLanguage())

  useEffect(() => {
    const syncFromStorage = (): void => {
      setLanguage(getStoredLanguage())
    }

    const unsubscribe = globalThis.api.settings.onGlobalUiChanged(() => {
      syncFromStorage()
    })

    const onStorage = (event: StorageEvent): void => {
      if (event.key !== DASHBOARD_SETTINGS_STORAGE_KEY) return
      syncFromStorage()
    }

    globalThis.addEventListener('storage', onStorage)
    globalThis.addEventListener('rd:settingsChanged', syncFromStorage)

    return () => {
      unsubscribe()
      globalThis.removeEventListener('storage', onStorage)
      globalThis.removeEventListener('rd:settingsChanged', syncFromStorage)
    }
  }, [])

  const value = useMemo<I18nContextValue>(() => {
    const t: Translator = (key: TranslationKey, values?: TranslationValues): string =>
      translateMessage(language, key, values)

    return {
      language,
      locale: getLanguageLocale(language),
      t
    }
  }, [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = (): I18nContextValue => useContext(I18nContext)
