"use client"

import { useState, useMemo } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Banknote,
  Building2,
  BookOpen,
  CalendarDays,
  X,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"

type PaymentStatus = "pending" | "completed" | "cancelled"
type PaymentMethod = "cash" | "creditCard" | "bankTransfer" | "openAccount"

type PaymentItem = {
  stokKodu: string
  urunAdi: string
  quantity: number
  unitPrice: number
}

type Payment = {
  id: string
  paymentNo: string
  date: string
  warehouse: string
  items: PaymentItem[]
  total: number
  method: PaymentMethod
  status: PaymentStatus
}

function mkPayment(
  id: string,
  paymentNo: string,
  date: string,
  warehouse: string,
  items: PaymentItem[],
  method: PaymentMethod,
  status: PaymentStatus,
): Payment {
  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  return { id, paymentNo, date, warehouse, items, total, method, status }
}

const PAYMENTS: Payment[] = [
  mkPayment("1", "OD-2025-00042", "2025-06-15", "ANKARA", [
    { stokKodu: "BOS-0986452041", urunAdi: "YAĞ FİLTRESİ FORD FOCUS 1.6 TDCİ", quantity: 4, unitPrice: 198.75 },
    { stokKodu: "NGK-BKR6E", urunAdi: "ATEŞLEME BUJİSİ RENAULT/DACIA", quantity: 8, unitPrice: 64.9 },
  ], "creditCard", "completed"),
  mkPayment("2", "OD-2025-00038", "2025-06-13", "İSTANBUL ANADOLU", [
    { stokKodu: "VAL-585011", urunAdi: "DEBRİYAJ SETİ VW GOLF 1.9 TDİ", quantity: 1, unitPrice: 3640.0 },
  ], "bankTransfer", "pending"),
  mkPayment("3", "OD-2025-00031", "2025-06-10", "İZMİR", [
    { stokKodu: "MAN-W712/95", urunAdi: "YAĞ FİLTRESİ RENAULT CLIO 1.5 DCİ", quantity: 6, unitPrice: 224.4 },
    { stokKodu: "GAT-5PK1750", urunAdi: "V KAYIŞI FIAT DOBLO 1.3 MJET", quantity: 3, unitPrice: 176.3 },
  ], "openAccount", "completed"),
  mkPayment("4", "OD-2025-00029", "2025-06-09", "BURSA", [
    { stokKodu: "SKF-VKBA3644", urunAdi: "ÖN TEKER RULMANI BMW E46/E90", quantity: 2, unitPrice: 1180.25 },
  ], "cash", "pending"),
  mkPayment("5", "OD-2025-00022", "2025-06-07", "ADANA", [
    { stokKodu: "BRE-09.A407.11", urunAdi: "ÖN FREN DİSKİ TAKIMI AUDI A4/A6", quantity: 1, unitPrice: 2120.0 },
    { stokKodu: "FEB-04781", urunAdi: "ROT BAŞI MERCEDES SPRINTER/VITO", quantity: 2, unitPrice: 540.6 },
  ], "creditCard", "completed"),
  mkPayment("6", "OD-2025-00018", "2025-06-05", "SAMSUN", [
    { stokKodu: "LUK-624321109", urunAdi: "VOLAN SETİ FORD TRANSIT 2.2 TDCİ", quantity: 1, unitPrice: 5890.0 },
  ], "bankTransfer", "cancelled"),
  mkPayment("7", "OD-2025-00013", "2025-06-03", "İSTANBUL AVRUPA", [
    { stokKodu: "RAP-11102", urunAdi: "BYPASS HORTUMU FIAT M131", quantity: 5, unitPrice: 289.0 },
    { stokKodu: "MGA-961016", urunAdi: "BYPASS HORTUMU FIAT M131", quantity: 3, unitPrice: 312.9 },
  ], "openAccount", "completed"),
  mkPayment("8", "OD-2025-00007", "2025-06-01", "ANKARA", [
    { stokKodu: "FOR-YC1Q", urunAdi: "MAZOT POMPA DİŞLİSİ 2.4 120PS TRANSIT V184", quantity: 1, unitPrice: 4280.5 },
  ], "cash", "completed"),
  mkPayment("9", "OD-2025-00099", "2025-05-28", "İZMİR", [
    { stokKodu: "BOS-0986452041", urunAdi: "YAĞ FİLTRESİ FORD FOCUS 1.6 TDCİ", quantity: 10, unitPrice: 198.75 },
    { stokKodu: "NGK-BKR6E", urunAdi: "ATEŞLEME BUJİSİ RENAULT/DACIA", quantity: 20, unitPrice: 64.9 },
  ], "creditCard", "completed"),
  mkPayment("10", "OD-2025-00093", "2025-05-25", "BURSA", [
    { stokKodu: "VAL-585011", urunAdi: "DEBRİYAJ SETİ VW GOLF 1.9 TDİ", quantity: 2, unitPrice: 3640.0 },
  ], "openAccount", "pending"),
]

