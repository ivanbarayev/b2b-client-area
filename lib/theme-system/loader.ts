import type { ERPTheme, StructuralThemeId } from "./types"

const THEME_REGISTRY: Record<StructuralThemeId, () => Promise<ERPTheme>> = {
  corporate: () => import("@/themes/corporate").then((m) => m.default),
  modern: () => import("@/themes/modern").then((m) => m.default),
  minimal: () => import("@/themes/minimal").then((m) => m.default),
}

export async function loadTheme(id: StructuralThemeId): Promise<ERPTheme> {
  const loader = THEME_REGISTRY[id]
  if (!loader) throw new Error(`Unknown theme: ${id}`)
  return loader()
}

export const STRUCTURAL_THEMES: StructuralThemeId[] = ["corporate", "modern", "minimal"]
