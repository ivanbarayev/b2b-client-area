"use client"
import { Bell, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"
import { dealer } from "@/lib/data"
import { useTranslation } from "@/lib/i18n"

export default function Header() {
  const { t } = useTranslation()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = stored ? stored === "dark" : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-5">
      <div className="flex-1" />
      <button
        onClick={toggleDark}
        aria-label={dark ? t("topnav.lightTheme") : t("topnav.darkTheme")}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
      </button>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {dealer.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
      </div>
    </header>
  )
}
