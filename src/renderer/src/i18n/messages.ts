import { APP_LANGUAGE_LOCALE_TAGS, type AppLanguage } from '../../../shared/language'

export type TranslationKey = string

export type TranslationValues = Record<string, string | number | boolean | null | undefined>

export type Translator = (key: TranslationKey, values?: TranslationValues) => string

const interpolate = (template: string, values?: TranslationValues): string => {
  if (!values) return template

  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = values[token]
    return value === undefined || value === null ? `{${token}}` : String(value)
  })
}

export const getLanguageLocale = (language: AppLanguage): string =>
  APP_LANGUAGE_LOCALE_TAGS[language]

export const translateMessage = (
  _language: AppLanguage,
  key: TranslationKey,
  values?: TranslationValues
): string => interpolate(key, values)
