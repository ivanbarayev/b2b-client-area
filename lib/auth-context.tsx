"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  authApi,
  storeTokens,
  clearTokens,
  setSessionExpiredHandler,
  setTokenRefreshedHandler,
  ACCESS_TOKEN_KEY,
  type LoginPayload,
} from "@/lib/api"

type AuthContextType = {
  isLoggedIn: boolean
  token: string | null
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY)
    setToken(stored)
    setReady(true)
  }, [])

  // When a refresh ultimately fails, the request layer clears tokens and calls
  // this handler so the UI reflects the logged-out state.
  useEffect(() => {
    setSessionExpiredHandler(() => setToken(null))
    setTokenRefreshedHandler((accessToken) => setToken(accessToken))
    return () => {
      setSessionExpiredHandler(null)
      setTokenRefreshedHandler(null)
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authApi.login(payload)
    storeTokens(data.access_token, data.refresh_token)
    setToken(data.access_token)
  }, [])

  const logout = useCallback(async () => {
    if (token) {
      try {
        await authApi.logout(token)
      } catch {
        // proceed regardless
      }
    }
    clearTokens()
    setToken(null)
  }, [token])

  if (!ready) return null

  return (
    <AuthContext.Provider value={{ isLoggedIn: token !== null, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
