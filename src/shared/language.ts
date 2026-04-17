export const APP_LANGUAGES = ['en', 'fr', 'de'] as const

export type AppLanguage = (typeof APP_LANGUAGES)[number]

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'en'

export const APP_LANGUAGE_LOCALE_TAGS: Record<AppLanguage, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE'
}

type LegacyLanguage = 'English' | 'French' | 'German' | 'Romanian' | 'Hungarian'

const LEGACY_LANGUAGE_MAP: Record<LegacyLanguage, AppLanguage> = {
  English: 'en',
  French: 'fr',
  German: 'de',
  Romanian: 'en',
  Hungarian: 'en'
}

const isLegacyLanguage = (value: string): value is LegacyLanguage => value in LEGACY_LANGUAGE_MAP

export const isAppLanguage = (value: unknown): value is AppLanguage =>
  typeof value === 'string' && APP_LANGUAGES.some((language) => language === value)

export const coerceAppLanguage = (value: unknown): AppLanguage => {
  if (isAppLanguage(value)) {
    return value
  }

  if (typeof value === 'string' && isLegacyLanguage(value)) {
    return LEGACY_LANGUAGE_MAP[value]
  }

  return DEFAULT_APP_LANGUAGE
}
