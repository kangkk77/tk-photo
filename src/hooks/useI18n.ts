import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  defaultLocale,
  dictionaries,
  type Locale,
} from '../i18n/dictionaries'

const I18N_STORAGE_KEY = 'tk-photo-locale'

type TranslationValues = Record<string, string | number>

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, values?: TranslationValues) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function isSupportedLocale(value: string | null): value is Locale {
  return value === 'zh-CN' || value === 'en-US'
}

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const storedLocale = window.localStorage.getItem(I18N_STORAGE_KEY)
  return isSupportedLocale(storedLocale) ? storedLocale : defaultLocale
}

function formatMessage(template: string, values?: TranslationValues) {
  if (!values) {
    return template
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
    const value = values[key]
    return value === undefined || value === null ? '' : String(value)
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getStoredLocale)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(I18N_STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale]

    return {
      locale,
      setLocale,
      t: (key: string, values?: TranslationValues) => {
        const fallbackMessage =
          dictionaries[defaultLocale][key] ?? key
        const message = dictionary[key] ?? fallbackMessage
        return formatMessage(message, values)
      },
    }
  }, [locale])

  return createElement(I18nContext.Provider, { value }, children)
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider.')
  }

  return context
}
