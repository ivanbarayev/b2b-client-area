"use client"

import { Factory, Car, Wrench, Search, X, SlidersHorizontal } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

type SearchPanelProps = {
  query: string
  onQueryChange: (value: string) => void
  onClear: () => void
}

const fields = [
  { id: "uretici", placeholderKey: "search.manufacturer" as const, icon: Factory },
  { id: "arac", placeholderKey: "search.vehicle" as const, icon: Car },
  { id: "parca", placeholderKey: "search.part" as const, icon: Wrench },
]

export function SearchPanel({ query, onQueryChange, onClear }: SearchPanelProps) {
  const { t } = useTranslation()
  return (
    <section className="border-b border-border bg-card">
      {/* Search controls */}
      <div className="flex flex-wrap items-stretch gap-3 px-5 py-[3px]">
        {fields.map((field) => {
          const Icon = field.icon
          return (
            <div key={field.id} className="relative min-w-[200px] flex-1">
              <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t(field.placeholderKey)}
                className="h-[34px] w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          )
        })}

        {/* Active query field */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("search.keyword")}
            className="h-[34px] w-full rounded-xl border-2 border-primary/30 bg-background pl-10 pr-9 text-sm font-medium text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
          {query ? (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("search.clearSearch")}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="flex h-[34px] items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <X className="h-4 w-4" />
            {t("search.clear")}
          </button>
          <button className="flex h-[34px] items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
            <SlidersHorizontal className="h-4 w-4" />
            {t("search.filter")}
          </button>
        </div>
      </div>
    </section>
  )
}
