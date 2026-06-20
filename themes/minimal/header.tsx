"use client"
import { Sun, Moon, Truck } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dealer } from "@/lib/data"
import { useTranslation } from "@/lib/i18n"

export default function Header() {
  const { t } = useTranslation()
  const router = useRouter()
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
    <header className="flex h-12 items-center gap-3 border-b border-border bg-background px-6">
      <Truck className="h-5 w-5 text-primary" />
      <span className="text-sm font-semibold text-foreground">{t("app.name")}</span>
      <div className="flex-1" />
      <button onClick={toggleDark} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        onClick={() => router.push("/settings")}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
      >
        {dealer.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
      </button>
    </header>
  )
}
