import { createContext, useContext, useEffect, useState } from 'react'
import { DEMO_PRODUCTS } from '../data/productSpecs'

const LS_KEY = 'gift-demo:products'
const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return DEMO_PRODUCTS
  })

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(products)) } catch { /* ignore */ }
  }, [products])

  const updateSpec = (productId, specId, patch) => {
    setProducts(prev => {
      const p = prev[productId]
      if (!p) return prev
      return {
        ...prev,
        [productId]: {
          ...p,
          specs: p.specs.map(s => s.id === specId ? { ...s, ...patch } : s),
        },
      }
    })
  }

  const addSpec = (productId) => {
    setProducts(prev => {
      const p = prev[productId]
      if (!p) return prev
      const newId = Math.max(0, ...p.specs.map(s => s.id)) + 1
      const blank = {
        id: newId, sort: p.specs.length,
        description: '', quantity: 1, unit: '個',
        originPrice: 0, discountPrice: 0, stock: 0, sold: 0, cost: 0, freight: 0,
        expectShipDate: '', expectLastShipDate: '',
        saleStart: '', saleEnd: '', autoExtendDays: 0,
        isListed: true, isYuanxiong: false, isSpecial: false, isCOD: false,
        isSubscription: false, thresholdAmount: 0, limitQuantity: 0, isGift: false,
      }
      return { ...prev, [productId]: { ...p, specs: [...p.specs, blank] } }
    })
  }

  const removeSpec = (productId, specId) => {
    setProducts(prev => {
      const p = prev[productId]
      if (!p) return prev
      return { ...prev, [productId]: { ...p, specs: p.specs.filter(s => s.id !== specId) } }
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
