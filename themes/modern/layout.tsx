"use client"
import { TopNav } from "@/components/top-nav"
import { FooterBar } from "@/components/footer-bar"
import { CartWidget } from "@/components/cart-widget"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1">{children}</main>
      <FooterBar />
      <CartWidget />
    </div>
  )
}
