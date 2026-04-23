// 狀態機 B：購物車贈品評估（對齊 fruit_web 未來的 CartGiftService.EvaluateGifts）
//
// 【Phase D】輸入/輸出與欄位全部對齊 fruit_web 的 DTO：
//
// Input:
//   cartItems: CartOrderItem[]   — 扁平 list，每項帶 Type / TemperatureType / ProductId / Quantity / Price / IsGift
//   giftRules: GiftRule[]        — 從 GiftRulesContext 讀
//   declinedGiftRuleIds: Set<number>  — 客人按「不要贈品」的 GiftRuleId 集合
//   context:
//     {
//       UserId,            // 目前使用者 ID（demo 可 null）
//       VipLevel,          // 'NORMAL' | 'VIP' | 'VVIP' | 'SVIP'
//       IsFirstOrder,      // bool
//       Now,               // Date 物件，預設 new Date()
//     }
//
// Output:
//   {
//     Triggered: GiftTriggeredItem[],  // 已觸發的贈品（含 declined 狀態）
//     Hints:     GiftHintItem[],       // 快達門檻的提示
//   }
//   HIDDEN 狀態的規則不出現在結果裡

import { GIFT_RULE_STATE } from '../data/giftRules'

export function evaluateGifts(cartItems, giftRules, declinedGiftRuleIds = new Set(), context = {}) {
  const ctx = {
    UserId: context.UserId ?? null,
    VipLevel: context.VipLevel ?? 'NORMAL',
    IsFirstOrder: !!context.IsFirstOrder,
    Now: context.Now ?? new Date(),
  }

  const triggered = []
  const hints = []

  for (const rule of giftRules) {
    // 略過：未設定規則型別的 draft
    if (!rule.RuleType) continue

    // 略過：非上架中
    if (rule.State !== GIFT_RULE_STATE.上架中) continue

    // 略過：已過 EndTime（對齊 fruit_web 讀取時即時判斷策略）
    if (rule.EndTime && new Date(rule.EndTime) < ctx.Now) continue

    // 略過：會員等級不符
    if (!isMembershipEligible(rule.MembershipLimits ?? [], ctx)) continue

    // 分型別判斷
    if (rule.RuleType === 'Threshold') {
      const evaluated = evaluateThreshold(rule, cartItems, declinedGiftRuleIds)
      if (evaluated?.kind === 'triggered') triggered.push(evaluated.item)
      else if (evaluated?.kind === 'hint')  hints.push(evaluated.item)
    } else if (rule.RuleType === 'BuyToGet') {
      const evaluated = evaluateBuyToGet(rule, cartItems, declinedGiftRuleIds)
      if (evaluated?.kind === 'triggered') triggered.push(evaluated.item)
    }
  }

  return { Triggered: triggered, Hints: hints }
}

// ── 會員等級判斷 ────────────────────────────────
function isMembershipEligible(limits, ctx) {
  if (!limits || limits.length === 0) return true   // 無限制 = 所有人都符合

  // 任一條件符合即可（OR）
  return limits.some(lvl => {
    if (lvl === 'FirstOrder') return ctx.IsFirstOrder
    return ctx.VipLevel === lvl || higherOrEqual(ctx.VipLevel, lvl)
  })
}

function higherOrEqual(currentLevel, requiredLevel) {
  const order = { NORMAL: 0, VIP: 1, VVIP: 2, SVIP: 3 }
  return (order[currentLevel] ?? 0) >= (order[requiredLevel] ?? 999)
}

// ── 滿額贈 ─────────────────────────────────────
function evaluateThreshold(rule, cartItems, declinedIds) {
  // 同產線 + 同溫層的商品（不含贈品）加總
  const subtotal = cartItems
    .filter(it => !it.IsGift)
    .filter(it => it.Type === rule.ProductionLine)
    .filter(it => it.TemperatureType === rule.TemperatureLayer)
    .reduce((s, it) => s + (it.Price ?? 0) * (it.Quantity ?? 0), 0)

  if (subtotal >= rule.ThresholdAmount) {
    const multiplier = rule.Repeatable
      ? Math.floor(subtotal / rule.ThresholdAmount)
      : 1
    return {
      kind: 'triggered',
      item: buildTriggeredItem(rule, multiplier, declinedIds),
    }
  }

  if (subtotal >= rule.HintAmount) {
    return {
      kind: 'hint',
      item: {
        GiftRuleId: rule.Id,
        Remaining: rule.ThresholdAmount - subtotal,
        ProductionLineName: getProductionLineName(rule.ProductionLine),
        GiftName: rule.ProductName,
        PopupText: rule.PopupText ?? '',
      },
    }
  }

  return null
}

// ── 買就送 ─────────────────────────────────────
function evaluateBuyToGet(rule, cartItems, declinedIds) {
  // 合成目標清單：同時支援 UseProductIds 與 UseSpecIds
  const totalQty = cartItems
    .filter(it => !it.IsGift)
    .filter(it => isTargetMatch(it, rule))
    .reduce((s, it) => s + (it.Quantity ?? 0), 0)

  if (totalQty >= rule.ThresholdQuantity) {
    const multiplier = rule.Repeatable
      ? Math.floor(totalQty / rule.ThresholdQuantity)
      : 1
    return {
      kind: 'triggered',
      item: buildTriggeredItem(rule, multiplier, declinedIds),
    }
  }

  return null
}

function isTargetMatch(cartItem, rule) {
  if (rule.UseProductIds && (rule.TargetProductIds ?? []).includes(cartItem.ProductId)) return true
  if (rule.UseSpecIds    && (rule.TargetSpecIds    ?? []).includes(cartItem.ProductDetailId)) return true
  return false
}

// ── 組 GiftTriggeredItem（對齊 fruit_web CartGiftResult.Triggered[n]） ──
function buildTriggeredItem(rule, multiplier, declinedIds) {
  return {
    GiftRuleId: rule.Id,
    ProductId: rule.ProductId,
    ProductDetailId: rule.Id,                 // demo：規則 Id 與規格 Id 視同（單一贈品規格）
    ProductName: rule.ProductName,
    ProductSpec: rule.ProductSpec,
    SpecSuffix: rule.SpecSuffix ?? '',
    Pic: rule.Pic,
    DeliveryTime: rule.DeliveryTime ?? '',
    GiftType: rule.RuleType,                  // 'Threshold' | 'BuyToGet'
    Quantity: (rule.GiftQuantity ?? 1) * multiplier,
    Multiplier: multiplier,
    IsDeclined: declinedIds.has(rule.Id),
    PopupText: rule.PopupText ?? '',
  }
}

// ── 輔助：產線顯示名 ──────────────────────────
function getProductionLineName(productionLine) {
  const map = {
    0: '產地直送',
    7: '冷凍超市',
    9: '粥寶寶',
    11: '益菓保',
    100: '蔬果乾貨',
    101: '生鮮肉舖',
  }
  return map[productionLine] ?? ''
}
