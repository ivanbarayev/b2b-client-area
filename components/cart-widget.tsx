"use client"

import { ShoppingBasket, X, Plus, Minus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { useCart } from "@/lib/cart-context"
import { displayStockCode } from "@/lib/data"

const currency = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺"

export function CartWidget() {
  const { t } = useTranslation()
  const router = useRouter()
  const { items, count, total, open, setOpen, changeQty, removeItem } = useCart()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat-style panel */}
      {open && (
        <div className="flex h-[30rem] w-[24rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
                <ShoppingBasket className="h-4.5 w-4.5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{t("cart.title")}</p>
                <p className="text-xs text-primary-foreground/70">{t("cart.itemsCount", { count })}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
              aria-label={t("cart.close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <ShoppingBasket className="h-10 w-10 opacity-40" />
                <p className="text-sm">{t("cart.empty")}</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((it) => (
                  <li
                    key={it.id}
                    className="rounded-xl border border-border bg-muted/50 p-3 transition-colors hover:border-primary/40 hover:bg-muted/80"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{it.urunAdi}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{it.marka}</span>
                          {" · "}
                          {displayStockCode(it.stokKodu)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(it.itemId)}
                        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={t("cart.removeItem")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          onClick={() => changeQty(it.itemId, Math.max(1, it.adet - 1))}
                          className="flex h-7 w-7 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          aria-label={t("cart.decrease")}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                          {it.adet}
                        </span>
                        <button
                          onClick={() => changeQty(it.itemId, it.adet + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          aria-label={t("cart.increase")}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {currency(it.adet * it.fiyat)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer / checkout */}
          <div className="border-t border-border bg-card px-4 py-3">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("cart.total")}</span>
              <span className="text-base font-bold tabular-nums text-foreground">{currency(total)}</span>
            </div>
            <button
              disabled={items.length === 0}
              onClick={() => { setOpen(false); router.push("/cart") }}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("cart.completeOrder")}
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-black/25 transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? t("cart.close") : t("cart.open")}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <ShoppingBasket className="h-6 w-6" />}
        {!open && count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-card bg-destructive px-1 text-xs font-bold tabular-nums text-destructive-foreground">
            {count}
          </span>
        )}
      </button>
    </div>
  )
}
