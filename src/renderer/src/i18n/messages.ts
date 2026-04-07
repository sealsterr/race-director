import { APP_LANGUAGE_LOCALE_TAGS, type AppLanguage } from '../../../shared/language'

export type TranslationKey = string

export type TranslationValues = Record<string, string | number | boolean | null | undefined>

export type Translator = (key: TranslationKey, values?: TranslationValues) => string

const TRANSLATIONS: Record<AppLanguage, Record<TranslationKey, string>> = {
  en: {
    'settings.general.section.interface': 'Interface',
    'settings.general.section.theme': 'Theme',
    'settings.general.section.measurements': 'Measurements',
    'settings.general.language.label': 'Language',
    'settings.general.language.description':
      'Choose the language used for dashboard labels, menus, and system prompts.',
    'settings.language.en': 'English',
    'settings.language.fr': 'French',
    'settings.language.de': 'German',
    'settings.theme.darkMode.label': 'Dark Mode',
    'settings.theme.darkMode.description': 'Toggle dark mode.',
    'settings.theme.palette.label': 'Palette',
    'settings.theme.palette.description': 'Select a built-in palette or tune your own color set.',
    'settings.theme.customPalette': 'Custom palette',
    'settings.theme.color.accent': 'Accent',
    'settings.theme.color.primary': 'Primary',
    'settings.theme.color.secondary': 'Secondary',
    'settings.measurements.speed.label': 'Speed',
    'settings.measurements.speed.description': 'Choose shown speed values.',
    'settings.measurements.speed.kph': 'Kilometers per hour (KPH)',
    'settings.measurements.speed.mph': 'Miles per hour (MPH)',
    'settings.measurements.temperature.label': 'Temperature',
    'settings.measurements.temperature.description':
      'Default unit for ambient, tyre, and track temperatures.',
    'settings.measurements.temperature.c': 'Celsius (C)',
    'settings.measurements.temperature.f': 'Fahrenheit (F)',
    'settings.measurements.distance.label': 'Distance',
    'settings.measurements.distance.description': 'Control how distances and gaps are labeled.',
    'settings.measurements.distance.km': 'Kilometers (km)',
    'settings.measurements.distance.mi': 'Miles (mi)',
    'settings.measurements.pressure.label': 'Pressure',
    'settings.measurements.pressure.description': 'Unit for tyre pressure.',
    'settings.measurements.pressure.kpa': 'Kilopascals (kPa)',
    'settings.measurements.pressure.psi': 'Pounds per square inch (PSI)',
    'settings.measurements.pressure.bar': 'Bar'
  },
  fr: {
    'settings.general.section.interface': 'Interface',
    'settings.general.section.theme': 'Theme',
    'settings.general.section.measurements': 'Mesures',
    'settings.general.language.label': 'Langue',
    'settings.general.language.description':
      'Choisissez la langue utilisee pour les libelles, les menus et les invites systeme.',
    'settings.language.en': 'Anglais',
    'settings.language.fr': 'Francais',
    'settings.language.de': 'Allemand',
    'settings.theme.darkMode.label': 'Mode sombre',
    'settings.theme.darkMode.description': 'Active ou desactive le mode sombre.',
    'settings.theme.palette.label': 'Palette',
    'settings.theme.palette.description':
      'Selectionnez une palette integree ou personnalisez votre propre jeu de couleurs.',
    'settings.theme.customPalette': 'Palette personnalisee',
    'settings.theme.color.accent': 'Accent',
    'settings.theme.color.primary': 'Primaire',
    'settings.theme.color.secondary': 'Secondaire',
    'settings.measurements.speed.label': 'Vitesse',
    'settings.measurements.speed.description': 'Choisissez l unite de vitesse affichee.',
    'settings.measurements.speed.kph': 'Kilometres par heure (km/h)',
    'settings.measurements.speed.mph': 'Miles par heure (mph)',
    'settings.measurements.temperature.label': 'Temperature',
    'settings.measurements.temperature.description':
      'Unite par defaut pour les temperatures ambiantes, des pneus et de la piste.',
    'settings.measurements.temperature.c': 'Celsius (C)',
    'settings.measurements.temperature.f': 'Fahrenheit (F)',
    'settings.measurements.distance.label': 'Distance',
    'settings.measurements.distance.description':
      'Controle la facon dont les distances et les ecarts sont affiches.',
    'settings.measurements.distance.km': 'Kilometres (km)',
    'settings.measurements.distance.mi': 'Miles (mi)',
    'settings.measurements.pressure.label': 'Pression',
    'settings.measurements.pressure.description': 'Unite de pression des pneus.',
    'settings.measurements.pressure.kpa': 'Kilopascals (kPa)',
    'settings.measurements.pressure.psi': 'Livres par pouce carre (PSI)',
    'settings.measurements.pressure.bar': 'Bar'
  },
  de: {
    'settings.general.section.interface': 'Oberflaeche',
    'settings.general.section.theme': 'Design',
    'settings.general.section.measurements': 'Einheiten',
    'settings.general.language.label': 'Sprache',
    'settings.general.language.description':
      'Waehle die Sprache fuer Dashboard-Texte, Menues und Systemhinweise.',
    'settings.language.en': 'Englisch',
    'settings.language.fr': 'Franzoesisch',
    'settings.language.de': 'Deutsch',
    'settings.theme.darkMode.label': 'Dunkler Modus',
    'settings.theme.darkMode.description': 'Schaltet den dunklen Modus ein oder aus.',
    'settings.theme.palette.label': 'Palette',
    'settings.theme.palette.description':
      'Waehle eine integrierte Palette oder passe dein eigenes Farbschema an.',
    'settings.theme.customPalette': 'Benutzerdefinierte Palette',
    'settings.theme.color.accent': 'Akzent',
    'settings.theme.color.primary': 'Primaer',
    'settings.theme.color.secondary': 'Sekundaer',
    'settings.measurements.speed.label': 'Geschwindigkeit',
    'settings.measurements.speed.description': 'Waehle die angezeigte Geschwindigkeitseinheit.',
    'settings.measurements.speed.kph': 'Kilometer pro Stunde (km/h)',
    'settings.measurements.speed.mph': 'Meilen pro Stunde (mph)',
    'settings.measurements.temperature.label': 'Temperatur',
    'settings.measurements.temperature.description':
      'Standardeinheit fuer Luft-, Reifen- und Streckentemperaturen.',
    'settings.measurements.temperature.c': 'Celsius (C)',
    'settings.measurements.temperature.f': 'Fahrenheit (F)',
    'settings.measurements.distance.label': 'Distanz',
    'settings.measurements.distance.description':
      'Legt fest, wie Distanzen und Abstaende angezeigt werden.',
    'settings.measurements.distance.km': 'Kilometer (km)',
    'settings.measurements.distance.mi': 'Meilen (mi)',
    'settings.measurements.pressure.label': 'Druck',
    'settings.measurements.pressure.description': 'Einheit fuer den Reifendruck.',
    'settings.measurements.pressure.kpa': 'Kilopascal (kPa)',
    'settings.measurements.pressure.psi': 'Pfund pro Quadratzoll (PSI)',
    'settings.measurements.pressure.bar': 'Bar'
  }
}

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
  language: AppLanguage,
  key: TranslationKey,
  values?: TranslationValues
): string => {
  const template = TRANSLATIONS[language][key] ?? TRANSLATIONS.en[key] ?? key
  return interpolate(template, values)
}
