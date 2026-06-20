export const warehouses = [
  "ADANA",
  "ANKARA",
  "İSTANBUL ANADOLU",
  "SAMSUN",
  "BURSA",
  "İSTANBUL AVRUPA",
  "İZMİR",
  "ERZURUM",
  "DİYARBAKIR",
  "DİSTRİGO",
  "TEDARİKÇİ DEPO",
] as const

export type Warehouse = (typeof warehouses)[number]

export type Currency = "TRY" | "USD" | "EUR"

export type Product = {
  id: string
  stokKodu: string
  refNo: string
  marka: string
  urunAdi: string
  campaign?: boolean
  oem?: boolean
  fiyat: number
  puan: number
  birim?: string // BR (e.g. "ad.")
  paraBirimi?: Currency // currency of fiyat (list price)
  iskonto?: string // discount string e.g. "%42+16"
  stock: Record<string, number> // warehouse -> quantity (0 = out)
}

function mkStock(values: number[]): Record<string, number> {
  const out: Record<string, number> = {}
  warehouses.forEach((w, i) => {
    out[w] = values[i] ?? 0
  })
  return out
}

export const products: Product[] = [
  {
    id: "1",
    stokKodu: "FOR-YC1Q 9P919 BC N",
    refNo: "YC1Q 9P919 BC N",
    marka: "FORD OTOSAN",
    urunAdi: "MAZOT POMPA DİŞLİSİ 2.4 120 PS FORD TRANSIT V184 01-",
    oem: true,
    fiyat: 4280.5,
    puan: 1240,
    stock: mkStock([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  },
  {
    id: "2",
    stokKodu: "MGA-961016",
    refNo: "4339937",
    marka: "MGA KAUÇUK",
    urunAdi: "BYPASS HORTUMU ( FIAT M131 )",
    fiyat: 312.9,
    puan: 86,
    stock: mkStock([0, 24, 18, 0, 0, 7, 12, 0, 0, 0, 31]),
  },
  {
    id: "3",
    stokKodu: "RAP-11102",
    refNo: "4339937",
    marka: "RAPRO",
    urunAdi: "BYPASS HORTUMU ( FIAT M131 )",
    campaign: true,
    fiyat: 289.0,
    puan: 74,
    stock: mkStock([0, 56, 41, 0, 9, 22, 14, 33, 8, 0, 60]),
  },
  {
    id: "4",
    stokKodu: "BOS-0986452041",
    refNo: "0986452041",
    marka: "BOSCH",
    urunAdi: "YAĞ FİLTRESİ FORD FOCUS / FIESTA 1.6 TDCİ",
    oem: true,
    fiyat: 198.75,
    puan: 52,
    stock: mkStock([14, 88, 102, 21, 44, 70, 65, 12, 19, 5, 140]),
  },
  {
    id: "5",
    stokKodu: "MAN-W712/95",
    refNo: "W712/95",
    marka: "MANN FILTER",
    urunAdi: "YAĞ FİLTRESİ RENAULT CLIO / MEGANE 1.5 DCİ",
    campaign: true,
    fiyat: 224.4,
    puan: 61,
    stock: mkStock([6, 34, 0, 12, 28, 0, 41, 0, 11, 0, 90]),
  },
  {
    id: "6",
    stokKodu: "VAL-585011",
    refNo: "585011",
    marka: "VALEO",
    urunAdi: "DEBRİYAJ SETİ VW GOLF / PASSAT 1.9 TDİ",
    fiyat: 3640.0,
    puan: 980,
    stock: mkStock([2, 11, 8, 0, 6, 9, 7, 0, 3, 1, 18]),
  },
  {
    id: "7",
    stokKodu: "SKF-VKBA3644",
    refNo: "VKBA3644",
    marka: "SKF",
    urunAdi: "ÖN TEKER RULMANI BMW E46 / E90 SERİSİ",
    oem: true,
    fiyat: 1180.25,
    puan: 310,
    stock: mkStock([0, 0, 5, 0, 0, 14, 9, 0, 0, 0, 22]),
  },
  {
    id: "8",
    stokKodu: "FEB-04781",
    refNo: "04781",
    marka: "FEBİ BİLSTEİN",
    urunAdi: "ROT BAŞI MERCEDES SPRINTER / VITO",
    fiyat: 540.6,
    puan: 142,
    stock: mkStock([8, 42, 30, 15, 19, 26, 38, 7, 14, 2, 75]),
  },
  {
    id: "9",
    stokKodu: "BRE-09.A407.11",
    refNo: "09.A407.11",
    marka: "BREMBO",
    urunAdi: "ÖN FREN DİSKİ TAKIMI AUDI A4 / A6",
    campaign: true,
    fiyat: 2120.0,
    puan: 560,
    stock: mkStock([0, 18, 22, 0, 11, 16, 20, 0, 6, 0, 40]),
  },
  {
    id: "10",
    stokKodu: "GAT-5PK1750",
    refNo: "5PK1750",
    marka: "GATES",
    urunAdi: "V KAYIŞI KANALLI FIAT DOBLO / LINEA 1.3 MJET",
    fiyat: 176.3,
    puan: 44,
    stock: mkStock([12, 64, 55, 18, 33, 48, 52, 9, 21, 4, 110]),
  },
  {
    id: "11",
    stokKodu: "NGK-BKR6E",
    refNo: "BKR6E",
    marka: "NGK",
    urunAdi: "ATEŞLEME BUJİSİ RENAULT / DACIA BENZİNLİ",
    fiyat: 64.9,
    puan: 16,
    stock: mkStock([40, 120, 98, 55, 77, 88, 95, 30, 44, 12, 260]),
  },
  {
    id: "12",
    stokKodu: "LUK-624321109",
    refNo: "624 3211 09",
    marka: "LUK",
    urunAdi: "VOLAN SETİ FORD TRANSIT 2.2 TDCİ",
    oem: true,
    fiyat: 5890.0,
    puan: 1520,
    stock: mkStock([0, 4, 6, 0, 0, 8, 5, 0, 0, 0, 12]),
  },
]

export const navItems = [
  { id: "arama", labelKey: "nav.search" as const, icon: "Search" },
  { id: "arac", labelKey: "nav.vehicle" as const, icon: "Car" },
  { id: "sepet", labelKey: "nav.cart" as const, icon: "ShoppingBasket", badge: 12 },
  { id: "oem", labelKey: "nav.oem" as const, icon: "SlidersHorizontal" },
  { id: "odemeler", labelKey: "nav.payments" as const, icon: "CreditCard" },
  { id: "mutabakat", labelKey: "nav.reconciliation" as const, icon: "Handshake" },
  { id: "siparis-listesi", labelKey: "nav.orderHistory" as const, icon: "ClipboardCheck" },
] as const

export const breadcrumb = [
  "Arama",
  "Arama Sonucu",
  "Özel Arama",
  "Eşdeğer Ürünler",
  "Oem",
  "Araçlar",
  "Stok Geçmişi",
  "Aldıklarım (10000)",
]

export const fxRates = { eur: 34.4381, usd: 32.1688 }

export const dealer = {
  name: "Berfin Işık",
  code: "B130017",
  company: "DEMİR YDK PRC OTO TUR NK İHT İHR TİTD STİ",
  balance: 124850.75,
}

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled" | "returned"

export type OrderItem = {
  stokKodu: string
  urunAdi: string
  quantity: number
  unitPrice: number
}

export type Order = {
  id: string
  orderNo: string
  date: string
  warehouse: Warehouse
  items: OrderItem[]
  total: number
  status: OrderStatus
}

function mkOrder(
  id: string,
  orderNo: string,
  date: string,
  warehouse: Warehouse,
  items: OrderItem[],
  status: OrderStatus,
): Order {
  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  return { id, orderNo, date, warehouse, items, total, status }
}

export const orders: Order[] = [
  mkOrder("1", "SP-2025-00142", "2025-06-15", "ANKARA", [
    { stokKodu: "BOS-0986452041", urunAdi: "YAĞ FİLTRESİ FORD FOCUS 1.6 TDCİ", quantity: 4, unitPrice: 198.75 },
    { stokKodu: "NGK-BKR6E", urunAdi: "ATEŞLEME BUJİSİ RENAULT/DACIA", quantity: 8, unitPrice: 64.9 },
  ], "delivered"),
  mkOrder("2", "SP-2025-00138", "2025-06-13", "İSTANBUL ANADOLU", [
    { stokKodu: "VAL-585011", urunAdi: "DEBRİYAJ SETİ VW GOLF 1.9 TDİ", quantity: 1, unitPrice: 3640.0 },
  ], "shipped"),
  mkOrder("3", "SP-2025-00131", "2025-06-10", "İZMİR", [
    { stokKodu: "MAN-W712/95", urunAdi: "YAĞ FİLTRESİ RENAULT CLIO 1.5 DCİ", quantity: 6, unitPrice: 224.4 },
    { stokKodu: "GAT-5PK1750", urunAdi: "V KAYIŞI FIAT DOBLO 1.3 MJET", quantity: 3, unitPrice: 176.3 },
  ], "delivered"),
  mkOrder("4", "SP-2025-00129", "2025-06-09", "BURSA", [
    { stokKodu: "SKF-VKBA3644", urunAdi: "ÖN TEKER RULMANI BMW E46/E90", quantity: 2, unitPrice: 1180.25 },
  ], "pending"),
  mkOrder("5", "SP-2025-00122", "2025-06-07", "ADANA", [
    { stokKodu: "BRE-09.A407.11", urunAdi: "ÖN FREN DİSKİ TAKIMI AUDI A4/A6", quantity: 1, unitPrice: 2120.0 },
    { stokKodu: "FEB-04781", urunAdi: "ROT BAŞI MERCEDES SPRINTER/VITO", quantity: 2, unitPrice: 540.6 },
  ], "delivered"),
  mkOrder("6", "SP-2025-00118", "2025-06-05", "SAMSUN", [
    { stokKodu: "LUK-624321109", urunAdi: "VOLAN SETİ FORD TRANSIT 2.2 TDCİ", quantity: 1, unitPrice: 5890.0 },
  ], "cancelled"),
  mkOrder("7", "SP-2025-00113", "2025-06-03", "İSTANBUL AVRUPA", [
    { stokKodu: "RAP-11102", urunAdi: "BYPASS HORTUMU FIAT M131", quantity: 5, unitPrice: 289.0 },
    { stokKodu: "MGA-961016", urunAdi: "BYPASS HORTUMU FIAT M131", quantity: 3, unitPrice: 312.9 },
  ], "delivered"),
  mkOrder("8", "SP-2025-00107", "2025-06-01", "ANKARA", [
    { stokKodu: "FOR-YC1Q", urunAdi: "MAZOT POMPA DİŞLİSİ 2.4 120PS TRANSIT V184", quantity: 1, unitPrice: 4280.5 },
  ], "shipped"),
  mkOrder("9", "SP-2025-00099", "2025-05-28", "İZMİR", [
    { stokKodu: "BOS-0986452041", urunAdi: "YAĞ FİLTRESİ FORD FOCUS 1.6 TDCİ", quantity: 10, unitPrice: 198.75 },
    { stokKodu: "NGK-BKR6E", urunAdi: "ATEŞLEME BUJİSİ RENAULT/DACIA", quantity: 20, unitPrice: 64.9 },
    { stokKodu: "GAT-5PK1750", urunAdi: "V KAYIŞI FIAT DOBLO 1.3 MJET", quantity: 5, unitPrice: 176.3 },
  ], "delivered"),
  mkOrder("10", "SP-2025-00093", "2025-05-25", "BURSA", [
    { stokKodu: "VAL-585011", urunAdi: "DEBRİYAJ SETİ VW GOLF 1.9 TDİ", quantity: 2, unitPrice: 3640.0 },
  ], "delivered"),
  mkOrder("11", "SP-2025-00088", "2025-05-22", "DİYARBAKIR", [
    { stokKodu: "SKF-VKBA3644", urunAdi: "ÖN TEKER RULMANI BMW E46/E90", quantity: 4, unitPrice: 1180.25 },
    { stokKodu: "FEB-04781", urunAdi: "ROT BAŞI MERCEDES SPRINTER/VITO", quantity: 3, unitPrice: 540.6 },
  ], "pending"),
  mkOrder("12", "SP-2025-00081", "2025-05-19", "ADANA", [
    { stokKodu: "MAN-W712/95", urunAdi: "YAĞ FİLTRESİ RENAULT CLIO 1.5 DCİ", quantity: 12, unitPrice: 224.4 },
  ], "delivered"),
  mkOrder("13", "SP-2025-00074", "2025-05-15", "İSTANBUL ANADOLU", [
    { stokKodu: "BRE-09.A407.11", urunAdi: "ÖN FREN DİSKİ TAKIMI AUDI A4/A6", quantity: 2, unitPrice: 2120.0 },
  ], "cancelled"),
  mkOrder("14", "SP-2025-00067", "2025-05-12", "SAMSUN", [
    { stokKodu: "LUK-624321109", urunAdi: "VOLAN SETİ FORD TRANSIT 2.2 TDCİ", quantity: 1, unitPrice: 5890.0 },
    { stokKodu: "RAP-11102", urunAdi: "BYPASS HORTUMU FIAT M131", quantity: 8, unitPrice: 289.0 },
  ], "delivered"),
  mkOrder("15", "SP-2025-00059", "2025-05-08", "ERZURUM", [
    { stokKodu: "GAT-5PK1750", urunAdi: "V KAYIŞI FIAT DOBLO 1.3 MJET", quantity: 6, unitPrice: 176.3 },
    { stokKodu: "NGK-BKR6E", urunAdi: "ATEŞLEME BUJİSİ RENAULT/DACIA", quantity: 15, unitPrice: 64.9 },
  ], "shipped"),
]

export const totalPoints = 66162

export const KDV_RATE = 0.2 // %20 KDV

const currencySymbol: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" }

// Deterministic defaults so every product has BR / currency / discount
const currencyCycle: Currency[] = ["TRY", "USD", "EUR"]
const iskontoCycle = ["%42+16", "%38+12", "%45+10", "%30+15", "%42+16+10"]

function defaultsFor(p: Product) {
  const parsedIdx = Number(p.id) - 1
  const idx = Number.isFinite(parsedIdx) ? parsedIdx : 0
  return {
    birim: p.birim ?? "ad.",
    paraBirimi: p.paraBirimi ?? currencyCycle[idx % currencyCycle.length],
    iskonto: p.iskonto ?? (p.campaign ? "%42+16+10" : iskontoCycle[idx % iskontoCycle.length]),
  }
}

// Strip supplier source prefix for display, e.g. "altay_12345" -> "12345"
export function displayStockCode(stokKodu: string) {
  return (stokKodu ?? "").replace(/^[a-z]+_/, "")
}

// "%42+16" -> [0.42, 0.16] ; chained net = list * (1-0.42) * (1-0.16)
function discountMultiplier(iskonto: string) {
  const parts = (iskonto ?? "").replace("%", "").split("+").map(Number)
  return parts.reduce((acc, d) => acc * (1 - (isNaN(d) ? 0 : d) / 100), 1)
}

export type PriceColumns = {
  birim: string
  paraBirimi: Currency
  listeFiyati: number // in original currency
  listeFiyatiSembol: string
  kdvliListe: number // TRY, incl. KDV
  kdvsizMaliyet: number // TRY, after discount, excl. KDV
  kdvliMaliyet: number // TRY, after discount, incl. KDV
  iskonto: string
}

export function computePrices(p: Product): PriceColumns {
  const { birim, paraBirimi, iskonto } = defaultsFor(p)
  const rate = paraBirimi === "TRY" ? 1 : paraBirimi === "USD" ? fxRates.usd : fxRates.eur
  const listeTRY = p.fiyat * rate
  const kdvliListe = listeTRY * (1 + KDV_RATE)
  const kdvsizMaliyet = listeTRY * discountMultiplier(iskonto)
  const kdvliMaliyet = kdvsizMaliyet * (1 + KDV_RATE)
  return {
    birim,
    paraBirimi,
    listeFiyati: p.fiyat,
    listeFiyatiSembol: currencySymbol[paraBirimi],
    kdvliListe,
    kdvsizMaliyet,
    kdvliMaliyet,
    iskonto,
  }
}
