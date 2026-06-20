"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { computePrices, KDV_RATE, dealer, type Product } from "@/lib/data"
import { cartApi, type ApiCart, type ApiCartItem } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export type CartItem = {
  id: string           // item_id as string (for UI key compat)
  itemId: number       // raw DB id
  stokKodu: string
  urunAdi: string
  marka: string
  birim: string
  fiyat: number        // net_price (KDV'siz, after discount)
  listeFiyati: number  // gross_price (KDV'li)
  iskonto: string
  kdvOran: number
  adet: number
  ekleyenKisi: string
  satırNotu?: string
}

type CartContextType = {
  items: CartItem[]
  cartId: number | null
  count: number
  total: number
  open: boolean
  loading: boolean
  error: string | null
  clearError: () => void
  setOpen: (v: boolean | ((p: boolean) => boolean)) => void
  addProduct: (product: Product) => Promise<void>
  changeQty: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  updateNote: (itemId: number, note: string) => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

function apiItemToCartItem(it: ApiCartItem): CartItem {
  return {
    id: String(it.item_id),
    itemId: it.item_id,
    stokKodu: it.stock_code,
    urunAdi: it.product_name,
    marka: it.brand,
    birim: it.unit,
    fiyat: it.net_price,
    listeFiyati: it.gross_price,
    iskonto: it.discount,
    kdvOran: it.vat_rate,
    adet: it.quantity,
    ekleyenKisi: it.added_by,
    satırNotu: it.line_note,
  }
}

function apiCartToItems(cart: ApiCart): { cartId: number; items: CartItem[] } {
  return {
    cartId: cart.cart_id,
    items: (cart.items ?? []).map(apiItemToCartItem),
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [cartId, setCartId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch cart on mount / when token changes
  useEffect(() => {
    if (!token) return
    let cancelled = false
    cartApi.getCart(token, dealer.code, dealer.name)
      .then((cart) => {
        if (cancelled) return
        const parsed = apiCartToItems(cart)
        setCartId(parsed.cartId)
        setItems(parsed.items)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [token])

  const addProduct = useCallback(async (product: Product) => {
    if (!token) return
    const prices = computePrices(product)
    setLoading(true)
    setError(null)
    try {
      const cart = await cartApi.addItem(token, dealer.code, dealer.name, {
        stock_code: product.stokKodu,
        product_name: product.urunAdi,
        brand: product.marka,
        unit: prices.birim,
        list_price: prices.listeFiyati,
        currency: prices.paraBirimi,
        discount: prices.iskonto,
        vat_rate: KDV_RATE,
        net_price: prices.kdvsizMaliyet,
        gross_price: prices.kdvliMaliyet,
        quantity: 1,
        line_note: "",
        added_by: dealer.name,
      })
      const parsed = apiCartToItems(cart)
      setCartId(parsed.cartId)
      setItems(parsed.items)
      setOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "CART_ADD_FAILED")
    } finally {
      setLoading(false)
    }
  }, [token])

  const changeQty = useCallback(async (itemId: number, quantity: number) => {
    if (!token || quantity < 1) return
    setLoading(true)
    setError(null)
    try {
      const updated = await cartApi.updateQuantity(token, dealer.code, itemId, quantity)
      setItems((prev) =>
        prev.map((it) => (it.itemId === itemId ? apiItemToCartItem(updated) : it)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "CART_QTY_FAILED")
    } finally {
      setLoading(false)
    }
  }, [token])

  const removeItem = useCallback(async (itemId: number) => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      await cartApi.removeItem(token, dealer.code, itemId)
      setItems((prev) => prev.filter((it) => it.itemId !== itemId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "CART_REMOVE_FAILED")
    } finally {
      setLoading(false)
    }
  }, [token])

  const clearCart = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      await cartApi.clearCart(token, dealer.code)
      setItems([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "CART_CLEAR_FAILED")
    } finally {
      setLoading(false)
    }
  }, [token])

  const updateNote = useCallback(async (itemId: number, note: string) => {
    if (!token) return
    try {
      const updated = await cartApi.updateNote(token, dealer.code, itemId, note)
      setItems((prev) =>
        prev.map((it) => (it.itemId === itemId ? apiItemToCartItem(updated) : it)),
      )
    } catch {
      // optimistic fallback
      setItems((prev) =>
        prev.map((it) => (it.itemId === itemId ? { ...it, satırNotu: note } : it)),
      )
    }
  }, [token])

  const clearError = useCallback(() => setError(null), [])

  const count = items.reduce((sum, it) => sum + it.adet, 0)
  const total = items.reduce((sum, it) => sum + it.adet * it.fiyat * (1 + it.kdvOran), 0)

  return (
    <CartContext.Provider
      value={{ items, cartId, count, total, open, loading, error, clearError, setOpen, addProduct, changeQty, removeItem, clearCart, updateNote }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
