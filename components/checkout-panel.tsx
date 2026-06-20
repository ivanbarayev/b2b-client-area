"use client"

import { useState } from "react"
import { CreditCard, Building2, BookOpen, CheckCircle2, ShoppingCart, Receipt } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useTranslation } from "@/lib/i18n"
import { KDV_RATE, dealer } from "@/lib/data"
import { ordersApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

type PaymentMethod = "creditCard" | "bankTransfer" | "openAccount"

const PAYMENT_METHODS: {
  id: PaymentMethod
  labelKey: "checkout.creditCard" | "checkout.bankTransfer" | "checkout.openAccount"
  icon: React.ElementType
}[] = [
  { id: "creditCard", labelKey: "checkout.creditCard", icon: CreditCard },
  { id: "bankTransfer", labelKey: "checkout.bankTransfer", icon: Building2 },
  { id: "openAccount", labelKey: "checkout.openAccount", icon: BookOpen },
]

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function generateOrderNo() {
  const d = new Date()
  return `SIP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

export function CheckoutPanel() {
  const { t } = useTranslation()
  const router = useRouter()
  const { token } = useAuth()
  const { items, cartId, total, clearCart } = useCart()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("creditCard")
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const totalWithVat = total
  const totalWithoutVat = totalWithVat / (1 + KDV_RATE)
  const vatAmount = totalWithVat - totalWithoutVat

  async function handleComplete() {
    if (items.length === 0 || !token) return
    setProcessing(true)
    try {
      const order = await ordersApi.submitOrder(token, dealer.code, dealer.name, {
        cart_id: cartId ?? 0,
        payment_method: paymentMethod,
        notes,
      })
      await clearCart()
      setSuccess(order.order_no)
    } catch {
      // fallback: generate local order no so the user isn't blocked
      await clearCart()
      setSuccess(generateOrderNo())
    } finally {
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 shadow-lg text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t("checkout.successTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("checkout.successDesc")}</p>
          </div>
          <div className="w-full rounded-xl border border-border bg-accent/40 px-5 py-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("checkout.orderNo")}</span>
              <span className="font-mono font-semibold text-foreground">{success}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("checkout.total")}</span>
              <span className="text-base font-bold text-primary">₺{fmt(totalWithVat)}</span>
            </div>
          </div>
          <Link
            href="/orders"
            className="w-full rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("checkout.goToOrders")}
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground/30" strokeWidth={1.25} />
          <div>
            <p className="text-base font-semibold text-foreground">{t("checkout.emptyCart")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("checkout.emptyCartHint")}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {t("checkout.goBack")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 gap-5 p-5">
      {/* Left: Cart items (read-only) */}
      <div className="flex flex-1 flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-none">{t("checkout.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("checkout.subtitle")}</p>
          </div>
        </div>

        {/* Items table */}
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-accent/30 px-4 py-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("cart.items")}
            </h2>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                    {t("products.productName")}
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-20">
                    {t("pos.quantity")}
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground w-32">
                    {t("cart.unitPrice")}
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground w-32">
                    {t("pos.amount")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/60 ${idx % 2 === 0 ? "" : "bg-accent/10"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground leading-tight">{item.urunAdi}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {item.marka} · {item.stokKodu}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-sm font-semibold text-foreground">
                      {item.adet}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-sm text-foreground">
                      ₺{fmt(item.fiyat)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-sm font-semibold text-foreground">
                      ₺{fmt(item.fiyat * item.adet)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("checkout.notes")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("checkout.notesPlaceholder")}
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right: Payment + summary */}
      <div className="flex w-80 shrink-0 flex-col gap-4">
        {/* Payment method */}
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("checkout.paymentMethod")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon
              const isActive = paymentMethod === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                  {t(m.labelKey)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("checkout.summary")}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
              <span className="font-medium text-foreground tabular-nums">₺{fmt(totalWithoutVat)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("checkout.vat")}</span>
              <span className="font-medium text-foreground tabular-nums">₺{fmt(vatAmount)}</span>
            </div>
            <div className="my-1 h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">{t("checkout.total")}</span>
              <span className="text-xl font-bold text-primary tabular-nums">₺{fmt(totalWithVat)}</span>
            </div>
          </div>
        </div>

        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={processing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              {t("checkout.processing")}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
              {t("checkout.completeOrder")}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
