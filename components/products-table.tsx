"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, X, Settings2, Star, Package, ShoppingCart, Loader2, ImageIcon } from "lucide-react"
import { totalPoints, KDV_RATE, type Product } from "@/lib/data"
import { searchApi, type ProductResult } from "@/lib/api"
import { useTranslation, type TranslationKey, type TranslationParams } from "@/lib/i18n"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

type Filter = "all" | "inStock"

// Adapt a live ProductResult from the search-engine into the static Product shape
// the table + cart already consume. The supplier feed has a single stock_qty
// (no per-warehouse breakdown), so the warehouse matrix is hidden for live data.
// LiveProduct carries the authoritative supplier pricing alongside the Product
// fields, so the table renders real net/list prices instead of the synthetic
// discount cycle in computePrices().
type LiveProduct = Product & {
  externalId: string
  imageUrl: string
  _live: { netExclVat: number; listExclVat: number; currency: string; source: string }
}

function resultToProduct(r: ProductResult): LiveProduct {
  return {
    id: `${r.source}-${r.external_id}`,
    stokKodu: r.external_id,
    externalId: r.external_id,
    imageUrl: r.image_url,
    refNo: r.brand_code,
    marka: r.brand,
    urunAdi: r.name,
    fiyat: r.list_price,
    puan: 0,
    birim: r.unit || "ad.",
    paraBirimi: (r.currency as Product["paraBirimi"]) || "TRY",
    stock: { __total: r.stock_qty },
    _live: {
      netExclVat: r.net_price,
      listExclVat: r.list_price,
      currency: r.currency || "TRY",
      source: r.source,
    },
  } as LiveProduct
}

const currencySymbols: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" }

// discountLabel derives an effective discount % from list vs net (both excl VAT).
function discountLabel(listExclVat: number, netExclVat: number): string {
  if (listExclVat <= 0 || netExclVat <= 0 || netExclVat >= listExclVat) return "—"
  const pct = Math.round((1 - netExclVat / listExclVat) * 100)
  return `%${pct}`
}

const PRICE_COLS = [
  { id: "br", labelKey: "products.br" as const },
  { id: "liste", labelKey: "products.listPrice" as const },
  { id: "kdvliListe", labelKey: "products.vatIncludedList" as const },
  { id: "kdvsizMaliyet", labelKey: "products.vatExcludedCost" as const },
  { id: "kdvliMaliyet", labelKey: "products.vatIncludedCost" as const },
  { id: "iskonto", labelKey: "products.discount" as const },
] as const

