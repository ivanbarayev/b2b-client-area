"use client"

import { Wallet, TrendingUp } from "lucide-react"
import { dealer, fxRates } from "@/lib/data"
import { useTranslation } from "@/lib/i18n"

export function FooterBar() {
  const { t } = useTranslation()
  return (
    <footer className="sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success ring-1 ring-success/20">
            <Wallet className="h-3.5 w-3.5" />
            {t("footer.balance")}:{" "}
            <span className="tabular-nums">
              {dealer.balance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1">
            <span className="text-xs font-medium text-muted-foreground">€</span>
            <span className="text-xs font-bold tabular-nums text-foreground">{fxRates.eur.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1">
            <span className="text-xs font-medium text-muted-foreground">$</span>
            <span className="text-xs font-bold tabular-nums text-foreground">{fxRates.usd.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
