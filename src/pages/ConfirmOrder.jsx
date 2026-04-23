import { useMemo, useState } from 'react'
import { CATEGORIES, initialCart, SA_AREAS } from '../data/fakeData'
import { useGiftRules } from '../context/GiftRulesContext'
import { evaluateGifts } from '../utils/evaluateGifts'
import OrderCategory from '../components/OrderCategory'
import TotalBar from '../components/TotalBar'

export default function ConfirmOrder() {
  const [cart, setCart] = useState(initialCart)
  const { rules } = useGiftRules()

  // 客人按「不要贈品」的 GiftRuleId 集合
  const [declinedGiftRuleIds, setDeclinedGiftRuleIds] = useState(() => new Set())

  const handleChangeQty = (uid, newQty) => {
    setCart(prev => prev.map(cat => ({
      ...cat,
      Items: cat.Items.map(it => it.uid === uid ? { ...it, Quantity: newQty } : it),
    })))
  }

  const handleDelete = (uid) => {
    setCart(prev => prev.map(cat => ({
      ...cat,
      Items: cat.Items.filter(it => it.uid !== uid),
    })))
  }

  // 贈品 accept / decline 切換
  const handleToggleGift = (giftRuleId) => {
    setDeclinedGiftRuleIds(prev => {
      const next = new Set(prev)
      next.has(giftRuleId) ? next.delete(giftRuleId) : next.add(giftRuleId)
      return next
    })
  }

  // 加購品加入購物車（對齊 PascalCase）
  const handleAddSa = (type, saItem, qty) => {
    const uid = `sa-${saItem.ProductId}-${saItem.ProductDetailId}`
    setCart(prev => prev.map(cat => {
      if (cat.Type !== type) return cat
      const existing = cat.Items.find(it => it.uid === uid)
      if (existing) {
        return {
          ...cat,
          Items: cat.Items.map(it => it.uid === uid ? { ...it, Quantity: it.Quantity + qty } : it),
        }
      }
      const newItem = {
        uid,
        ProductId: saItem.ProductId,
        ProductDetailId: saItem.ProductDetailId,
        ProductName: saItem.ProductName,
        ProductSpec: '1 包',
        SpecSuffix: '',
        NameWarning: '',
        Pic: saItem.Pic,
        DeliveryTime: '2026/04/22 ~',
        Price: saItem.DiscountPrice,
        Quantity: qty,
        MaxQty: 12,
        Type: cat.Type,
        TemperatureType: 3,               // 加購目前都冷凍
        TemperatureTypeName: saItem.TemperatureTypeName ?? '冷凍',
        IsGift: false,
        GiftRuleId: null,
        IsGiftDeclined: false,
      }
      return { ...cat, Items: [...cat.Items, newItem] }
    }))
  }

  // 贈品狀態機 B：每次 cart / declined / rules 變動就重算
  const giftResult = useMemo(() => {
    // 扁平化 cart items
    const allItems = cart.flatMap(c => c.Items)
    return evaluateGifts(allItems, rules, declinedGiftRuleIds, {
      VipLevel: 'VIP',         // demo 假設當前使用者是 VIP
      IsFirstOrder: true,      // demo 假設為首購，讓集點卡規則觸發
    })
  }, [cart, rules, declinedGiftRuleIds])

  // 總金額（贈品不計入）
  const total = cart.reduce((s, cat) =>
    s + cat.Items.reduce((cs, it) => cs + it.Price * it.Quantity, 0)
  , 0)

  return (
    <section id="pd-area">
      {cart.map(({ Type, Items }) => {
        const category = CATEGORIES[Type]
        if (!category || Items.length === 0) return null
        const saEntry = Object.values(SA_AREAS).find(s => s.Type === Type)
        const saItems = saEntry?.Items ?? []

        // 此分類對應的贈品（按 ProductionLine = Type 篩）
        const triggeredGifts = giftResult.Triggered.filter(g => {
          const rule = rules.find(r => r.Id === g.GiftRuleId)
          return rule?.ProductionLine === Type
        })
        const hintGifts = giftResult.Hints.filter(h => {
          const rule = rules.find(r => r.Id === h.GiftRuleId)
          return rule?.ProductionLine === Type
        })

        return (
          <OrderCategory
            key={Type}
            category={category}
            items={Items}
            saItems={saItems}
            triggeredGifts={triggeredGifts}
            hintGifts={hintGifts}
            onChangeQty={handleChangeQty}
            onDelete={handleDelete}
            onAddSa={handleAddSa}
            onToggleGift={handleToggleGift}
          />
        )
      })}

      <TotalBar total={total} />
    </section>
  )
}
