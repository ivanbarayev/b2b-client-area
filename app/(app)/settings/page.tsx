"use client"

import { Check } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { useTheme, THEMES, type ThemeId } from "@/lib/theme-context"

function ThemeCard({ id, name, primary, accent, bg, selected, onSelect }: {
  id: ThemeId
  name: string
  primary: string
  accent: string
  bg: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        selected ? "border-primary shadow-md" : "border-border hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      <div className="relative h-32 w-full overflow-hidden" style={{ background: bg }}>
        <div className="flex h-8 items-center gap-2 px-3" style={{ background: primary }}>
          <div className="h-2 w-2 rounded-full opacity-70" style={{ background: accent }} />
          <div className="h-1.5 w-12 rounded-full opacity-60" style={{ background: accent }} />
          <div className="ml-auto flex gap-1.5">
            <div className="h-1.5 w-8 rounded-full opacity-40" style={{ background: accent }} />
            <div className="h-5 w-5 rounded-full" style={{ background: accent, opacity: 0.8 }} />
          </div>
        </div>
        <div className="flex gap-2 px-3 py-2.5">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-1.5 w-3/4 rounded-full opacity-30" style={{ background: primary }} />
            <div className="h-1.5 w-1/2 rounded-full opacity-20" style={{ background: primary }} />
            <div className="mt-2 h-8 w-full rounded-md border opacity-20" style={{ borderColor: primary }} />
            <div className="h-8 w-full rounded-md border opacity-10" style={{ borderColor: primary }} />
          </div>
          <div className="w-16 rounded-md" style={{ background: accent, opacity: 0.7 }} />
        </div>
        <div
          className="absolute bottom-3 right-3 h-5 rounded-md px-2 text-[8px] font-bold leading-5 text-white"
          style={{ background: primary }}
        >
          ●●●
        </div>
      </div>
      <div className={`flex items-center justify-between px-3 py-2.5 ${selected ? "bg-accent/40" : "bg-card"}`}>
        <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>{name}</span>
        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <>
      <div className="mb-6 border-b border-border pb-5">
        <h2 className="text-base font-semibold text-foreground">{t("settings.appearance")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.appearanceDesc")}</p>
      </div>
      <div className="mb-3 text-sm font-medium text-foreground">{t("settings.theme")}</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {THEMES.map((th) => (
          <ThemeCard
            key={th.id}
            {...th}
            selected={theme === th.id}
            onSelect={() => setTheme(th.id)}
          />
        ))}
      </div>
    </>
  )
}
