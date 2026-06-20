"use client"

import { useState } from "react"
import {
  Calculator,
  Banknote,
  CreditCard,
  Building2,
  BookOpen,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Receipt,
  ChevronDown,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useTranslation } from "@/lib/i18n"
import { warehouses, KDV_RATE } from "@/lib/data"

type PaymentMethod = "cash" | "creditCard" | "bankTransfer" | "openAccount"

const PAYMENT_METHODS: { id: PaymentMethod; labelKey: "pos.cash" | "pos.creditCard" | "pos.bankTransfer" | "pos.openAccount"; icon: React.ElementType }[] = [
  { id: "cash", labelKey: "pos.cash", icon: Banknote },
  { id: "creditCard", labelKey: "pos.creditCard", icon: CreditCard },
  { id: "bankTransfer", labelKey: "pos.bankTransfer", icon: Building2 },
  { id: "openAccount", labelKey: "pos.openAccount", icon: BookOpen },
]

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function generateReceiptNo() {
  const d = new Date()
  return `FIS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

export function PosTerminal() {
  const { t } = useTranslation()
  const { items, changeQty, removeItem, total } = useCart()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("creditCard")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(warehouses[1])
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [warehouseOpen, setWarehouseOpen] = useState(false)

  // total is already KDV-inclusive (kdvliMaliyet)
  const totalWithVat = total
  const totalWithoutVat = totalWithVat / (1 + KDV_RATE)
  const vatAmount = totalWithVat - totalWithoutVat

  function handleComplete() {
    if (items.length === 0) return
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setSuccess(generateReceiptNo())
    }, 1400)
  }

  if (success) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 shadow-lg text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t("pos.successTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("pos.successDesc")}</p>
          </div>
          <div className="w-full rounded-xl border border-border bg-accent/40 px-5 py-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("pos.receiptNo")}</span>
              <span className="font-mono font-semibold text-foreground">{success}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("pos.total")}</span>
              <span className="text-base font-bold text-primary">₺{fmt(totalWithVat)}</span>
            </div>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("pos.newOrder")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 gap-5 p-5">
      {/* Left: Order items */}
      <div className="flex flex-1 flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-none">{t("pos.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("pos.subtitle")}</p>
          </div>
        </div>

        {/* Items table */}
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-accent/30 px-4 py-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("pos.orderItems")}
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.25} />
              <p className="text-sm font-medium text-muted-foreground">{t("pos.emptyCart")}</p>
              <p className="text-xs text-muted-foreground/70">{t("pos.emptyCartHint")}</p>
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                      {t("products.productName")}
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-28">
                      {t("pos.quantity")}
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground w-32">
                      {t("pos.unitPrice")}
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground w-32">
                      {t("pos.amount")}
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-b border-border/60 transition-colors hover:bg-accent/30 ${idx % 2 === 0 ? "" : "bg-accent/10"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground leading-tight">{item.urunAdi}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {item.marka} · {item.stokKodu}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => changeQty(item.itemId, Math.max(1, item.adet - 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-foreground tabular-nums">
                            {item.adet}
                          </span>
                          <button
                            onClick={() => changeQty(item.itemId, item.adet + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-sm text-foreground">
                        ₺{fmt(item.fiyat)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-sm font-semibold text-foreground">
                        ₺{fmt(item.fiyat * item.adet)}
                      </td>
                      <td className="pr-3 py-3">
                        <button
                          onClick={() => removeItem(item.itemId)}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("pos.notes")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("pos.notesPlaceholder")}
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right: Payment panel */}
      <div className="flex w-80 shrink-0 flex-col gap-4">
        {/* Warehouse selector */}
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("pos.warehouse")}
          </label>
          <div className="relative">
            <button
              onClick={() => setWarehouseOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span>{selectedWarehouse}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${warehouseOpen ? "rotate-180" : ""}`} />
            </button>
            {warehouseOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-52 overflow-auto rounded-xl border border-border bg-card shadow-lg">
                <div className="p-1">
                  {warehouses.map((w) => (
                    <button
                      key={w}
                      onClick={() => { setSelectedWarehouse(w); setWarehouseOpen(false) }}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                        selectedWarehouse === w
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("pos.paymentMethod")}
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
              {t("pos.summary")}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("pos.subtotal")}</span>
              <span className="font-medium text-foreground tabular-nums">₺{fmt(totalWithoutVat)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("pos.vat")}</span>
              <span className="font-medium text-foreground tabular-nums">₺{fmt(vatAmount)}</span>
            </div>
            <div className="my-1 h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">{t("pos.total")}</span>
              <span className="text-xl font-bold text-primary tabular-nums">₺{fmt(totalWithVat)}</span>
            </div>
          </div>
        </div>

        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={items.length === 0 || processing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              {t("pos.processing")}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
              {t("pos.completePayment")}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
