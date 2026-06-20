import { NextResponse } from "next/server"

// Server-only base URL of the search-engine service. Must include its /api/v1
// base path. Hardcoded because Cloudflare Workers does not populate
// process.env from runtime bindings, so env-based config returns undefined
// in production. A trailing slash is stripped so paths join cleanly.
function searchEngineUrl(): string | undefined {
  return "https://4705-195-174-17-32.ngrok-free.app/v1".replace(/\/+$/, "")
}

// ProductResult mirrors search.ProductResult from the search-engine service.
type ProductResult = {
  source: string
  external_id: string
  name: string
  sku: string
  brand: string
  brand_code: string
  unit: string
  stock_qty: number
  net_price: number
  list_price: number
  currency: string
  image_url: string
  min_order: number
}

// Each supplier search is wrapped in the standard { data, error, message } envelope.
type Envelope = { data: ProductResult[] | null; error: boolean; message: string }

// A single slow/hung supplier (e.g. Martaş driving a live headless browser with a
// 30s internal timeout) must not stall the whole search. Cap each supplier call so
// the other supplier's results can still be returned promptly.
const SUPPLIER_TIMEOUT_MS = 15_000

async function searchDomain(
  baseUrl: string,
  domain: "altay" | "martas",
  q: string,
  authorization: string,
): Promise<ProductResult[]> {
  const res = await fetch(
    `${baseUrl}/${domain}/products/search?q=${encodeURIComponent(q)}`,
    {
      // The search-engine guards these routes with the same JWT the client holds.
      headers: { Authorization: authorization },
      // Search results are live supplier data; never cache.
      cache: "no-store",
      // Abort a hung supplier so the caller can fall back to the other one.
      signal: AbortSignal.timeout(SUPPLIER_TIMEOUT_MS),
    },
  )
  // A broken supplier may return a non-JSON error body (gateway HTML, empty 502);
  // treat an unparseable body as a supplier failure rather than letting it throw raw.
  const json = (await res.json().catch(() => null)) as Envelope | null
  if (!res.ok || !json || json.error) {
    throw new Error(json?.message || `${domain} search failed`)
  }
  return json.data ?? []
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim()
  if (!q) {
    return NextResponse.json({ data: null, error: true, message: "search query required" }, { status: 400 })
  }
  const baseUrl = searchEngineUrl()
  if (!baseUrl) {
    return NextResponse.json(
      { data: null, error: true, message: "search engine not configured" },
      { status: 500 },
    )
  }

  const authorization = req.headers.get("authorization")
  if (!authorization) {
    return NextResponse.json(
      { data: null, error: true, message: "unauthorized" },
      { status: 401 },
    )
  }

  // Fan out to both suppliers in parallel; one failing supplier must not sink the whole search.
  const [altay, martas] = await Promise.allSettled([
    searchDomain(baseUrl, "altay", q, authorization),
    searchDomain(baseUrl, "martas", q, authorization),
  ])

  const data: ProductResult[] = [
    ...(altay.status === "fulfilled" ? altay.value : []),
    ...(martas.status === "fulfilled" ? martas.value : []),
  ]

  // Surface a partial failure only when both suppliers errored.
  if (altay.status === "rejected" && martas.status === "rejected") {
    return NextResponse.json(
      { data: null, error: true, message: "search failed" },
      { status: 502 },
    )
  }

  return NextResponse.json({ data, error: false, message: "" })
}