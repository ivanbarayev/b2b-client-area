"use client"
import { CartWidget } from "@/components/cart-widget"
import Header from "./header"
import Sidebar from "./sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
      <CartWidget />
    </div>
  )
}
