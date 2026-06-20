"use client"

import { useState } from "react"
import { KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n"

interface FieldErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function ChangePasswordPanel({ embedded }: { embedded?: boolean }) {
  const { t } = useTranslation()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [errors, setErrors] = useState<FieldErrors>({})
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate(): FieldErrors {
    const errs: FieldErrors = {}

    if (!currentPassword.trim()) {
      errs.currentPassword = t("changePassword.errorRequired")
    }

    if (!newPassword.trim()) {
      errs.newPassword = t("changePassword.errorRequired")
    } else if (newPassword.length < 8) {
      errs.newPassword = t("changePassword.errorMinLength")
    }

    if (!confirmPassword.trim()) {
      errs.confirmPassword = t("changePassword.errorRequired")
    } else if (confirmPassword !== newPassword) {
      errs.confirmPassword = t("changePassword.errorMismatch")
    }

    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
    }, 1400)
  }

  if (success) {
    return (
      <div className={embedded ? "py-8" : "flex flex-1 items-center justify-center p-8"}>
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 shadow-lg text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t("changePassword.successTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("changePassword.successDesc")}</p>
          </div>
          {!embedded && (
            <Link
              href="/settings/profile"
              className="w-full rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("changePassword.backToProfile")}
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={embedded ? "" : "flex flex-1 items-center justify-center p-8"}>
      <div className={embedded ? "w-full" : "w-full max-w-md"}>
        {/* Header */}
        {!embedded && (
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">{t("changePassword.title")}</h1>
              <p className="text-xs text-muted-foreground">{t("changePassword.subtitle")}</p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Current Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                {t("changePassword.currentPassword")}
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? t("changePassword.hide") : t("changePassword.show")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-destructive mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                {t("changePassword.newPassword")}
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? t("changePassword.hide") : t("changePassword.show")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                {t("changePassword.confirmPassword")}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? t("changePassword.hide") : t("changePassword.show")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={processing}
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {processing && (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {processing ? t("changePassword.saving") : t("changePassword.save")}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
