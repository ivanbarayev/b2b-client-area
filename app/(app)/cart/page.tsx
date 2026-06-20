"use client"

import {
  ShoppingBasket, ArrowLeft, Banknote, CreditCard, Building2, BookOpen, X,
  RefreshCw, Trash2, StickyNote, Package,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useTranslation, type TranslationKey } from "@/lib/i18n"
import { useState, useRef, useEffect, useCallback } from "react"
import { products, displayStockCode, dealer } from "@/lib/data"
import { ordersApi } from "@/lib/api"

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺"

type PaymentMethod = "cash" | "creditCard" | "bankTransfer" | "openAccount"

const PAYMENT_METHODS: {
  id: PaymentMethod
  labelKey: "pos.cash" | "pos.creditCard" | "pos.bankTransfer" | "pos.openAccount"
  icon: React.ElementType
}[] = [
  { id: "cash",         labelKey: "pos.cash",         icon: Banknote },
  { id: "creditCard",   labelKey: "pos.creditCard",   icon: CreditCard },
  { id: "bankTransfer", labelKey: "pos.bankTransfer", icon: Building2 },
  { id: "openAccount",  labelKey: "pos.openAccount",  icon: BookOpen },
]

type ContextMenu = { x: number; y: number; itemId: number } | null

export default function CartPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { token } = useAuth()
  const { items, cartId, count, total, error, clearError, changeQty, removeItem, clearCart, updateNote } = useCart()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [paymentModal, setPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("creditCard")
  const [processing, setProcessing] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null)
  const [noteModal, setNoteModal] = useState<{ itemId: number; value: string } | null>(null)
  const [detailModal, setDetailModal] = useState<string | null>(null) // product id
  const contextRef = useRef<HTMLDivElement>(null)

  // close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    function handler(e: MouseEvent) {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [contextMenu])

  // close context menu on scroll
  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(null)
    window.addEventListener("scroll", handler, true)
    return () => window.removeEventListener("scroll", handler, true)
  }, [contextMenu])

  const allSelected = items.length > 0 && selected.size === items.length

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(items.map((it) => it.id)))
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleRightClick(e: React.MouseEvent, itemId: number) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, itemId })
  }

  function ctxDeleteItem(id: number) {
    removeItem(id)
    setSelected((prev) => { const n = new Set(prev); n.delete(String(id)); return n })
    setContextMenu(null)
  }

  function ctxDeleteAll() {
    clearCart()
    setSelected(new Set())
    setContextMenu(null)
  }

  function ctxRefresh() {
    setContextMenu(null)
    // in real app would refetch prices; here just close
  }

  function ctxOpenNote(id: number) {
    const item = items.find((it) => it.itemId === id)
    setNoteModal({ itemId: id, value: item?.satırNotu ?? "" })
    setContextMenu(null)
  }

  function ctxOpenDetail(itemId: number) {
    const cartItem = items.find((it) => it.itemId === itemId)
    if (!cartItem) return
    // find product by stokKodu match
    const prod = products.find((p) => p.stokKodu === cartItem.stokKodu) ?? null
    setDetailModal(prod?.id ?? cartItem.id)
    setContextMenu(null)
  }

  function saveNote() {
    if (!noteModal) return
    updateNote(noteModal.itemId, noteModal.value)
    setNoteModal(null)
  }

  const detailProduct = detailModal ? products.find((p) => p.id === detailModal) : null

  const subtotalKdvsiz = items.reduce((s, it) => s + it.adet * it.fiyat, 0)
  const totalKdv = items.reduce((s, it) => s + it.adet * it.fiyat * it.kdvOran, 0)
  const grandTotal = subtotalKdvsiz + totalKdv

  async function handleConfirmOrder() {
    if (items.length === 0 || !token || processing) return
    setProcessing(true)
    setOrderError(null)
    try {
      await ordersApi.submitOrder(token, dealer.code, dealer.name, {
        cart_id: cartId ?? 0,
        payment_method: paymentMethod,
        notes: "",
      })
      await clearCart()
      setPaymentModal(false)
      router.push("/orders")
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "ORDER_SUBMIT_FAILED")
    } finally {
      setProcessing(false)
    }
  }

  // Map error codes thrown by the cart layer to localized text. Anything not in
  // the map is a backend-provided message (already localized) — render it as-is.
  const ERROR_KEYS: Record<string, TranslationKey> = {
    NETWORK_ERROR: "cart.errorNetwork",
    CART_ADD_FAILED: "cart.errorAddFailed",
    CART_QTY_FAILED: "cart.errorQtyFailed",
    CART_REMOVE_FAILED: "cart.errorRemoveFailed",
    CART_CLEAR_FAILED: "cart.errorClearFailed",
  }
  const activeError = error ?? orderError
  const errorMessage = activeError ? (ERROR_KEYS[activeError] ? t(ERROR_KEYS[activeError]) : activeError) : null

  return (
    <div className="flex flex-col h-full px-4 py-4 gap-4">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={t("cart.goBack")}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("cart.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("cart.itemsCount", { count })}</p>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <span>{errorMessage}</span>
          <button
            onClick={() => { clearError(); setOrderError(null) }}
            aria-label={t("cart.dismissError")}
            className="shrink-0 rounded-md p-1 transition-colors hover:bg-destructive/15"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBasket className="h-8 w-8 text-muted-foreground opacity-60" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{t("cart.empty")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("cart.emptyHint")}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("cart.continueShopping")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Table */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    {/* Toplu Seçim */}
                    <th className="w-10 px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                        aria-label={t("cart.selectAll")}
                      />
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 text-left font-semibold text-foreground">{t("cart.col.addedBy")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-left font-semibold text-foreground">{t("cart.col.stockCode")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-left font-semibold text-foreground">{t("cart.col.productName")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-left font-semibold text-foreground">{t("cart.col.brand")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-foreground">{t("cart.col.unit")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-foreground">{t("cart.col.qty")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-foreground">{t("cart.col.vat")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right font-semibold text-foreground">{t("cart.col.listPrice")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-foreground">{t("cart.col.discount")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right font-semibold text-foreground">{t("cart.col.amount")}</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right font-semibold text-foreground">{t("cart.col.amountVat")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const tutar = it.adet * it.fiyat
                    const kdvliTutar = tutar * (1 + it.kdvOran)
                    const isSelected = selected.has(it.id)
                    return (
                      <tr
                        key={it.id}
                        onContextMenu={(e) => handleRightClick(e, it.itemId)}
                        className={`border-b border-border transition-colors last:border-0 select-none cursor-context-menu ${
                          isSelected ? "bg-primary/5" : "hover:bg-muted/40"
                        }`}
                      >
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(it.id)}
                            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{it.ekleyenKisi}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-foreground">{displayStockCode(it.stokKodu)}</td>
                        <td className="max-w-[220px] px-3 py-3">
                          <p className="truncate font-medium text-foreground">{it.urunAdi}</p>
                          {it.satırNotu && (
                            <p className="truncate text-xs text-amber-600 dark:text-amber-400">📝 {it.satırNotu}</p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{it.marka}</td>
                        <td className="px-3 py-3 text-center text-muted-foreground">{it.birim}</td>
                        {/* Qty with +/- */}
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => changeQty(it.itemId, Math.max(1, it.adet - 1))}
                              disabled={it.adet <= 1}
                              className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
                            >
                              –
                            </button>
                            <span className="min-w-[2.5rem] text-center tabular-nums font-semibold">{it.adet}</span>
                            <button
                              onClick={() => changeQty(it.itemId, it.adet + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">%{Math.round(it.kdvOran * 100)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-muted-foreground">{fmt(it.listeFiyati)}</td>
                        <td className="px-3 py-3 text-center font-mono text-xs text-emerald-600 dark:text-emerald-400">{it.iskonto}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums font-semibold text-foreground">{fmt(tutar)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums font-bold text-foreground">{fmt(kdvliTutar)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="text-sm font-semibold text-foreground">{t("cart.summary")}</h2>
              </div>
              <div className="space-y-2.5 px-5 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  <span className="tabular-nums">{fmt(subtotalKdvsiz)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.vat")}</span>
                  <span className="tabular-nums">{fmt(totalKdv)}</span>
                </div>
                <div className="border-t border-border pt-2.5 flex justify-between">
                  <span className="font-semibold">{t("cart.total")}</span>
                  <span className="font-bold tabular-nums text-base">{fmt(grandTotal)}</span>
                </div>
              </div>
              <div className="border-t border-border px-5 py-4 flex flex-col gap-2">
                <button
                  onClick={() => setPaymentModal(true)}
                  className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("cart.completeOrder")}
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {t("cart.continueShopping")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          ref={contextRef}
          style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
          className="min-w-[180px] overflow-hidden rounded-xl border border-border bg-popover shadow-xl shadow-black/20 py-1 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={() => ctxDeleteItem(contextMenu.itemId)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {t("cart.ctx.deleteItem")}
          </button>
          <button
            onClick={ctxDeleteAll}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {t("cart.ctx.deleteAll")}
          </button>
          <div className="my-1 border-t border-border" />
          <button
            onClick={ctxRefresh}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {t("cart.ctx.refresh")}
          </button>
          <button
            onClick={() => ctxOpenNote(contextMenu.itemId)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <StickyNote className="h-4 w-4" />
            {t("cart.ctx.addNote")}
          </button>
          <button
            onClick={() => ctxOpenDetail(contextMenu.itemId)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Package className="h-4 w-4" />
            {t("cart.ctx.productDetail")}
          </button>
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setNoteModal(null) }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">{t("cart.noteModal.title")}</h2>
              <button
                onClick={() => setNoteModal(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              {items.find((it) => it.itemId === noteModal.itemId)?.urunAdi}
            </p>
            <textarea
              value={noteModal.value}
              onChange={(e) => setNoteModal({ ...noteModal, value: e.target.value })}
              rows={4}
              placeholder={t("cart.noteModal.placeholder")}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={saveNote}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {t("cart.noteModal.save")}
              </button>
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {t("cart.noteModal.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product detail modal */}
      {detailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setDetailModal(null) }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">{t("cart.detailModal.title")}</h2>
              <button
                onClick={() => setDetailModal(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {detailProduct ? (
              <div className="space-y-3 text-sm">
                <DetailRow label={t("cart.col.stockCode")} value={displayStockCode(detailProduct.stokKodu)} />
                <DetailRow label={t("cart.col.productName")} value={detailProduct.urunAdi} />
                <DetailRow label={t("cart.col.brand")} value={detailProduct.marka} />
                <DetailRow label="Ref. No" value={detailProduct.refNo} />
                <DetailRow label={t("cart.col.unit")} value={detailProduct.birim ?? "ad."} />
                <DetailRow label={t("cart.col.listPrice")} value={`${detailProduct.fiyat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} (${detailProduct.paraBirimi ?? "TRY"})`} />
                {detailProduct.campaign && (
                  <span className="inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Kampanyalı
                  </span>
                )}
                {detailProduct.oem && (
                  <span className="inline-block rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    OEM
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("cart.detailModal.notFound")}</p>
            )}
            <button
              onClick={() => setDetailModal(null)}
              className="mt-5 w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              {t("cart.detailModal.close")}
            </button>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {paymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setPaymentModal(false) }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">{t("cart.paymentModalTitle")}</h2>
              <button
                onClick={() => setPaymentModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon
                const isActive = paymentMethod === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-semibold transition-colors ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                    {t(m.labelKey)}
                  </button>
                )
              })}
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handleConfirmOrder}
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                )}
                {t("cart.paymentModalConfirm")}
              </button>
              <button
                onClick={() => setPaymentModal(false)}
                disabled={processing}
                className="w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                {t("cart.paymentModalCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
