import type React from "react"

export interface ThemeConfig {
  name: string
  version: string
  author: string
  description: string
  supportsDarkMode: boolean
  supportedLayouts: ("topnav" | "sidebar" | "hybrid")[]
  previewColors: { primary: string; accent: string; bg: string }
}

export interface ERPTheme {
  Layout: React.ComponentType<{ children: React.ReactNode }>
  Header: React.ComponentType
  Sidebar?: React.ComponentType
  LoginPage?: React.ComponentType
  themeConfig: ThemeConfig
}

export type StructuralThemeId = "corporate" | "modern" | "minimal"
