"use client"
import { useState } from "react"
import { SearchPanel } from "@/components/search-panel"
import { ProductsTable } from "@/components/products-table"

export default function Page() {
  const [query, setQuery] = useState("")
  return (
    <>
      <SearchPanel query={query} onQueryChange={setQuery} onClear={() => setQuery("")} />
      <ProductsTable query={query} />
    </>
  )
}