function PriceCells({ product, isOut, visible, t }: { product: LiveProduct; isOut: boolean; visible: Set<string>; t: (key: TranslationKey) => string }) {
  const live = product._live
  const pr = {
    birim: product.birim ?? "ad.",
    listeFiyati: live.listExclVat,
    listeFiyatiSembol: currencySymbols[live.currency] ?? live.currency,
    kdvliListe: live.listExclVat * (1 + KDV_RATE),
    kdvsizMaliyet: live.netExclVat,
    kdvliMaliyet: live.netExclVat * (1 + KDV_RATE),
    iskonto: discountLabel(live.listExclVat, live.netExclVat),
  }
  const danger = isOut ? "text-destructive" : ""
  const sym = pr.listeFiyatiSembol
  const fmtCur = (n: number) =>
    `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`
  return (
    <>
      {visible.has("br") ? (
        <td className="border-l border-border/60 px-3 py-3 text-center align-middle">
          <span className={`text-xs font-medium ${isOut ? "text-destructive" : "text-muted-foreground"}`}>
            {pr.birim}
          </span>
        </td>
      ) : null}
      {visible.has("liste") ? (
        <td className="border-l border-border/60 px-3 py-3 text-right align-middle whitespace-nowrap">
          <span className={`text-sm font-semibold tabular-nums ${danger || "text-foreground"}`}>
            {pr.listeFiyati.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
            {pr.listeFiyatiSembol}
          </span>
        </td>
      ) : null}
      {visible.has("kdvliListe") ? (
        <td className="border-l border-border/60 px-3 py-3 text-right align-middle whitespace-nowrap">
          <span className={`text-sm font-semibold tabular-nums ${danger || "text-foreground"}`}>
            {fmtCur(pr.kdvliListe)}
          </span>
        </td>
      ) : null}
      {visible.has("kdvsizMaliyet") ? (
        <td className="border-l border-border/60 px-3 py-3 text-right align-middle whitespace-nowrap">
          <span className={`text-sm font-semibold tabular-nums ${danger || "text-foreground"}`}>
            {fmtCur(pr.kdvsizMaliyet)}
          </span>
        </td>
      ) : null}
      {visible.has("kdvliMaliyet") ? (
        <td className="border-l border-border/60 px-3 py-3 text-right align-middle whitespace-nowrap">
          <span className={`text-sm font-bold tabular-nums ${isOut ? "text-destructive" : "text-primary"}`}>
            {fmtCur(pr.kdvliMaliyet)}
          </span>
        </td>
      ) : null}
      {visible.has("iskonto") ? (
        <td className="border-l border-border/60 px-3 py-3 text-center align-middle whitespace-nowrap">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${
              isOut ? "text-destructive" : "bg-accent text-accent-foreground"
            }`}
          >
            {pr.iskonto}
          </span>
        </td>
      ) : null}
    </>
  )
}

function StockCell({ qty }: { qty: number }) {
  const inStock = qty > 0
  return (
    <td className="border-l border-border/60 px-2 py-3 text-center align-middle">
      <span className="group relative inline-flex flex-col items-center">
        {inStock ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/12 text-success ring-1 ring-success/25">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <X className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
        {inStock ? (
          <span className="mt-1 text-[10px] font-semibold tabular-nums text-success">{qty}</span>
        ) : (
          <span className="mt-1 text-[10px] font-medium text-muted-foreground/50">—</span>
        )}
      </span>
    </td>
  )
}

function ProductRow({ product, index, visible, t, onAdd, onPreview }: { product: LiveProduct; index: number; visible: Set<string>; t: (key: TranslationKey, params?: TranslationParams) => string; onAdd: (p: Product) => void; onPreview: (p: LiveProduct) => void }) {
  const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0)
  const isOut = totalStock === 0
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    if (isOut || adding) return
    setAdding(true)
    try {
      // Prefix stock code with supplier source, e.g. altay_{external_id}
      await onAdd({ ...product, stokKodu: `${product._live.source}_${product.externalId}` })
    } finally {
      setAdding(false)
    }
  }

  return (
    <tr
      className={`group transition-colors hover:bg-primary/[0.07] ${
        product.campaign ? "bg-warning/[0.06]" : index % 2 === 1 ? "bg-muted/40" : "bg-card"
      }`}
    >
      {/* Image preview */}
      <td className="sticky left-0 z-10 w-12 border-r border-border bg-inherit px-2 py-3 text-center align-middle">
        <button
          onClick={() => onPreview(product)}
          disabled={!product.imageUrl}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t("products.viewImage")}
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </td>
      {/* Ref No */}
      <td className="min-w-[90px] px-3 py-3 align-top">
        <span className={`text-sm ${isOut ? "text-destructive" : "text-muted-foreground"}`}>{product.refNo}</span>
      </td>
      {/* Marka */}
      <td className="min-w-[120px] px-4 py-3 align-top">
        <span className={`text-sm font-medium ${isOut ? "text-destructive" : "text-primary"}`}>{product.marka}</span>
      </td>
      {/* Ürün Adı */}
      <td className="min-w-[280px] max-w-[320px] px-4 py-3 align-top">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm leading-snug ${isOut ? "text-destructive" : "text-foreground"}`}>
            {product.urunAdi}
          </span>
          <span className="inline-flex items-center rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
            {product._live.source}
          </span>
        </div>
      </td>
      {/* Stock (single supplier quantity) */}
      {visible.has("stockQty") ? <StockCell qty={totalStock} /> : null}
      {/* Pricing columns */}
      <PriceCells product={product} isOut={isOut} visible={visible} t={t} />
      {/* Action */}
      <td className="sticky right-0 z-10 border-l border-border bg-inherit px-3 py-3 text-center">
        <button
          onClick={handleAdd}
          disabled={isOut || adding}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          aria-label={t("products.addToCart")}
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </button>
      </td>
    </tr>
  )
}

const STOCK_COL = { id: "stockQty", labelKey: "products.stockQty" as const }

const ALL_TOGGLE_COLS = [
  STOCK_COL,
  ...PRICE_COLS.map((c) => ({ id: c.id, labelKey: c.labelKey })),
]

export function ProductsTable({ query }: { query: string }) {
  const { t } = useTranslation()
  const { addProduct } = useCart()
  const { token } = useAuth()
  const [filter, setFilter] = useState<Filter>("all")
  const [colsOpen, setColsOpen] = useState(false)
  const [visible, setVisible] = useState<Set<string>>(() => new Set(ALL_TOGGLE_COLS.map((c) => c.id)))
  const colsRef = useRef<HTMLDivElement>(null)

  // Live results merged across altay + martas suppliers.
  const [results, setResults] = useState<LiveProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<LiveProduct | null>(null)

  useEffect(() => {
    const q = query.trim()
    if (!q || !token) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }
    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)
      searchApi
        .search(q, token, ctrl.signal)
        .then((data) => setResults(data.map(resultToProduct)))
        .catch((err) => {
          if (err?.name === "AbortError") return
          setError(err instanceof Error ? err.message : "search failed")
          setResults([])
        })
        .finally(() => setLoading(false))
    }, 350)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [query, token])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) setColsOpen(false)
    }
    if (colsOpen) {
      document.addEventListener("mousedown", handleClick)
      return () => document.removeEventListener("mousedown", handleClick)
    }
  }, [colsOpen])

  const toggleCol = (id: string) =>
    setVisible((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const setAll = (on: boolean) => setVisible(on ? new Set(ALL_TOGGLE_COLS.map((c) => c.id)) : new Set())

  const showStockCol = visible.has("stockQty")
  const visiblePriceCols = PRICE_COLS.filter((c) => visible.has(c.id))
  const totalColSpan = 4 + (showStockCol ? 1 : 0) + visiblePriceCols.length + 1

  const filtered = useMemo(() => {
    if (filter === "inStock") {
      return results.filter((p) => Object.values(p.stock).some((q) => q > 0))
    }
    return results
  }, [results, filter])

  const inStockCount = results.filter((p) => Object.values(p.stock).some((q) => q > 0)).length

  return (
    <section>
      <div className="overflow-hidden border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-[3px]">
          <div className="inline-flex rounded-xl bg-muted p-1">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("products.allProducts")}
              <span className="ml-1.5 text-xs text-muted-foreground">({results.length})</span>
            </button>
            <button
              onClick={() => setFilter("inStock")}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === "inStock"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("products.inStock")}
              <span className="ml-1.5 text-xs text-muted-foreground">({inStockCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-gradient-to-b from-card to-muted/40 px-3.5 py-1.5">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-xs font-medium text-muted-foreground">{t("products.totalPoints")}</span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {totalPoints.toLocaleString("tr-TR")}
              </span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="relative" ref={colsRef}>
              <button
                onClick={() => setColsOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={colsOpen}
                aria-label={t("products.columnSettings")}
                className={`flex h-[34px] w-[34px] items-center justify-center rounded-xl border border-border text-foreground transition-colors ${
                  colsOpen ? "bg-accent" : "bg-background hover:bg-accent"
                }`}
              >
                <Settings2 className="h-4 w-4" />
              </button>

              {colsOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-40 w-64 origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-border bg-accent/40 px-4 py-2.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground">{t("products.columns")}</span>
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <button onClick={() => setAll(true)} className="text-primary hover:underline">
                        {t("products.all")}
                      </button>
                      <span className="text-border">|</span>
                      <button onClick={() => setAll(false)} className="text-muted-foreground hover:underline">
                        {t("products.none")}
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1.5">
                    {ALL_TOGGLE_COLS.map((c) => {
                      const checked = visible.has(c.id)
                      return (
                        <button
                          key={c.id}
                          role="menuitemcheckbox"
                          aria-checked={checked}
                          onClick={() => toggleCol(c.id)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              checked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background"
                            }`}
                          >
                            {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                          </span>
                          {c.labelKey.startsWith("wh:") ? c.labelKey.slice(3) : t(c.labelKey as any)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="sticky left-0 z-20 w-12 border-r border-primary-foreground/10 bg-primary px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wider">
                  <ImageIcon className="mx-auto h-4 w-4" />
                </th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">{t("products.refNo")}</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">{t("products.brand")}</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">{t("products.productName")}</th>
                {showStockCol ? (
                  <th className="border-l border-primary-foreground/10 px-2 py-3 text-center text-[10px] font-bold uppercase leading-tight tracking-wide">
                    {t("products.stockQty")}
                  </th>
                ) : null}
                {visiblePriceCols.map((c) => (
                  <th
                    key={c.id}
                    className={`border-l border-primary-foreground/10 px-3 py-3 text-[11px] font-bold uppercase leading-tight tracking-wide ${
                      c.id === "br" || c.id === "iskonto" ? "text-center tracking-wider" : "text-right"
                    }`}
                  >
                    {t(c.labelKey)}
                  </th>
                ))}
                <th className="sticky right-0 z-20 border-l border-primary-foreground/10 bg-primary px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider">
                  {t("products.action")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={totalColSpan} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin opacity-60" />
                      <p className="text-sm font-medium">{t("products.searching")}</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={totalColSpan} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-destructive">
                      <X className="h-10 w-10 opacity-50" />
                      <p className="text-sm font-medium">{t("products.searchError")}</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((p, i) => <ProductRow key={p.id} product={p} index={i} visible={visible} t={t} onAdd={addProduct} onPreview={setPreview} />)
              ) : (
                <tr>
                  <td colSpan={totalColSpan} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="h-10 w-10 opacity-40" />
                      <p className="text-sm font-medium">{query.trim() ? t("products.noResults") : t("products.searchPrompt")}</p>
                      <p className="text-xs">{query.trim() ? t("products.noResultsHint") : ""}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            {t("products.productsListed", { count: filtered.length })}
          </span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-success/15 text-success ring-1 ring-success/25">
                <Check className="h-2 w-2" strokeWidth={4} />
              </span>
              {t("products.inStockLabel")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20">
                <X className="h-2 w-2" strokeWidth={4} />
              </span>
              {t("products.outOfStockLabel")}
            </span>
          </div>
        </div>
      </div>

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{preview.externalId}</p>
                <p className="truncate text-xs text-muted-foreground">{preview.urunAdi}</p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-muted/30 p-4">
              {preview.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.imageUrl}
                  alt={preview.urunAdi}
                  className="max-h-[65vh] w-auto rounded-lg object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 opacity-40" />
                  <p className="text-sm">{t("products.noImage")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
