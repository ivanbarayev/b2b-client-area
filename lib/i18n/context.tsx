"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Locale, TranslationKey, TranslationParams } from "./types"

type Dict = Record<string, string>

const dictLoaders: Record<Locale, () => Promise<{ default: Dict }>> = {
  en: () => import("./dicts/en.json"),
  tr: () => import("./dicts/tr.json"),
}

const STORAGE_KEY = "app-locale"

function detectLocale(): Locale {
  if (typeof window === "undefined") return "tr"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "en" || stored === "tr") return stored
  const browserLang = navigator.language.slice(0, 2)
  return browserLang === "en" ? "en" : "tr"
}

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, params?: TranslationParams) => string
  loading: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr")
  const [dict, setDict] = useState<Dict>({})
  const [loading, setLoading] = useState(true)

  const loadDict = useCallback(async (loc: Locale) => {
    setLoading(true)
    const mod = await dictLoaders[loc]()
    setDict(mod.default)
    setLoading(false)
  }, [])

  // Initialize locale from localStorage/browser on mount
  useEffect(() => {
    const detected = detectLocale()
    setLocaleState(detected)
    loadDict(detected)
  }, [loadDict])

  const setLocale = useCallback(
    (loc: Locale) => {
      setLocaleState(loc)
      localStorage.setItem(STORAGE_KEY, loc)
      loadDict(loc)
    },
    [loadDict],
  )

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      let value = dict[key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v))
        }
      }
      return value
    },
    [dict],
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, loading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useTranslation must be used within an I18nProvider")
  return ctx
}

export function useLocale() {
  const { locale, setLocale } = useTranslation()
  return { locale, setLocale }
}
