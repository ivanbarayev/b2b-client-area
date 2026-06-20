"use client"
import { Check } from "lucide-react"
import { useStructuralTheme } from "@/lib/theme-system/structural-context"
import { STRUCTURAL_THEMES } from "@/lib/theme-system/loader"
import type { StructuralThemeId } from "@/lib/theme-system/types"

const THEME_META: Record<StructuralThemeId, {
  name: string
  description: string
  layout: string
  previewColors: { primary: string; accent: string; bg: string }
}> = {
  modern: {
    name: "Modern",
    description: "Clean top-navigation layout with full-width content",
    layout: "Top Navigation",
    previewColors: { primary: "#243d5c", accent: "#dbeafe", bg: "#f8fafc" },
  },
  corporate: {
    name: "Corporate",
    description: "Professional sidebar navigation for enterprise ERP use",
    layout: "Sidebar",
    previewColors: { primary: "#1e3a5f", accent: "#e0eaf8", bg: "#f4f6fb" },
  },
  minimal: {
    name: "Minimal",
    description: "Ultra-clean minimal layout with a slim header bar",
    layout: "Minimal Top",
    previewColors: { primary: "#374151", accent: "#f3f4f6", bg: "#ffffff" },
  },
}

function ThemePreviewCard({
  id,
  selected,
  onSelect,
}: {
  id: StructuralThemeId
  selected: boolean
  onSelect: () => void
}) {
  const meta = THEME_META[id]
  const { primary, accent, bg } = meta.previewColors

  return (
    <button
      onClick={onSelect}
      className={`group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        selected ? "border-primary shadow-md" : "border-border hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      <div className="relative h-36 w-full overflow-hidden" style={{ background: bg }}>
        {id === "corporate" ? (
          <div className="flex h-full">
            <div className="flex w-12 flex-col gap-1.5 p-1.5" style={{ background: primary }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-2 rounded-sm opacity-40" style={{ background: accent }} />
              ))}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex h-6 items-center justify-end gap-1 px-2" style={{ background: accent, opacity: 0.5 }} />
              <div className="flex-1 p-2">
                <div className="mb-1.5 h-1.5 w-2/3 rounded-full opacity-20" style={{ background: primary }} />
                <div className="h-12 w-full rounded-md border opacity-15" style={{ borderColor: primary }} />
              </div>
            </div>
          </div>
        ) : id === "minimal" ? (
          <div className="flex flex-col h-full">
            <div className="flex h-6 items-center gap-2 border-b px-3" style={{ borderColor: primary + "30" }}>
              <div className="h-2 w-2 rounded-full" style={{ background: primary }} />
              <div className="h-1.5 w-10 rounded-full opacity-40" style={{ background: primary }} />
            </div>
            <div className="flex-1 p-3">
              <div className="mb-2 h-1.5 w-1/2 rounded-full opacity-20" style={{ background: primary }} />
              <div className="h-16 w-full rounded-md border opacity-15" style={{ borderColor: primary }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex h-8 items-center gap-2 px-3" style={{ background: primary }}>
              <div className="h-2 w-2 rounded-full opacity-70" style={{ background: accent }} />
              <div className="flex gap-1.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-1.5 w-6 rounded-full opacity-40" style={{ background: accent }} />
                ))}
              </div>
            </div>
            <div className="flex-1 p-3">
              <div className="mb-2 h-1.5 w-1/2 rounded-full opacity-20" style={{ background: primary }} />
              <div className="h-16 w-full rounded-md border opacity-15" style={{ borderColor: primary }} />
            </div>
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Check className="h-4 w-4" />
            </span>
          </div>
        )}
      </div>

      <div className={`flex items-center justify-between px-3 py-2.5 ${selected ? "bg-accent/40" : "bg-card"}`}>
        <div>
          <div className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>{meta.name}</div>
          <div className="text-xs text-muted-foreground">{meta.layout}</div>
        </div>
      </div>
    </button>
  )
}

export default function ThemeManagementPage() {
  const { structuralTheme, setStructuralTheme } = useStructuralTheme()

  return (
    <>
      <div className="mb-6 border-b border-border pb-5">
        <h2 className="text-base font-semibold text-foreground">Layout Theme</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the structural layout for your ERP interface. This changes navigation placement and overall page structure.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {STRUCTURAL_THEMES.map((id) => (
          <ThemePreviewCard
            key={id}
            id={id}
            selected={structuralTheme === id}
            onSelect={() => setStructuralTheme(id)}
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Layout changes take effect immediately. Business-critical ERP screens (orders, invoices, inventory) remain unchanged across all themes.
      </p>
    </>
  )
}
