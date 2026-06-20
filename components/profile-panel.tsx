"use client"

import { User, Wallet } from "lucide-react"
import { dealer } from "@/lib/data"
import { useTranslation } from "@/lib/i18n"

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const initials = dealer.name
  .split(" ")
  .map((n) => n[0])
  .join("")
  .toUpperCase()

interface ReadOnlyFieldProps {
  label: string
  value: string
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex h-10 w-full cursor-default items-center rounded-lg bg-accent/40 px-3 text-sm font-medium text-foreground">
        {value}
      </div>
    </div>
  )
}

export function ProfilePanel({ embedded }: { embedded?: boolean }) {
  const { t } = useTranslation()

  return (
    <div className={embedded ? "flex flex-col gap-5" : "flex flex-1 flex-col items-center gap-6 p-6 sm:p-8"}>
      <div className={embedded ? "w-full" : "w-full max-w-2xl"}>
        {/* Page header */}
        {!embedded && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("profile.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("profile.subtitle")}</p>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* Avatar + info header card */}
          <div className="rounded-xl border border-border bg-card px-6 py-5">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow">
                {initials}
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xl font-bold text-foreground">{dealer.name}</div>
                <div className="text-sm text-muted-foreground">{dealer.company}</div>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-foreground">
                  {dealer.code}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information card */}
          <div className="rounded-xl border border-border bg-card px-6 py-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{t("profile.accountInfo")}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReadOnlyField label={t("profile.fullName")} value={dealer.name} />
              <ReadOnlyField label={t("profile.company")} value={dealer.company} />
              <ReadOnlyField label={t("profile.customerCode")} value={dealer.code} />
              <ReadOnlyField label={t("profile.email")} value="berfin@demirydkoto.com.tr" />
              <ReadOnlyField label={t("profile.phone")} value="+90 532 000 0000" />
            </div>
          </div>

          {/* Account Balance card */}
          <div className="rounded-xl border border-border bg-card px-6 py-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{t("profile.balance")}</div>
                <div className="text-xs text-muted-foreground">{t("profile.balanceDesc")}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold tracking-tight text-foreground">
                ₺{fmt(dealer.balance)}
              </div>
              <span className="inline-flex items-center rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                Bakiye
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
