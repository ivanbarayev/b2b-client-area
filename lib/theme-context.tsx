"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type ThemeId = "default" | "ocean" | "crimson" | "forest" | "amber"

export type ThemeMeta = {
  id: ThemeId
  name: string
  primary: string
  accent: string
  bg: string
}

type ThemeVars = {
  primary: string
  primaryFg: string
  accent: string
  accentFg: string
  background: string
  ring: string
  foreground?: string
  card?: string
  cardFg?: string
  muted?: string
  mutedFg?: string
  secondary?: string
  secondaryFg?: string
  border?: string
  input?: string
}

export const THEMES: (ThemeMeta & { vars: ThemeVars })[] = [
  {
    id: "default",
    name: "Default",
    primary: "#243d5c",
    accent: "#dbeafe",
    bg: "#f8fafc",
    vars: {
      primary:    "oklch(0.28 0.045 257)",
      primaryFg:  "oklch(0.985 0.003 250)",
      accent:     "oklch(0.95 0.012 255)",
      accentFg:   "oklch(0.28 0.045 257)",
      background: "oklch(0.985 0.003 250)",
      ring:       "oklch(0.55 0.06 257)",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    primary: "#0e7490",
    accent: "#cffafe",
    bg: "#f0fdff",
    vars: {
      primary:    "oklch(0.44 0.13 200)",
      primaryFg:  "oklch(0.985 0 0)",
      accent:     "oklch(0.91 0.05 200)",
      accentFg:   "oklch(0.25 0.06 200)",
      background: "oklch(0.97 0.015 200)",
      ring:       "oklch(0.55 0.1 200)",
      foreground: "oklch(0.18 0.03 200)",
      card:       "oklch(0.995 0.005 200)",
      cardFg:     "oklch(0.18 0.03 200)",
      muted:      "oklch(0.94 0.025 200)",
      mutedFg:    "oklch(0.46 0.05 200)",
      secondary:  "oklch(0.93 0.03 200)",
      secondaryFg:"oklch(0.25 0.06 200)",
      border:     "oklch(0.87 0.03 200)",
      input:      "oklch(0.87 0.03 200)",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    primary: "#9f1239",
    accent: "#ffe4e6",
    bg: "#fff1f2",
    vars: {
      primary:    "oklch(0.38 0.16 15)",
      primaryFg:  "oklch(0.985 0 0)",
      accent:     "oklch(0.91 0.035 15)",
      accentFg:   "oklch(0.25 0.07 15)",
      background: "oklch(0.975 0.008 15)",
      ring:       "oklch(0.52 0.13 15)",
      foreground: "oklch(0.18 0.04 15)",
      card:       "oklch(0.998 0.003 15)",
      cardFg:     "oklch(0.18 0.04 15)",
      muted:      "oklch(0.94 0.018 15)",
      mutedFg:    "oklch(0.46 0.04 15)",
      secondary:  "oklch(0.93 0.02 15)",
      secondaryFg:"oklch(0.25 0.07 15)",
      border:     "oklch(0.87 0.02 15)",
      input:      "oklch(0.87 0.02 15)",
    },
  },
  {
    id: "forest",
    name: "Forest",
    primary: "#166534",
    accent: "#dcfce7",
    bg: "#f0fdf4",
    vars: {
      primary:    "oklch(0.36 0.12 145)",
      primaryFg:  "oklch(0.985 0 0)",
      accent:     "oklch(0.9 0.04 145)",
      accentFg:   "oklch(0.24 0.06 145)",
      background: "oklch(0.975 0.01 145)",
      ring:       "oklch(0.5 0.1 145)",
      foreground: "oklch(0.17 0.03 145)",
      card:       "oklch(0.997 0.004 145)",
      cardFg:     "oklch(0.17 0.03 145)",
      muted:      "oklch(0.93 0.022 145)",
      mutedFg:    "oklch(0.45 0.04 145)",
      secondary:  "oklch(0.92 0.025 145)",
      secondaryFg:"oklch(0.24 0.06 145)",
      border:     "oklch(0.86 0.025 145)",
      input:      "oklch(0.86 0.025 145)",
    },
  },
  {
    id: "amber",
    name: "Amber",
    primary: "#92400e",
    accent: "#fef3c7",
    bg: "#fffbeb",
    vars: {
      primary:    "oklch(0.45 0.13 65)",
      primaryFg:  "oklch(0.985 0 0)",
      accent:     "oklch(0.91 0.05 65)",
      accentFg:   "oklch(0.26 0.07 65)",
      background: "oklch(0.978 0.012 65)",
      ring:       "oklch(0.57 0.1 65)",
      foreground: "oklch(0.19 0.04 65)",
      card:       "oklch(0.997 0.005 65)",
      cardFg:     "oklch(0.19 0.04 65)",
      muted:      "oklch(0.94 0.025 65)",
      mutedFg:    "oklch(0.46 0.05 65)",
      secondary:  "oklch(0.93 0.03 65)",
      secondaryFg:"oklch(0.26 0.07 65)",
      border:     "oklch(0.87 0.03 65)",
      input:      "oklch(0.87 0.03 65)",
    },
  },
]

const STORAGE_KEY = "app-theme"

type ThemeContextType = {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function applyTheme(id: ThemeId) {
  const meta = THEMES.find((t) => t.id === id)!
  const root = document.documentElement
  const v = meta.vars
  root.style.setProperty("--primary", v.primary)
  root.style.setProperty("--primary-foreground", v.primaryFg)
  root.style.setProperty("--accent", v.accent)
  root.style.setProperty("--accent-foreground", v.accentFg)
  root.style.setProperty("--background", v.background)
  root.style.setProperty("--ring", v.ring)
  root.style.setProperty("--brand", v.primary)
  root.style.setProperty("--brand-foreground", v.primaryFg)
  if (v.foreground)   root.style.setProperty("--foreground", v.foreground)
  else                root.style.removeProperty("--foreground")
  if (v.card)         root.style.setProperty("--card", v.card)
  else                root.style.removeProperty("--card")
  if (v.cardFg)       root.style.setProperty("--card-foreground", v.cardFg)
  else                root.style.removeProperty("--card-foreground")
  if (v.muted)        root.style.setProperty("--muted", v.muted)
  else                root.style.removeProperty("--muted")
  if (v.mutedFg)      root.style.setProperty("--muted-foreground", v.mutedFg)
  else                root.style.removeProperty("--muted-foreground")
  if (v.secondary)    root.style.setProperty("--secondary", v.secondary)
  else                root.style.removeProperty("--secondary")
  if (v.secondaryFg)  root.style.setProperty("--secondary-foreground", v.secondaryFg)
  else                root.style.removeProperty("--secondary-foreground")
  if (v.border)       root.style.setProperty("--border", v.border)
  else                root.style.removeProperty("--border")
  if (v.input)        root.style.setProperty("--input", v.input)
  else                root.style.removeProperty("--input")
  root.setAttribute("data-theme", id)
  localStorage.setItem(STORAGE_KEY, id)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("default")

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? "default"
    setThemeState(stored)
    applyTheme(stored)
  }, [])

  function setTheme(id: ThemeId) {
    setThemeState(id)
    applyTheme(id)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
