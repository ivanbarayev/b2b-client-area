"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, Palette, Layout, User, KeyRound, type LucideIcon } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

const NAV_ITEMS: { href: string; labelKey: string; icon: LucideIcon }[] = [
  { href: "/settings", labelKey: "settings.appearance", icon: Palette },
  { href: "/settings/themes", labelKey: "settings.layoutTheme", icon: Layout },
  { href: "/settings/profile", labelKey: "settings.profile", icon: User },
  { href: "/settings/change-password", labelKey: "settings.changePassword", icon: KeyRound },
]

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Geri"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("settings.title")}</h1>
        </div>

        <div className="flex gap-8">
          <nav className="flex w-44 shrink-0 flex-col gap-1">
            {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {t(labelKey as Parameters<typeof t>[0])}
                </button>
              )
            })}
          </nav>

          <div className="flex-1">{children}</div>
        </div>
      </main>
  )
}
