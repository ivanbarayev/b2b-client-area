"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Undo2,
  Eye,
  CalendarDays,
  X,
  Loader2,
} from "lucide-react"
import { type OrderStatus, dealer } from "@/lib/data"
import { useTranslation } from "@/lib/i18n"
import { ordersApi, type ApiOrder } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const PAGE_SIZE = 8

type StatusFilter = OrderStatus | "all"

// Row shape the table renders, mapped from ApiOrder.
type OrderRow = {
  id: string
  orderNo: string
  date: string // ISO YYYY-MM-DD (derived from submitted_at)
  warehouse: string
  items: { stokKodu: string; urunAdi: string; quantity: number; unitPrice: number }[]
  total: number
  status: OrderStatus
}

function apiOrderToRow(o: ApiOrder): OrderRow {
  return {
    id: String(o.order_id),
    orderNo: o.order_no,
    date: (o.submitted_at ?? "").slice(0, 10),
    warehouse: o.warehouse,
    items: (o.items ?? []).map((it) => ({
      stokKodu: it.stock_code,
      urunAdi: it.product_name,
      quantity: it.quantity,
      unitPrice: it.net_price,
    })),
    total: o.summary?.total_gross ?? 0,
    status: o.status as OrderStatus,
  }
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  shipped:   "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  returned:  "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
}

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  pending:   Package,
  shipped:   Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  returned:  Undo2,
}

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-")
  return `${d}.${m}.${y}`
}

