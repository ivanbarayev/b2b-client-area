"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { StructuralThemeId } from "./types"

type StructuralThemeContextType = {
  structuralTheme: StructuralThemeId
  setStructuralTheme: (id: StructuralThemeId) => void
}

const StructuralThemeContext = createContext<StructuralThemeContextType | null>(null)
const STORAGE_KEY = "structural-theme"

export function StructuralThemeProvider({ children }: { children: ReactNode }) {
  const [structuralTheme, setStructuralThemeState] = useState<StructuralThemeId>("modern")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as StructuralThemeId | null
    if (stored && ["corporate", "modern", "minimal"].includes(stored)) {
      setStructuralThemeState(stored)
    }
  }, [])

  function setStructuralTheme(id: StructuralThemeId) {
    setStructuralThemeState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  return (
    <StructuralThemeContext.Provider value={{ structuralTheme, setStructuralTheme }}>
      {children}
    </StructuralThemeContext.Provider>
  )
}

export function useStructuralTheme() {
  const ctx = useContext(StructuralThemeContext)
  if (!ctx) throw new Error("useStructuralTheme must be used within StructuralThemeProvider")
  return ctx
}
