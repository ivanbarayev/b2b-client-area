"use client"
import { useEffect, useState } from "react"
import { useStructuralTheme } from "@/lib/theme-system/structural-context"
import type { ERPTheme } from "@/lib/theme-system/types"
import { loadTheme } from "@/lib/theme-system/loader"
import { AuthGuard } from "@/components/auth-guard"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { structuralTheme } = useStructuralTheme()
  const [theme, setTheme] = useState<ERPTheme | null>(null)

  useEffect(() => {
    loadTheme(structuralTheme).then(setTheme)
  }, [structuralTheme])

  if (!theme) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col bg-background">{children}</div>
      </AuthGuard>
    )
  }

  const { Layout } = theme
  return <AuthGuard><Layout>{children}</Layout></AuthGuard>
}
