# AGENTS.md — MARTAS B2B Core App

## Project overview

A Next.js 16 (App Router) B2B auto parts ordering platform for the Turkish market. Single-page application with mock data — no backend, no database, no API calls.

- **Stack**: Next.js 16, React 19, TypeScript 5.7, Tailwind CSS v4, shadcn/ui (base-nova style)
- **Package manager**: pnpm
- **Language**: Turkish (UI labels, data, locale formatting) — English is also supported via i18n

## Essential commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run eslint (no config file exists yet — will fail)
```

There is no test infrastructure, no CI/CD, and no deploy scripts in the repo.

## Code organization

```
app/
  globals.css       # Tailwind v4 @import + shadcn CSS variables + dark/light theme tokens
  layout.tsx        # Root layout: fonts (Geist Sans/Mono), metadata, Vercel Analytics
  page.tsx          # Main page — "use client", wires TopNav → SearchPanel → ProductsTable → FooterBar → CartWidget
components/
  ui/button.tsx     # shadcn Button using @base-ui/react (not Radix)
  top-nav.tsx       # Header with nav tabs, notifications, language selector, theme toggle, user menu
  search-panel.tsx  # Search inputs + filter/clear buttons
  products-table.tsx # Product listing table with stock matrix, column toggling, price columns
  cart-widget.tsx   # Floating cart button + slide-up cart panel
  footer-bar.tsx    # Dealer info bar with balance + FX rates (server component)
lib/
  utils.ts          # cn() — clsx + tailwind-merge
  data.ts           # All mock data, types (Product, Warehouse, PriceColumns), business logic (computePrices)
  cart-context.tsx  # React Context for cart state (CartProvider, useCart)
  i18n/
    index.ts        # Re-exports I18nProvider, useTranslation, useLocale, types
    types.ts        # Locale, TranslationKey, TranslationParams types
    context.tsx     # I18nProvider (lazy-loads dicts), useTranslation hook, useLocale hook
    dicts/
      en.json       # English translation keys
      tr.json       # Turkish translation keys
public/             # Static assets (icons, placeholders)
```

## Architecture and data flow

```
Page (root)
 ├─ CartProvider (context wraps entire app)
 │   ├─ TopNav (reads theme from localStorage, manages dark/light class on <html>)
 │   ├─ SearchPanel (controlled query state lifted to Page, passed down to ProductsTable)
 │   ├─ ProductsTable (filters products by query, renders table with warehouse stock matrix)
 │   ├─ FooterBar (static dealer + FX rates from lib/data)
 │   └─ CartWidget (⚠️ has its own local cart state, does NOT use CartContext)
```

All data originates from `lib/data.ts` — the `products` array, `warehouses` array, `dealer` object, `fxRates`. There are no API calls. Search/filter is client-side only via `useMemo` in `ProductsTable`.

## Key conventions

### Path aliases
`@/*` maps to project root (defined in `tsconfig.json` `paths`).

### Component patterns
- Interactive components use `"use client"` directive at the top of the file.
- Props are typed via inline interfaces (e.g., `type SearchPanelProps = { ... }`).
- State uses React `useState` + `useCallback`/`useMemo` where appropriate.
- Click-outside detection uses `useRef` + `mousedown` event listener + `useEffect` cleanup.
- Icons come from `lucide-react`, imported individually by name.

### Styling conventions
- All Tailwind utility classes inline (no CSS modules).
- shadcn `components.json` uses `base-nova` style with RSC enabled.
- Theme uses CSS custom properties (`--background`, `--foreground`, `--primary`, etc.) defined in `globals.css` with both explicit `.dark` class and `prefers-color-scheme: dark` media query fallback.
- Radius tokens: `--radius-sm` through `--radius-4xl` — use Tailwind classes like `rounded-xl`, `rounded-2xl`.
- Custom semantic colors: `--success`, `--warning`, `--brand` (beyond standard shadcn palette).

### Locale and formatting
- Numbers formatted with `toLocaleString("tr-TR", { ... })`.
- Currency display: append `₺` symbol after formatted number (not via Intl.NumberFormat).
- Search uses `toLocaleLowerCase("tr-TR")` for Turkish case-insensitive matching.
- HTML lang is `"tr"`.

### Internationalization (i18n)

- **Provider**: `I18nProvider` wraps the app in `app/layout.tsx`.
- **Hook**: `useTranslation()` returns `{ t, locale, setLocale, loading }`.
- **Lazy loading**: Translation dictionaries are dynamically imported via `import()` on locale switch — no JSON bundled until needed.
- **Keys**: English-only dot-notation keys (e.g., `"nav.search"`, `"products.inStock"`).
- **Params**: `t("key", { count: 5 })` replaces `{count}` placeholders in translation strings.
- **Adding a new locale**: Create `lib/i18n/dicts/{code}.json`, add to `dictLoaders` in `context.tsx`, update `Locale` type in `types.ts`.
- **Adding a new key**: Add the key to both `en.json` and `tr.json`, then use `t("key")` in components.
- **Locale persistence**: Stored in `localStorage` under key `"app-locale"`. Falls back to browser language, then Turkish.

## Gotchas

1. **TypeScript build errors are suppressed** — `next.config.mjs` has `typescript.ignoreBuildErrors: true`. Always use `tsc --noEmit` or editor diagnostics to catch type issues.

2. **No eslint config** — `package.json` has a `lint` script (`eslint .`) but no `.eslintrc` or `eslint.config.*` exists. Running `pnpm lint` will fail until one is added.

3. **CartWidget has duplicate state** — `components/cart-widget.tsx` maintains its own local `useState` for cart items, completely independent of `CartContext` from `lib/cart-context.tsx`. If integrating real cart functionality, pick one and eliminate the other.

4. **Image optimization disabled** — `next.config.mjs` sets `images.unoptimized: true`. Static images in `public/` are served directly.

5. **Dark mode uses dual approach** — The theme toggler in `TopNav` adds/removes the `dark` class on `<html>`. CSS has both `.dark` selector rules AND `@media (prefers-color-scheme: dark)` with `:root:not(.light)` fallback. When modifying theme colors, update both sections in `globals.css`.

6. **Font class mismatch** — Layout sets CSS variables `--font-geist-sans` and `--font-geist-mono` on `<html>`, but `<body>` only applies `font-sans` (Tailwind class). The `@theme inline` block in `globals.css` maps `--font-sans` to `var(--font-geist-sans)`, so fonts work correctly — but be aware of the indirection.

7. **next-env.d.ts auto-generated** — Do not edit this file. It imports `.next/dev/types/routes.d.ts` which only exists after running `pnpm dev`.

8. **pnpm workspace** — `pnpm-workspace.yaml` enables `msw` and `sharp` native builds. If installing new packages with native deps, they may need to be added here.

## Business logic reference

### Price calculation (`lib/data.ts:computePrices`)
```
listPriceTRY   = product.fiyat × FX rate (TRY=1, USD=32.1688, EUR=34.4381)
kdvliListe     = listPriceTRY × 1.20                    (KDV = 20%)
kdvsizMaliyet  = listPriceTRY × discountMultiplier       (chained discounts like "%42+16")
kdvliMaliyet   = kdvsizMaliyet × 1.20
```
Discount strings like `"%42+16"` are parsed and chained: `price × (1 - 0.42) × (1 - 0.16)`.

### Stock system
Each product has a `stock` record mapping warehouse name → quantity (0 = out of stock). The `warehouses` array defines all 11 warehouse names. `ProductsTable` renders a column per warehouse with check/X indicators.
