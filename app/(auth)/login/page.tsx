"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Truck, Eye, EyeOff, Sun, Moon, Globe, Check } from "lucide-react"
import { useTranslation, type Locale } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"

const LANGUAGES: { code: Locale; flag: string }[] = [
  { code: "tr", flag: "🇹🇷" },
  { code: "en", flag: "🇬🇧" },
]

function LoginForm() {
  const { t, locale, setLocale } = useTranslation()
  const router = useRouter()
  const auth = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dark, setDark] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await auth.login({ user_name: username, password })
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.errorInvalid"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Top-right controls */}
      <div className="absolute right-4 top-4 flex items-center gap-1">
        {/* Language */}
        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">{locale}</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <div className="p-1">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLocale(l.code); setLangOpen(false) }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <span className="text-base leading-none">{l.flag}</span>
                    <span className="flex-1 text-left text-foreground">{t(`lang.${l.code}` as const)}</span>
                    {locale === l.code && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          aria-label={dark ? t("topnav.lightTheme") : t("topnav.darkTheme")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {dark ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Truck className="h-7 w-7" />
          </div>
          <div className="text-center leading-none">
            <div className="text-2xl font-bold tracking-tight text-foreground">{t("app.name")}</div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t("app.subtitle")}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-6 text-lg font-semibold text-foreground">{t("login.title")}</h1>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                {t("login.username")}
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("login.usernamePlaceholder")}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                {t("login.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("login.forgotPassword")}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginForm />
}
