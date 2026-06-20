"use client"

import {
  Search,
  Car,
  ShoppingBasket,
  ClipboardList,
  ClipboardCheck,
  SlidersHorizontal,
  UserCircle,
  Calculator,
  CreditCard,
  BookOpen,
  Handshake,
  Lightbulb,
  MoreHorizontal,
  Truck,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  Sun,
  Moon,
  Globe,
  Check,
  Package,
  Megaphone,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { navItems, dealer } from "@/lib/data"
import { useTranslation, type Locale } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"

const LANGUAGES: { code: Locale; flag: string }[] = [
  { code: "tr", flag: "🇹🇷" },
  { code: "en", flag: "🇬🇧" },
]

const NAV_ROUTES: Record<string, string> = {
  arama: "/",
  arac: "/vehicles",
  sepet: "/cart",
  oem: "/oem",
  odemeler: "/payments",
  mutabakat: "/reconciliation",
  "siparis-listesi": "/orders",
}

const iconMap: Record<string, LucideIcon> = {
  Search,
  Car,
  ShoppingBasket,
  ClipboardList,
  ClipboardCheck,
  SlidersHorizontal,
  UserCircle,
  Calculator,
  CreditCard,
  BookOpen,
  Handshake,
  Lightbulb,
  MoreHorizontal,
}

type Notification = {
  id: string
  icon: LucideIcon
  iconColor: string
  title: string
  body: string
  time: string
  unread: boolean
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: Package,
    iconColor: "text-blue-500",
    title: "Sipariş Kargoya Verildi",
    body: "SP-2025-00138 no'lu siparişiniz kargoya verildi.",
    time: "5 dk önce",
    unread: true,
  },
  {
    id: "2",
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    title: "Stok Uyarısı",
    body: "BOSCH YAĞ FİLTRESİ ürününde stok azaldı.",
    time: "1 sa önce",
    unread: true,
  },
  {
    id: "3",
    icon: Megaphone,
    iconColor: "text-primary",
    title: "Yeni Kampanya",
    body: "BREMBO fren disklerinde %15 indirim başladı.",
    time: "3 sa önce",
    unread: false,
  },
]

export function TopNav() {
  const { t, locale, setLocale } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()

  const active = Object.entries(NAV_ROUTES).find(([, route]) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  )?.[0] ?? "arama"
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [dark, setDark] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = stored ? stored === "dark" : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const profileMenu = [
    { id: "ayarlar", label: t("topnav.settings"), icon: Settings },
    { id: "cikis", label: t("topnav.logout"), icon: LogOut, danger: true },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center gap-4 px-5 py-2.5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 pr-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Truck className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <span className="text-xl font-bold tracking-tight text-foreground">{t("app.name")}</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t("app.subtitle")}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 items-center justify-center">
          <ul className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon]
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => router.push(NAV_ROUTES[item.id] ?? "/")}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex w-[68px] flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors ${
                      isActive
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                  >
                    <span className="relative">
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
                      {"badge" in item && item.badge ? (
                        <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wide">{t(item.labelKey)}</span>
                    {isActive ? (
                      <span className="absolute -bottom-[11px] left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-primary" />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-0.5 pl-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={notifOpen}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors ${
                notifOpen ? "bg-accent text-foreground" : "hover:bg-accent hover:text-foreground"
              }`}
              aria-label={t("topnav.notifications")}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <span className="text-sm font-semibold text-foreground">
                    {t("topnav.notifications")}
                    {unreadCount > 0 && (
                      <span className="ml-2 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setNotifications((ns) => ns.map((n) => ({ ...n, unread: false })))}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      {t("topnav.notificationsMarkAll")}
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">{t("topnav.notificationsEmpty")}</p>
                    </div>
                  ) : (
                    <div className="p-1">
                      {notifications.map((notif) => {
                        const Icon = notif.icon
                        return (
                          <button
                            key={notif.id}
                            onClick={() => setNotifications((ns) => ns.map((n) => n.id === notif.id ? { ...n, unread: false } : n))}
                            className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent ${
                              notif.unread ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className={`mt-0.5 shrink-0 ${notif.iconColor}`}>
                              <Icon className="h-4 w-4" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs font-semibold ${notif.unread ? "text-foreground" : "text-muted-foreground"}`}>
                                  {notif.title}
                                </span>
                                <span className="shrink-0 text-[10px] text-muted-foreground">{notif.time}</span>
                              </div>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{notif.body}</p>
                            </div>
                            {notif.unread && (
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors ${
                langOpen ? "bg-accent text-foreground" : "hover:bg-accent hover:text-foreground"
              }`}
            >
              <Globe className="h-[16px] w-[16px]" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {locale}
              </span>
            </button>

            {langOpen ? (
              <div
                role="listbox"
                className="absolute right-0 top-[calc(100%+6px)] z-40 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
              >
                <div className="p-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      role="option"
                      aria-selected={locale === l.code}
                      onClick={() => { setLocale(l.code); setLangOpen(false) }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <span className="text-base leading-none">{l.flag}</span>
                      <span className="flex-1 text-left text-foreground">{t(`lang.${l.code}` as const)}</span>
                      {locale === l.code && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={dark ? t("topnav.lightTheme") : t("topnav.darkTheme")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {dark ? (
              <Sun className="h-[17px] w-[17px]" />
            ) : (
              <Moon className="h-[17px] w-[17px]" />
            )}
          </button>

          {/* Divider */}
          <div className="mx-1 h-6 w-px bg-border" />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={`flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors ${
                menuOpen ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {dealer.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </div>
              <div className="hidden text-left leading-tight lg:block">
                <div className="text-xs font-semibold text-foreground">{dealer.name}</div>
                <div className="text-[10px] text-muted-foreground">{dealer.code}</div>
              </div>
              <ChevronDown
                className={`hidden h-4 w-4 text-muted-foreground transition-transform lg:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-40 w-60 origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-lg"
              >
                <div className="border-b border-border bg-accent/40 px-4 py-3">
                  <div className="text-sm font-semibold text-foreground">{dealer.name}</div>
                  <div className="text-xs text-muted-foreground">{dealer.company} · {dealer.code}</div>
                </div>
                <div className="p-1.5">
                  {profileMenu.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false)
                          if (item.id === "ayarlar") router.push("/settings")
                          if (item.id === "cikis") { logout().then(() => router.push("/login")) }
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          item.danger
                            ? "text-destructive hover:bg-destructive/10"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
