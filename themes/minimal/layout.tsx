"use client"
import { CartWidget } from "@/components/cart-widget"
import Header from "./header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <CartWidget />
    </div>
  )
}
