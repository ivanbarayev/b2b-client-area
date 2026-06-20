"use client"

import { useState, useMemo } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Handshake,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  CalendarDays,
  X,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"

type ReconStatus = "pending" | "agreed" | "disputed"

type Statement = {
  id: string
  statementNo: string
  period: string // e.g. "2025-05" displayed as month
  date: string // statement issue date (ISO)
  opening: number // opening balance (TRY)
  debit: number // borç
  credit: number // alacak
  closing: number // closing balance (TRY)
  status: ReconStatus
}

function mkStatement(
  id: string,
  statementNo: string,
  period: string,
  date: string,
  opening: number,
  debit: number,
  credit: number,
  status: ReconStatus,
): Statement {
  const closing = opening + debit - credit
  return { id, statementNo, period, date, opening, debit, credit, closing, status }
}

const STATEMENTS: Statement[] = [
  mkStatement("1", "MUT-2025-0006", "2025-06", "2025-06-30", 124850.75, 86420.0, 92310.5, "pending"),
  mkStatement("2", "MUT-2025-0005", "2025-05", "2025-05-31", 118200.25, 74900.0, 68249.5, "agreed"),
  mkStatement("3", "MUT-2025-0004", "2025-04", "2025-04-30", 96440.0, 102310.0, 80549.75, "agreed"),
  mkStatement("4", "MUT-2025-0003", "2025-03", "2025-03-31", 88120.5, 64300.0, 55980.5, "disputed"),
  mkStatement("5", "MUT-2025-0002", "2025-02", "2025-02-28", 72540.0, 49880.0, 34299.5, "agreed"),
  mkStatement("6", "MUT-2025-0001", "2025-01", "2025-01-31", 51200.0, 41200.0, 19860.0, "agreed"),
  mkStatement("7", "MUT-2024-0012", "2024-12", "2024-12-31", 44900.0, 38640.0, 32340.0, "agreed"),
  mkStatement("8", "MUT-2024-0011", "2024-11", "2024-11-30", 38120.0, 29800.0, 23020.0, "disputed"),
  mkStatement("9", "MUT-2024-0010", "2024-10", "2024-10-31", 31400.0, 27640.0, 20920.0, "agreed"),
  mkStatement("10", "MUT-2024-0009", "2024-09", "2024-09-30", 24800.0, 22100.0, 15500.0, "agreed"),
]

const PAGE_SIZE = 8

type StatusFilter = ReconStatus | "all"

const STATUS_COLORS: Record<ReconStatus, string> = {
  pending:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  agreed:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  disputed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
}

const STATUS_ICONS: Record<ReconStatus, React.ElementType> = {
  pending:  Clock,
  agreed:   CheckCircle2,
  disputed: AlertTriangle,
}

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-")
  return `${d}.${m}.${y}`
}

export function ReconciliationTable() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all",      label: t("reconciliation.filterAll") },
    { key: "pending",  label: t("reconciliation.filterPending") },
    { key: "agreed",   label: t("reconciliation.filterAgreed") },
    { key: "disputed", label: t("reconciliation.filterDisputed") },
  ]

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return STATEMENTS.filter((s) => {
      const matchStatus = statusFilter === "all" || s.status === statusFilter
      const matchSearch =
        !q ||
        s.statementNo.toLowerCase().includes(q) ||
        s.period.toLowerCase().includes(q)
      const matchFrom = !dateFrom || s.date >= dateFrom
      const matchTo = !dateTo || s.date <= dateTo
      return matchStatus && matchSearch && matchFrom && matchTo
    })
  }, [search, statusFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const totals = useMemo(
    () => ({
      debit: filtered.reduce((s, x) => s + x.debit, 0),
      credit: filtered.reduce((s, x) => s + x.credit, 0),
      closing: filtered.reduce((s, x) => s + x.closing, 0),
    }),
    [filtered],
  )

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

  const statusLabel = (s: ReconStatus): string => {
    const map: Record<ReconStatus, string> = {
      pending:  t("reconciliation.statusPending"),
      agreed:   t("reconciliation.statusAgreed"),
      disputed: t("reconciliation.statusDisputed"),
    }
    return map[s]
  }

  function fmtPeriod(period: string) {
    const [y, m] = period.split("-")
    return `${m}.${y}`
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Handshake className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none text-foreground">{t("reconciliation.title")}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("reconciliation.totalStatements").replace("{count}", String(filtered.length))}
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
            placeholder={t("reconciliation.searchPlaceholder")}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ArrowUpRight className="h-4 w-4 text-red-500" />
            {t("reconciliation.totalDebit")}
          </div>
          <p className="mt-1.5 text-xl font-semibold text-foreground">₺{fmt(totals.debit)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
            {t("reconciliation.totalCredit")}
          </div>
          <p className="mt-1.5 text-xl font-semibold text-foreground">₺{fmt(totals.credit)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Handshake className="h-4 w-4 text-primary" />
            {t("reconciliation.totalBalance")}
          </div>
          <p className="mt-1.5 text-xl font-semibold text-foreground">₺{fmt(totals.closing)}</p>
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
            <label className="text-xs text-muted-foreground">{t("reconciliation.dateFrom")}</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => changeDateFrom(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-muted-foreground">{t("reconciliation.dateTo")}</label>
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
              aria-label={t("reconciliation.clearDates")}
            >
              <X className="h-3 w-3" />
              {t("reconciliation.clearDates")}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <Handshake className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">{t("reconciliation.noResults")}</p>
            <p className="text-sm text-muted-foreground">{t("reconciliation.noResultsHint")}</p>
          </div>
        ) : (
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reconciliation.colStatementNo")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reconciliation.colPeriod")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reconciliation.colDate")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reconciliation.colOpening")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reconciliation.colDebit")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reconciliation.colCredit")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reconciliation.colClosing")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reconciliation.colStatus")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reconciliation.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((stmt, idx) => {
                const StatusIcon = STATUS_ICONS[stmt.status]
                return (
                  <tr
                    key={stmt.id}
                    className={`border-b border-border transition-colors last:border-0 hover:bg-accent/40 ${
                      idx % 2 === 0 ? "" : "bg-muted/20"
                    }`}
                  >
                    {/* Statement No */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-foreground">{stmt.statementNo}</span>
                    </td>

                    {/* Period */}
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-foreground">
                        {fmtPeriod(stmt.period)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {fmtDate(stmt.date)}
                    </td>

                    {/* Opening */}
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-muted-foreground">
                      ₺{fmt(stmt.opening)}
                    </td>

                    {/* Debit */}
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-red-600 dark:text-red-400">
                      ₺{fmt(stmt.debit)}
                    </td>

                    {/* Credit */}
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      ₺{fmt(stmt.credit)}
                    </td>

                    {/* Closing */}
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">
                      ₺{fmt(stmt.closing)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[stmt.status]}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusLabel(stmt.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <button
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        aria-label={t("reconciliation.detail")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("reconciliation.detail")}
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
            {t("reconciliation.page")
              .replace("{current}", String(safePage))
              .replace("{total}", String(totalPages))}
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label={t("reconciliation.prev")}
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
              aria-label={t("reconciliation.next")}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
