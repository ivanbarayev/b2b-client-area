"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Car, ShoppingBasket, ClipboardList, SlidersHorizontal,
  UserCircle, Calculator, BookOpen, Handshake, Lightbulb, MoreHorizontal,
  Truck, Settings, LogOut, ChevronLeft, ChevronRight, type LucideIcon,
} from "lucide-react"
import { navItems, dealer } from "@/lib/data"
import { useTranslation } from "@/lib/i18n"

const iconMap: Record<string, LucideIcon> = {
  Search, Car, ShoppingBasket, ClipboardList, SlidersHorizontal,
  UserCircle, Calculator, BookOpen, Handshake, Lightbulb, MoreHorizontal,
}

export default function Sidebar() {
  const { t } = useTranslation()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState("arama")

  return (
    <aside
      className={`flex flex-col border-r border-border bg-card transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Truck className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-foreground">{t("app.name")}</span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              title={collapsed ? t(item.labelKey) : undefined}
              className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {Icon && <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />}
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border p-2">
        {!collapsed && (
          <div className="mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {dealer.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-semibold text-foreground">{dealer.name}</div>
              <div className="text-[10px] text-muted-foreground">{dealer.code}</div>
            </div>
          </div>
        )}
        <div className="flex gap-1">
          <button
            onClick={() => router.push("/settings")}
            title={t("topnav.settings")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            title={t("topnav.logout")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  )
}
