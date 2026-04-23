import { createContext, useContext, useEffect, useState } from 'react'
import { initialGiftRules } from '../data/giftRules'

const LS_KEY = 'gift-demo:giftRules'

const GiftRulesContext = createContext(null)

export function GiftRulesProvider({ children }) {
  const [rules, setRules] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return initialGiftRules
  })

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(rules)) } catch { /* ignore */ }
  }, [rules])

  const addRule = (rule) => {
    const id = Math.max(0, ...rules.map(r => r.id)) + 1
    const now = new Date().toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '/')
    setRules(prev => [...prev, { ...rule, id, createTime: now, createUser: 'Glen Wen', updateTime: '' }])
    return id
  }

  const updateRule = (id, patch) => {
    const now = new Date().toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '/')
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...patch, updateTime: now } : r))
  }

  const deleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  const toggleListed = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isListed: !r.isListed } : r))
  }

  const updateStock = (id, stock) => {
    const now = new Date().toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '/')
    setRules(prev => prev.map(r => r.id === id ? { ...r, stock, updateTime: now } : r))
  }

  const reset = () => {
    setRules(initialGiftRules)
    localStorage.removeItem(LS_KEY)
  }

  return (
    <GiftRulesContext.Provider value={{ rules, addRule, updateRule, deleteRule, toggleListed, updateStock, reset }}>
      {children}
    </GiftRulesContext.Provider>
  )
}

export function useGiftRules() {
  const ctx = useContext(GiftRulesContext)
  if (!ctx) throw new Error('useGiftRules must be used inside GiftRulesProvider')
  return ctx
}