export function OrdersTable() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<ApiOrder | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null)

  const openDetail = useCallback(async (orderId: number) => {
    if (!token) return
    setDetailOrderId(orderId)
    setDetail(null)
    setDetailError(false)
    setDetailLoading(true)
    try {
      const data = await ordersApi.getOrder(token, dealer.code, orderId)
      setDetail(data)
    } catch {
      setDetailError(true)
    } finally {
      setDetailLoading(false)
    }
  }, [token])

  const closeDetail = useCallback(() => {
    setDetailOrderId(null)
    setDetail(null)
    setDetailError(false)
  }, [])

  const loadOrders = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setLoadError(false)
    try {
      const data = await ordersApi.listOrders(token, dealer.code)
      setOrders((data ?? []).map(apiOrderToRow))
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all",       label: t("orders.filterAll") },
    { key: "pending",   label: t("orders.filterPending") },
    { key: "shipped",   label: t("orders.filterShipped") },
    { key: "delivered", label: t("orders.filterDelivered") },
    { key: "cancelled", label: t("orders.filterCancelled") },
    { key: "returned",  label: t("orders.filterReturned") },
  ]

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return orders.filter((o) => {
      const matchStatus = statusFilter === "all" || o.status === statusFilter
      const matchSearch =
        !q ||
        o.orderNo.toLowerCase().includes(q) ||
        o.warehouse.toLowerCase().includes(q) ||
        o.items.some(
          (i) =>
            i.stokKodu.toLowerCase().includes(q) ||
            i.urunAdi.toLowerCase().includes(q),
        )
      const matchFrom = !dateFrom || o.date >= dateFrom
      const matchTo = !dateTo || o.date <= dateTo
      return matchStatus && matchSearch && matchFrom && matchTo
    })
  }, [orders, search, statusFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function changeFilter(f: StatusFilter) {
    setStatusFilter(f)
    setPage(1)
  }

  function changeSearch(v: string) {
    setSearch(v)
    setPage(1)
  }

  function changeDateFrom(v: string) {
    setDateFrom(v)
    setPage(1)
  }

  function changeDateTo(v: string) {
    setDateTo(v)
    setPage(1)
  }

  function clearDates() {
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  const statusLabel = (s: OrderStatus): string => {
    const map: Record<OrderStatus, string> = {
      pending:   t("orders.statusPending"),
      shipped:   t("orders.statusShipped"),
      delivered: t("orders.statusDelivered"),
      cancelled: t("orders.statusCancelled"),
      returned:  t("orders.statusReturned"),
    }
    return map[s]
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none text-foreground">{t("orders.title")}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("orders.totalOrders").replace("{count}", String(filtered.length))}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder={t("orders.searchPlaceholder")}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Status filters + date range */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => changeFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent text-muted-foreground hover:bg-accent/80 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <label className="text-xs text-muted-foreground">{t("orders.dateFrom")}</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => changeDateFrom(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-muted-foreground">{t("orders.dateTo")}</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => changeDateTo(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={clearDates}
              className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              aria-label={t("orders.clearDates")}
            >
              <X className="h-3 w-3" />
              {t("orders.clearDates")}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t("orders.loading")}</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <XCircle className="h-10 w-10 text-destructive/60" />
            <p className="font-medium text-foreground">{t("orders.loadError")}</p>
            <button
              onClick={loadOrders}
              className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {t("orders.retry")}
            </button>
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <ClipboardCheck className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">{t("orders.noResults")}</p>
            <p className="text-sm text-muted-foreground">{t("orders.noResultsHint")}</p>
          </div>
        ) : (
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("orders.colOrderNo")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("orders.colDate")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("orders.colWarehouse")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("orders.colItems")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("orders.colTotal")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("orders.colStatus")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("orders.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((order, idx) => {
                const StatusIcon = STATUS_ICONS[order.status]
                const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
                const firstItem = order.items[0]
                return (
                  <tr
                    key={order.id}
                    className={`border-b border-border transition-colors last:border-0 hover:bg-accent/40 ${
                      idx % 2 === 0 ? "" : "bg-muted/20"
                    }`}
                  >
                    {/* Order No */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-foreground">{order.orderNo}</span>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {fmtDate(order.date)}
                    </td>

                    {/* Warehouse */}
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-foreground">
                        {order.warehouse}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">
                          {firstItem?.urunAdi ?? "—"}
                        </span>
                        {order.items.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            +{order.items.length - 1} more · {itemCount} pcs
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">
                      ₺{fmt(order.total)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[order.status]}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusLabel(order.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openDetail(Number(order.id))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        aria-label={t("orders.detail")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("orders.detail")}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t("orders.page")
              .replace("{current}", String(safePage))
              .replace("{total}", String(totalPages))}
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label={t("orders.prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === safePage
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label={t("orders.next")}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailOrderId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeDetail}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-none text-foreground">
                    {detail ? detail.order_no : t("orders.detail")}
                  </h2>
                  {detail && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {fmtDate((detail.submitted_at ?? "").slice(0, 10))} · {detail.warehouse}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeDetail}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={t("orders.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("orders.loading")}</p>
                </div>
              ) : detailError ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <XCircle className="h-10 w-10 text-destructive/60" />
                  <p className="font-medium text-foreground">{t("orders.loadError")}</p>
                  <button
                    onClick={() => openDetail(detailOrderId)}
                    className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {t("orders.retry")}
                  </button>
                </div>
              ) : detail ? (
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("orders.colItems")}
                      </th>
                      <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("orders.detailQty")}
                      </th>
                      <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("orders.detailUnitPrice")}
                      </th>
                      <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("orders.colTotal")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.items ?? []).map((it) => (
                      <tr key={it.item_id} className="border-b border-border last:border-0">
                        <td className="px-2 py-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground">{it.product_name}</span>
                            <span className="font-mono text-xs text-muted-foreground">{it.stock_code}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right text-foreground">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right text-muted-foreground">
                          ₺{fmt(it.net_price)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right font-semibold text-foreground">
                          ₺{fmt(it.gross_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>

            {detail && !detailLoading && !detailError && (
              <div className="flex items-center justify-end gap-6 border-t border-border bg-muted/30 px-5 py-3 text-sm">
                <span className="text-muted-foreground">{t("orders.colTotal")}</span>
                <span className="text-base font-semibold text-foreground">
                  ₺{fmt(detail.summary?.total_gross ?? 0)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
