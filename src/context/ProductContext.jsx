import { createContext, useContext, useEffect, useState } from 'react'
import { DEMO_PRODUCTS, createBlankSpec } from '../data/productSpecs'
import { ProductCategoryEnum, TemperatureLayer } from '../data/fakeData'

const LS_KEY = 'gift-demo:products'
const LS_VERSION = 'gift-demo:products:v'
const CURRENT_VERSION = 4
// v3 = 新增贈品產品讓所有 GiftRule 的對應 ProductDetail 都存在
// v4 = 確認所有 DEMO_PRODUCTS 內建產品都存在於 LS（避免「中間版本 v3 漏加產品」的殘留）
//      User 自己編輯的產品保留不動，內建產品如果存在 user LS 也保留 user 編輯

const ProductContext = createContext(null)

// ─── 舊 camelCase → 新 PascalCase migration ──
function migrateLegacyProducts(oldMap) {
  const productionLineMap = {
    frozen: ProductCategoryEnum.冷凍專區,
    babyfood: ProductCategoryEnum.粥寶寶專區,
    eaglebabee: ProductCategoryEnum.益菓保,
    itemnew: ProductCategoryEnum.產地直送,
  }
  const temperatureMap = {
    frozen: TemperatureLayer.冷凍,
    refrigerated: TemperatureLayer.冷藏,
    ambient: TemperatureLayer.常溫,
  }

  const result = {}
  for (const [pid, p] of Object.entries(oldMap)) {
    result[pid] = {
      Id: p.id ?? p.Id,
      Name: p.name ?? p.Name ?? '',
      ProductionLine: p.ProductionLine ?? productionLineMap[p.productionline] ?? 0,
      TemperatureLayer: p.TemperatureLayer ?? temperatureMap[p.temperature] ?? 0,
      Specs: (p.specs ?? p.Specs ?? []).map(migrateLegacySpec),
    }
  }
  return result
}

function migrateLegacySpec(old) {
  return {
    Id: old.id ?? old.Id,
    Sort: old.sort ?? old.Sort ?? 0,
    Detail: old.description ?? old.Detail ?? '',
    Quantity: old.quantity ?? old.Quantity ?? 1,
    Unit: old.unit ?? old.Unit ?? '',
    OriginAmt: old.originPrice ?? old.OriginAmt ?? 0,
    DiscPrice: old.discountPrice ?? old.DiscPrice ?? 0,
    Stock: old.stock ?? old.Stock ?? 0,
    SoldAmt: old.sold ?? old.SoldAmt ?? 0,
    Cost: old.cost ?? old.Cost ?? 0,
    Freight: old.freight ?? old.Freight ?? 0,
    OrdersTime: old.expectShipDate ?? old.OrdersTime ?? '',
    OrdersFinalExportTime: old.expectLastShipDate ?? old.OrdersFinalExportTime ?? '',
    StartTime: old.saleStart ?? old.StartTime ?? '',
    EndTime: old.saleEnd ?? old.EndTime ?? '',
    AutoReplenishOnZero: old.autoExtendDays ?? old.AutoReplenishOnZero ?? 0,
    Display: old.isListed ?? old.Display ?? true,
    IsYuanxiong: old.isYuanxiong ?? old.IsYuanxiong ?? false,
    IsSpecial: old.isSpecial ?? old.IsSpecial ?? false,
    IsCOD: old.isCOD ?? old.IsCOD ?? false,
    IsSubscritpion: old.isSubscription ?? old.IsSubscritpion ?? false,
    ThresholdAmount: old.thresholdAmount ?? old.ThresholdAmount ?? 0,
    Limit: old.limitQuantity ?? old.Limit ?? 0,
    IsGift: old.isGift ?? old.IsGift ?? false,
  }
}

function loadProducts() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return DEMO_PRODUCTS

    const parsed = JSON.parse(raw)
    const version = Number(localStorage.getItem(LS_VERSION) || '1')
    if (version >= CURRENT_VERSION) return parsed

    // 1) 先把舊資料 migrate 成 PascalCase
    let migrated = (version < 2) ? migrateLegacyProducts(parsed) : parsed

    // 2) 補上 DEMO_PRODUCTS 內所有缺少的內建產品（user 既有產品保留）
    //    特別針對「user 在中間版本 v3 拿到不完整 DEMO_PRODUCTS」的情況再跑一次
    for (const [pid, defaultProduct] of Object.entries(DEMO_PRODUCTS)) {
      if (!migrated[pid]) {
        migrated[pid] = defaultProduct
      }
    }

    localStorage.setItem(LS_KEY, JSON.stringify(migrated))
    localStorage.setItem(LS_VERSION, String(CURRENT_VERSION))
    // eslint-disable-next-line no-console
    console.info('[gift-demo] migrated products → v4 (補齊所有內建贈品產品)')
    return migrated
  } catch {
    return DEMO_PRODUCTS
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(loadProducts)

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(products))
      localStorage.setItem(LS_VERSION, String(CURRENT_VERSION))
    } catch { /* ignore */ }
  }, [products])

  const updateSpec = (productId, specId, patch) => {
    setProducts(prev => {
      const p = prev[productId]
      if (!p) return prev
      return {
        ...prev,
        [productId]: {
          ...p,
          Specs: p.Specs.map(s => s.Id === specId ? { ...s, ...patch } : s),
        },
      }
    })
  }

  const addSpec = (productId) => {
    setProducts(prev => {
      const p = prev[productId]
      if (!p) return prev
      const nextId = Math.max(0, ...p.Specs.map(s => s.Id ?? 0)) + 1
      return {
        ...prev,
        [productId]: { ...p, Specs: [...p.Specs, createBlankSpec(nextId, p.Specs.length)] },
      }
    })
  }

  const removeSpec = (productId, specId) => {
    setProducts(prev => {
      const p = prev[productId]
      if (!p) return prev
      return { ...prev, [productId]: { ...p, Specs: p.Specs.filter(s => s.Id !== specId) } }
    })
  }

  return (
    <ProductContext.Provider value={{ products, updateSpec, addSpec, removeSpec }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used inside ProductProvider')
  return ctx
}
