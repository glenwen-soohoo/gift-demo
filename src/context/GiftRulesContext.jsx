import { createContext, useContext, useEffect, useState } from 'react'
import { initialGiftRules, GIFT_RULE_STATE } from '../data/giftRules'

const LS_KEY = 'gift-demo:giftRules'
const LS_VERSION = 'gift-demo:giftRules:v'
const CURRENT_VERSION = 2    // v2 = Phase D PascalCase

const GiftRulesContext = createContext(null)

// ─── 舊 camelCase 規則 → 新 PascalCase 規則的 migration ──
function migrateLegacyRule(old) {
  // 舊欄位的 productionline / temperature 都是字串，對照 enum 整數
  const productionLineMap = {
    frozen: 7,
    babyfood: 9,
    eaglebabee: 11,
    itemnew: 0,
    dryproduce: 100,
    freshmeat: 101,
  }
  const temperatureMap = {
    frozen: 3,
    refrigerated: 2,
    ambient: 1,
  }
  const ruleTypeMap = {
    threshold: 'Threshold',
    buy_to_get: 'BuyToGet',
  }
  const membershipMap = {
    VIP: 'VIP',
    VVIP: 'VVIP',
    SVIP: 'SVIP',
    '首購': 'FirstOrder',
  }

  return {
    Id: old.id ?? old.Id,
    ProductId: old.productId ?? old.ProductId,
    ProductName: old.productName ?? old.ProductName ?? '',
    ProductSpec: old.productSpec ?? old.ProductSpec ?? '',
    SpecSuffix: old.specSuffix ?? old.SpecSuffix ?? '',
    Pic: old.image ?? old.Pic ?? '',
    DeliveryTime: old.deliveryTime ?? old.DeliveryTime ?? '',
    RuleType: old.RuleType ?? (old.ruleType ? ruleTypeMap[old.ruleType] ?? null : null),
    ProductionLine: old.ProductionLine ?? productionLineMap[old.productionline] ?? 0,
    TemperatureLayer: old.TemperatureLayer ?? temperatureMap[old.temperature] ?? 0,
    ThresholdAmount: old.thresholdAmount ?? old.ThresholdAmount ?? 0,
    HintAmount: old.hintAmount ?? old.HintAmount ?? 0,
    ThresholdQuantity: old.thresholdQuantity ?? old.ThresholdQuantity ?? 0,
    UseProductIds: old.useProductIds ?? old.UseProductIds ?? false,
    UseSpecIds: old.useSpecIds ?? old.UseSpecIds ?? false,
    TargetProductIds: old.targetProductIds ?? old.TargetProductIds ?? [],
    TargetSpecIds: old.targetSpecIds ?? old.TargetSpecIds ?? [],
    GiftQuantity: old.giftQuantity ?? old.GiftQuantity ?? 1,
    Repeatable: old.repeatable ?? old.Repeatable ?? false,
    PopupText: old.popupText ?? old.PopupText ?? '',
    Stock: old.stock ?? old.Stock ?? 0,
    IsListed: old.isListed ?? old.IsListed ?? false,
    MembershipLimits: (old.membershipLimit ?? old.MembershipLimits ?? []).map(m => membershipMap[m] ?? m),
    State: old.State ?? (old.isListed ? GIFT_RULE_STATE.上架中 : GIFT_RULE_STATE.下架),
    StartTime: old.StartTime ?? null,
    EndTime: old.EndTime ?? null,
    CreateTime: old.createTime ?? old.CreateTime ?? '',
    CreateUserId: old.CreateUserId ?? 0,
    CreateUser: old.createUser ?? old.CreateUser ?? '',
    UpdateTime: old.updateTime ?? old.UpdateTime ?? '',
    UpdateUserId: old.UpdateUserId ?? 0,
  }
}

function loadRules() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return initialGiftRules

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return initialGiftRules

    const version = Number(localStorage.getItem(LS_VERSION) || '1')
    if (version >= CURRENT_VERSION) return parsed

    // 發現舊 camelCase 資料：migrate 一次並寫回
    const migrated = parsed.map(migrateLegacyRule)
    localStorage.setItem(LS_KEY, JSON.stringify(migrated))
    localStorage.setItem(LS_VERSION, String(CURRENT_VERSION))
    // eslint-disable-next-line no-console
    console.info('[gift-demo] migrated giftRules from v1 (camelCase) → v2 (PascalCase)')
    return migrated
  } catch {
    return initialGiftRules
  }
}

export function GiftRulesProvider({ children }) {
  const [rules, setRules] = useState(loadRules)

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(rules))
      localStorage.setItem(LS_VERSION, String(CURRENT_VERSION))
    } catch { /* ignore */ }
  }, [rules])

  const nowStamp = () => new Date().toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '/')

  const addRule = (rule) => {
    const id = Math.max(0, ...rules.map(r => r.Id ?? 0)) + 1
    setRules(prev => [
      ...prev,
      { ...rule, Id: id, CreateTime: nowStamp(), CreateUser: 'Glen Wen', CreateUserId: 0, UpdateTime: '' },
    ])
    return id
  }

  const updateRule = (id, patch) => {
    setRules(prev => prev.map(r => r.Id === id ? { ...r, ...patch, UpdateTime: nowStamp() } : r))
  }

  const deleteRule = (id) => {
    setRules(prev => prev.filter(r => r.Id !== id))
  }

  const toggleListed = (id) => {
    setRules(prev => prev.map(r => {
      if (r.Id !== id) return r
      const next = !r.IsListed
      return {
        ...r,
        IsListed: next,
        State: next ? GIFT_RULE_STATE.上架中 : GIFT_RULE_STATE.下架,
      }
    }))
  }

  const updateStock = (id, stock) => {
    setRules(prev => prev.map(r =>
      r.Id === id ? { ...r, Stock: stock, UpdateTime: nowStamp() } : r
    ))
  }

  const reset = () => {
    setRules(initialGiftRules)
    localStorage.removeItem(LS_KEY)
    localStorage.setItem(LS_VERSION, String(CURRENT_VERSION))
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
