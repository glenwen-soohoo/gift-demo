// 狀態機 B：購物車贈品評估
// Input: cart = [{ categoryKey, items: [...] }], declinedIds: Set<ruleId>, rules
// Output: 每條 rule 的狀態 + payload
//   state = 'hidden'    → 不顯示
//   state = 'hint'      → 顯示「還差 XXX 元」提示（只有 threshold 可能進此狀態）
//   state = 'triggered' → 顯示贈品列（可能被 declined）

export function evaluateGifts(cart, rules, declinedIds = new Set()) {
  return rules.map(rule => {
    if (rule.giftType === 'threshold') {
      const cat = cart.find(c => c.categoryKey === rule.categoryKey)
      const subtotal = (cat?.items ?? []).reduce((s, it) => s + (it.price ?? 0) * (it.quantity ?? 0), 0)

      if (subtotal >= rule.thresholdAmount) {
        // 可重複贈送：subtotal 是 thresholdAmount 的幾倍
        const multiplier = rule.repeatable
          ? Math.floor(subtotal / rule.thresholdAmount)
          : 1
        const qty = (rule.gift?.quantity ?? 1) * multiplier
        return {
          rule,
          state: 'triggered',
          declined: declinedIds.has(rule.id),
          subtotal,
          multiplier,
          qty,
        }
      }
      if (subtotal >= rule.hintAmount) {
        return {
          rule,
          state: 'hint',
          subtotal,
          remaining: rule.thresholdAmount - subtotal,
        }
      }
      return { rule, state: 'hidden', subtotal }
    }

    if (rule.giftType === 'buy_to_get') {
      const totalQty = cart
        .flatMap(c => c.items)
        .filter(it => it.pid === rule.targetPid)
        .reduce((s, it) => s + (it.quantity ?? 0), 0)

      if (totalQty >= rule.thresholdQuantity) {
        // 可重複贈送：totalQty 是 thresholdQuantity 的幾倍
        const multiplier = rule.repeatable
          ? Math.floor(totalQty / rule.thresholdQuantity)
          : 1
        const qty = (rule.gift?.quantity ?? 1) * multiplier
        return {
          rule,
          state: 'triggered',
          declined: declinedIds.has(rule.id),
          totalQty,
          multiplier,
          qty,
        }
      }
      return { rule, state: 'hidden', totalQty }
    }

    return { rule, state: 'hidden' }
  })
}
