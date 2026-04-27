import { createContext, useContext, useEffect, useState } from 'react'
import { initialGiftRules, GIFT_RULE_STATE } from '../data/giftRules'
import { useProducts } from './ProductContext'
import { findSpecById } from '../data/productSpecs'

const LS_KEY = 'gift-demo:giftRules'
const LS_VERSION = 'gift-demo:giftRules:v'
const CURRENT_VERSION = 8
// v6 = 把 IsListed / Stock 從 GiftRule 拿掉；單一資料來源 = ProductDetail（productSpecs.js）
// v7 = 內建規則（id 在 initialGiftRules 內的）每次升版都從 source code 強制刷新
// v8 = 重新跑一次刷新 — 修復「v7 migration 跑時 source code 還是中間版本，內建規則
//      ProductName 殘留「(限購三張)」、Repeatable=false 等舊欄位值」
//
// 之後如果再改 initialGiftRules 內容，記得 bump 版本就會自動同步
// 內建規則 = 寫在 src/data/giftRules.js 的那 7 條 demo 預設規則
// User 用後台「新增贈品」建出來的規則不在這集合內，永遠保留

const GiftRulesContext = createContext(null)

// ─── 內建規則 Id → PopupText 預設（v5+ migration 空字串時回填） ──
const DEFAULT_POPUP_TEXTS = {}
for (const rule of initialGiftRules) {
  if (rule.PopupText) DEFAULT_POPUP_TEXTS[rule.Id] = rule.PopupText
}

// ─── 舊版 → v6 的 migration（清掉 rule 上不該存的 IsListed / Stock）──
function migrateLegacyRule(old) {
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
    UseProductIds: (old.useProductIds === true) || (old.UseProductIds === true)
      || ((old.targetProductIds ?? old.TargetProductIds ?? []).length > 0),
    UseSpecIds: (old.useSpecIds === true) || (old.UseSpecIds === true)
      || ((old.targetSpecIds ?? old.TargetSpecIds ?? []).length > 0),
    TargetProductIds: old.targetProductIds ?? old.TargetProductIds ?? [],
    TargetSpecIds: old.targetSpecIds ?? old.TargetSpecIds ?? [],
    GiftQuantity: old.giftQuantity ?? old.GiftQuantity ?? 1,
    Repeatable: old.repeatable ?? old.Repeatable ?? false,
    PopupText: (old.popupText || old.PopupText || DEFAULT_POPUP_TEXTS[old.id ?? old.Id] || ''),
    // v6：IsListed / Stock 不再放在 rule 上 → 不 carry
    MembershipLimits: (old.membershipLimit ?? old.MembershipLimits ?? []).map(m => membershipMap[m] ?? m),
    // State 還是 carry：規則 lifecycle 跟 ProductDetail.Display 是兩個概念
    // 但「上架/下架 toggle」會同時動兩邊（toggleListed 內處理）
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

    // 1) 先做 v1→v6 的欄位 rename
    let migrated = parsed.map(migrateLegacyRule)

    // 2) v7：內建規則強制刷新成 source code 最新版本
    //    User 自己用後台新增的規則（Id 不在 initialGiftRules 內）保留不動
    const builtInById = new Map(initialGiftRules.map(r => [r.Id, r]))
    migrated = migrated.map(r => {
      const fresh = builtInById.get(r.Id)
      return fresh ? { ...fresh } : r
    })
    // 把 source code 有但 LS 沒有的內建規則補進去
    const existingIds = new Set(migrated.map(r => r.Id))
    for (const r of initialGiftRules) {
      if (!existingIds.has(r.Id)) migrated.push({ ...r })
    }

    localStorage.setItem(LS_KEY, JSON.stringify(migrated))
    localStorage.setItem(LS_VERSION, String(CURRENT_VERSION))
    // eslint-disable-next-line no-console
    console.info('[gift-demo] migrated giftRules → v8 (再次強制刷新內建規則 — 解決 v7 跑時 source 不是最新版的 drift)')
    return migrated
  } catch {
    return initialGiftRules
  }
}

export function GiftRulesProvider({ children }) {
  // 跨 Context：用 ProductContext 來讀寫贈品本體 spec 的 Display / Stock
  // GiftRulesProvider 一定要被 ProductProvider 包住（見 main.jsx）
  const { products, updateSpec } = useProducts()

  const [rules, setRules] = useState(loadRules)

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(rules))
      localStorage.setItem(LS_VERSION, String(CURRENT_VERSION))
    } catch { /* ignore */ }
  }, [rules])

  const nowStamp = () => new Date().toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '/')

  // addRule：可選擇指定 Id（demo: rule.Id === ProductDetailId 簡化），未指定則自動 +1
  // production 對齊：當產品管理勾「設為贈品」時，呼叫 addRule({ Id: spec.Id, ProductId, RuleType: null, ... })
  // 讓新建 draft 規則的 Id = spec.Id（GiftRule.ProductDetailId 在 demo 用 rule.Id 代表）
  const addRule = (rule) => {
    const id = rule.Id ?? (Math.max(0, ...rules.map(r => r.Id ?? 0)) + 1)
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

  // ─── 上下架：寫進 ProductDetail.Display（單一來源），同時更新 rule.State ──
  // production 對齊：產品管理 Edit18 改 Display 也會反映到贈品列表，反之亦然
  const toggleListed = (id) => {
    const rule = rules.find(r => r.Id === id)
    if (!rule) return
    const found = findSpecById(products, rule.Id)   // demo: rule.Id === ProductDetail.Id
    if (!found) {
      // eslint-disable-next-line no-console
      console.warn(`[GiftRulesContext] toggleListed: 找不到 rule.Id=${id} 對應的 ProductDetail`)
      return
    }
    const next = !found.spec.Display
    updateSpec(found.product.Id, found.spec.Id, { Display: next })
    setRules(prev => prev.map(r =>
      r.Id === id
        ? { ...r, State: next ? GIFT_RULE_STATE.上架中 : GIFT_RULE_STATE.下架, UpdateTime: nowStamp() }
        : r
    ))
  }

  // ─── 庫存：寫進 ProductDetail.Stock（單一來源）──
  const updateStock = (id, stock) => {
    const rule = rules.find(r => r.Id === id)
    if (!rule) return
    const found = findSpecById(products, rule.Id)
    if (!found) {
      // eslint-disable-next-line no-console
      console.warn(`[GiftRulesContext] updateStock: 找不到 rule.Id=${id} 對應的 ProductDetail`)
      return
    }
    updateSpec(found.product.Id, found.spec.Id, { Stock: stock })
    setRules(prev => prev.map(r =>
      r.Id === id ? { ...r, UpdateTime: nowStamp() } : r
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

// ─── 跨 Context 的便利 hook：取得 rule 對應的 ProductDetail.Display 和 Stock ──
// 用於 admin 頁面 / ConfirmOrder 取「贈品的上架狀態」與「贈品的庫存」
export function useGiftRuleMeta(rule) {
  const { products } = useProducts()
  if (!rule) return { IsListed: false, Stock: 0, Spec: null, Product: null }
  const found = findSpecById(products, rule.Id)
  if (!found) return { IsListed: false, Stock: 0, Spec: null, Product: null }
  return {
    IsListed: found.spec.Display === true,
    Stock: found.spec.Stock ?? 0,
    Spec: found.spec,
    Product: found.product,
  }
}