const PAGE_SIZE = 8

type StatusFilter = PaymentStatus | "all"

const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
}

const STATUS_ICONS: Record<PaymentStatus, React.ElementType> = {
  pending:   Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
}

const METHOD_ICONS: Record<PaymentMethod, React.ElementType> = {
  cash:         Banknote,
  creditCard:   CreditCard,
  bankTransfer: Building2,
  openAccount:  BookOpen,
}

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-")
  return `${d}.${m}.${y}`
}

export function PaymentsTable() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all",       label: t("payments.filterAll") },
    { key: "pending",   label: t("payments.filterPending") },
    { key: "completed", label: t("payments.filterCompleted") },
    { key: "cancelled", label: t("payments.filterCancelled") },
  ]

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return PAYMENTS.filter((p) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      const matchSearch =
        !q ||
        p.paymentNo.toLowerCase().includes(q) ||
        p.warehouse.toLowerCase().includes(q) ||
        p.items.some(
          (i) =>
            i.stokKodu.toLowerCase().includes(q) ||
            i.urunAdi.toLowerCase().includes(q),
        )
      const matchFrom = !dateFrom || p.date >= dateFrom
      const matchTo = !dateTo || p.date <= dateTo
      return matchStatus && matchSearch && matchFrom && matchTo
    })
  }, [search, statusFilter, dateFrom, dateTo])

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

  const statusLabel = (s: PaymentStatus): string => {
    const map: Record<PaymentStatus, string> = {
      pending:   t("payments.statusPending"),
      completed: t("payments.statusCompleted"),
      cancelled: t("payments.statusCancelled"),
    }
    return map[s]
  }

  const methodLabel = (m: PaymentMethod): string => {
    const map: Record<PaymentMethod, string> = {
      cash:         t("payments.methodCash"),
      creditCard:   t("payments.methodCreditCard"),
      bankTransfer: t("payments.methodBankTransfer"),
      openAccount:  t("payments.methodOpenAccount"),
    }
    return map[m]
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none text-foreground">{t("payments.title")}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("payments.totalPayments").replace("{count}", String(filtered.length))}
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
            placeholder={t("payments.searchPlaceholder")}
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
            <label className="text-xs text-muted-foreground">{t("payments.dateFrom")}</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => changeDateFrom(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-muted-foreground">{t("payments.dateTo")}</label>
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
              aria-label={t("payments.clearDates")}
            >
              <X className="h-3 w-3" />
              {t("payments.clearDates")}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">{t("payments.noResults")}</p>
            <p className="text-sm text-muted-foreground">{t("payments.noResultsHint")}</p>
          </div>
        ) : (
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("payments.colPaymentNo")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("payments.colDate")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("payments.colWarehouse")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("payments.colItems")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("payments.colTotal")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("payments.colMethod")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("payments.colStatus")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("payments.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((payment, idx) => {
                const StatusIcon = STATUS_ICONS[payment.status]
                const MethodIcon = METHOD_ICONS[payment.method]
                const itemCount = payment.items.reduce((s, i) => s + i.quantity, 0)
                const firstItem = payment.items[0]
                return (
                  <tr
                    key={payment.id}
                    className={`border-b border-border transition-colors last:border-0 hover:bg-accent/40 ${
                      idx % 2 === 0 ? "" : "bg-muted/20"
                    }`}
                  >
                    {/* Payment No */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-foreground">{payment.paymentNo}</span>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {fmtDate(payment.date)}
                    </td>

                    {/* Warehouse */}
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-foreground">
                        {payment.warehouse}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">
                          {firstItem.urunAdi}
                        </span>
                        {payment.items.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            +{payment.items.length - 1} more · {itemCount} pcs
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">
                      ₺{fmt(payment.total)}
                    </td>

                    {/* Method */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MethodIcon className="h-3.5 w-3.5" />
                        {methodLabel(payment.method)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[payment.status]}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusLabel(payment.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <button
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        aria-label={t("payments.detail")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("payments.detail")}
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
            {t("payments.page")
              .replace("{current}", String(safePage))
              .replace("{total}", String(totalPages))}
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label={t("payments.prev")}
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
              aria-label={t("payments.next")}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
