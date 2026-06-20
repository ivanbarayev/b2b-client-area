const BASE_URL = "https://2bed-195-174-17-32.ngrok-free.app/v1"

const PLATFORM_HEADER = { "x-platform": "web" } as const

// Stable error code for a network-level failure (server down, DNS, CORS,
// dropped connection). Thrown instead of a localized string so the UI can
// translate it with the user's current language.
export const NETWORK_ERROR = "NETWORK_ERROR"

// safeFetch turns a network-level failure into a clean Error carrying the
// NETWORK_ERROR code. The browser otherwise throws a bare
// `TypeError: Failed to fetch`, which — when a call site forgets to catch —
// surfaces as an unhandled rejection and crashes the dev overlay.
async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(NETWORK_ERROR)
    }
    throw err
  }
}

// ── Token store ───────────────────────────────────────────────────────────────
// Single source of truth for the persisted token pair. auth-context drives login
// and logout; the request layer reads/refreshes through here so a 401 can be
// transparently recovered.

export const ACCESS_TOKEN_KEY = "b2b_token"
export const REFRESH_TOKEN_KEY = "b2b_refresh_token"

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// onSessionExpired is invoked when the refresh token is also invalid/expired, so
// the app can route the user back to login. auth-context registers it.
let onSessionExpired: (() => void) | null = null

export function setSessionExpiredHandler(fn: (() => void) | null): void {
  onSessionExpired = fn
}

// onTokenRefreshed lets auth-context keep its in-memory access token in sync
// after the request layer transparently refreshes, avoiding a redundant refresh
// on the next call that still carries the stale token.
let onTokenRefreshed: ((accessToken: string) => void) | null = null

export function setTokenRefreshedHandler(fn: ((accessToken: string) => void) | null): void {
  onTokenRefreshed = fn
}

// Single-flight: concurrent 401s share one refresh round-trip.
let refreshInFlight: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) return null
  try {
    const data = await publicRequest<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    storeTokens(data.access_token, data.refresh_token)
    onTokenRefreshed?.(data.access_token)
    return data.access_token
  } catch {
    return null
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

// fetchWithAuth wraps a fetch that carries a bearer token. On a 401 it refreshes
// the pair once and replays the request with the new token. buildHeaders is
// re-invoked with the fresh token so the Authorization header is rebuilt.
async function fetchWithAuth<T>(
  path: string,
  init: RequestInit,
  buildHeaders: (token: string) => HeadersInit,
  initialToken: string,
): Promise<T> {
  let token = initialToken

  const send = () =>
    safeFetch(`${BASE_URL}${path}`, { ...init, headers: buildHeaders(token) })

  let res = await send()
  if (res.status === 401) {
    const fresh = await refreshAccessToken()
    if (fresh) {
      token = fresh
      res = await send()
    } else {
      clearTokens()
      onSessionExpired?.()
    }
  }

  const json = await res.json()
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? json.message ?? "request failed")
  }
  return json.data as T
}

function getDealerHeaders(dealerCode: string, dealerName: string, token?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-dealer-code": encodeURIComponent(dealerCode),
    "x-dealer-name": encodeURIComponent(dealerName),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...PLATFORM_HEADER,
  }
}

function getAuthHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...PLATFORM_HEADER,
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { dealerCode: string; dealerName?: string; token?: string },
): Promise<T> {
  const { dealerCode, dealerName = "", token, ...init } = options
  const buildHeaders = (t?: string): HeadersInit => ({
    ...getDealerHeaders(dealerCode, dealerName, t),
    ...(init.headers ?? {}),
  })

  if (token) {
    return fetchWithAuth<T>(path, init, (t) => buildHeaders(t), token)
  }

  const res = await safeFetch(`${BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(token),
  })
  const json = await res.json()
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? json.message ?? "request failed")
  }
  return json.data as T
}

async function authedRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchWithAuth<T>(
    path,
    options,
    (t) => ({ ...getAuthHeaders(t), ...(options.headers ?? {}) }),
    token,
  )
}

async function publicRequest<T>(
  path: string,
  options: RequestInit = {},
  extraHeaders: HeadersInit = {},
): Promise<T> {
  const res = await safeFetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...PLATFORM_HEADER,
      ...extraHeaders,
      ...(options.headers ?? {}),
    },
  })
  const json = await res.json()
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? json.message ?? "request failed")
  }
  return json.data as T
}

// ── Cart types ──────────────────────────────────────────────────────────────

export type ApiCartItem = {
  item_id: number
  cart_id: number
  stock_code: string
  product_name: string
  brand: string
  unit: string
  list_price: number
  currency: string
  discount: string
  vat_rate: number
  net_price: number
  gross_price: number
  quantity: number
  line_note: string
  added_by: string
  added_at: string
}

export type ApiCart = {
  cart_id: number
  dealer_code: string
  dealer_name: string
  notes: string
  items: ApiCartItem[]
  created_at: string
  updated_at: string
}

export type AddItemPayload = {
  stock_code: string
  product_name: string
  brand: string
  unit: string
  list_price: number
  currency: string
  discount: string
  vat_rate: number
  net_price: number
  gross_price: number
  quantity: number
  line_note: string
  added_by: string
}

// ── Order types ──────────────────────────────────────────────────────────────

export type ApiOrderItem = {
  item_id: number
  order_id: number
  stock_code: string
  product_name: string
  brand: string
  unit: string
  list_price: number
  currency: string
  discount: string
  vat_rate: number
  net_price: number
  gross_price: number
  quantity: number
  line_note: string
  added_by: string
}

export type ApiOrderSummary = {
  total_net: number
  total_vat: number
  total_gross: number
  currency: string
}

export type ApiOrder = {
  order_id: number
  order_no: string
  dealer_code: string
  dealer_name: string
  warehouse: string
  payment_method: string
  notes: string
  status: string
  summary: ApiOrderSummary
  items: ApiOrderItem[]
  submitted_at: string
  updated_at: string
}

export type SubmitOrderPayload = {
  cart_id: number
  warehouse?: string
  payment_method: "cash" | "creditCard" | "bankTransfer" | "openAccount"
  notes?: string
}

// ── Auth types ───────────────────────────────────────────────────────────────

export type LoginPayload = {
  user_name: string
  password: string
  remember_me?: boolean
}

export type LoginResponse = {
  access_token: string
  refresh_token: string
  [key: string]: unknown
}

export type ForgetPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  email: string
  code: string
  password: string
}

// ── User types ───────────────────────────────────────────────────────────────

export type BranchRoleAssignment = {
  branch_id: number
  role_id: number
}

export type ApiUser = {
  id: number
  f_name: string
  l_name: string
  email: string
  phone?: string
  status: number
  branches?: BranchRoleAssignment[]
}

export type CreateUserPayload = {
  f_name: string
  l_name: string
  email: string
  password: string
  phone?: string
  branches?: BranchRoleAssignment[]
}

export type UpdateUserPayload = {
  f_name?: string
  l_name?: string
  email?: string
  phone?: string
  status?: 0 | 1 | -1
  branches?: BranchRoleAssignment[]
}

// ── Cart API ─────────────────────────────────────────────────────────────────

export const cartApi = {
  getCart: (token: string, dealerCode: string, dealerName: string) =>
    request<ApiCart>("/cart", { method: "GET", token, dealerCode, dealerName }),

  addItem: (token: string, dealerCode: string, dealerName: string, payload: AddItemPayload) =>
    request<ApiCart>("/cart/items", {
      method: "POST",
      token,
      dealerCode,
      dealerName,
      body: JSON.stringify(payload),
    }),

  updateQuantity: (token: string, dealerCode: string, itemId: number, quantity: number) =>
    request<ApiCartItem>(`/cart/items/${itemId}/quantity`, {
      method: "PATCH",
      token,
      dealerCode,
      body: JSON.stringify({ quantity }),
    }),

  updateNote: (token: string, dealerCode: string, itemId: number, lineNote: string) =>
    request<ApiCartItem>(`/cart/items/${itemId}/note`, {
      method: "PATCH",
      token,
      dealerCode,
      body: JSON.stringify({ line_note: lineNote }),
    }),

  removeItem: (token: string, dealerCode: string, itemId: number) =>
    request<null>(`/cart/items/${itemId}`, { method: "DELETE", token, dealerCode }),

  clearCart: (token: string, dealerCode: string) =>
    request<null>("/cart", { method: "DELETE", token, dealerCode }),

  updateNotes: (token: string, dealerCode: string, notes: string) =>
    request<null>("/cart/notes", {
      method: "PATCH",
      token,
      dealerCode,
      body: JSON.stringify({ notes }),
    }),
}

// ── Orders API ───────────────────────────────────────────────────────────────

export const ordersApi = {
  submitOrder: (token: string, dealerCode: string, dealerName: string, payload: SubmitOrderPayload) =>
    request<ApiOrder>("/orders", {
      method: "POST",
      token,
      dealerCode,
      dealerName,
      body: JSON.stringify(payload),
    }),

  listOrders: (token: string, dealerCode: string) =>
    request<ApiOrder[]>("/orders", { method: "GET", token, dealerCode }),

  getOrder: (token: string, dealerCode: string, orderId: number) =>
    request<ApiOrder>(`/orders/${orderId}`, { method: "GET", token, dealerCode }),

  updateStatus: (token: string, orderId: number, status: "pending" | "shipped" | "delivered" | "cancelled" | "returned") =>
    authedRequest<ApiOrder>(`/orders/${orderId}/status`, token, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
}

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload, lang = "en") =>
    publicRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }, { "x-lang-code": lang, "x-src": "1" }),

  logout: (token: string) =>
    authedRequest<null>("/auth/logout", token, {
      method: "POST",
      headers: { "x-src": "1" },
    }),

  forgetPassword: (payload: ForgetPasswordPayload) =>
    publicRequest<null>("/auth/forget-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: ResetPasswordPayload) =>
    publicRequest<null>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: (refreshToken: string) =>
    publicRequest<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  refreshOrg: (token: string, orgId: number, lang = "en") =>
    authedRequest<LoginResponse>(`/auth/refresh-org/${orgId}`, token, {
      method: "GET",
      headers: { "x-lang-code": lang, "x-src": "1" },
    }),
}

// ── Search types ─────────────────────────────────────────────────────────────
// Mirrors search.ProductResult from the search-engine service. Returned merged
// across the altay + martas suppliers by the /api/search route proxy.

export type ProductResult = {
  source: string // "altay" | "martas"
  external_id: string
  name: string
  sku: string
  brand: string
  brand_code: string
  unit: string
  stock_qty: number
  net_price: number // excl. VAT
  list_price: number // excl. VAT
  currency: string
  image_url: string
  min_order: number
}

// ── Search API ────────────────────────────────────────────────────────────────
// Hits the same-origin Next.js route proxy, which fans out to the search-engine
// service server-side with the API key. No bearer token needed here.

export const searchApi = {
  search: async (q: string, token: string, signal?: AbortSignal): Promise<ProductResult[]> => {
    const res = await safeFetch(`/api/search?q=${encodeURIComponent(q)}`, {
      signal,
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      throw new Error(json.message ?? "search failed")
    }
    return (json.data ?? []) as ProductResult[]
  },
}

// ── Users API ─────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (token: string) =>
    authedRequest<ApiUser[]>("/users", token, { method: "GET" }),

  create: (token: string, payload: CreateUserPayload) =>
    authedRequest<ApiUser>("/users", token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  get: (token: string, id: number) =>
    authedRequest<ApiUser>(`/users/${id}`, token, { method: "GET" }),

  update: (token: string, id: number, payload: UpdateUserPayload) =>
    authedRequest<ApiUser>(`/users/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (token: string, id: number) =>
    authedRequest<null>(`/users/${id}`, token, { method: "DELETE" }),
}
