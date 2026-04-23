import { useMemo, useState } from 'react'
import { CATEGORIES, initialCart, SA_AREAS, GIFT_RULES } from '../data/fakeData'
import { evaluateGifts } from '../utils/evaluateGifts'
import OrderCategory from '../components/OrderCategory'
import TotalBar from '../components/TotalBar'

export default function ConfirmOrder() {
  const [cart, setCart] = useState(initialCart)
  // 客人按「不要贈品」的 rule.id 集合（declined）
  const [declinedIds, setDeclinedIds] = useState(() => new Set())

  const handleChangeQty = (uid, newQty) => {
    setCart(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(it => it.uid === uid ? { ...it, quantity: newQty } : it),
    })))
  }

  const handleDelete = (uid) => {
    setCart(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.filter(it => it.uid !== uid),
    })))
  }

  // 贈品 accept / decline 切換
  const handleToggleGift = (ruleId) => {
    setDeclinedIds(prev => {
      const next = new Set(prev)
      next.has(ruleId) ? next.delete(ruleId) : next.add(ruleId)
      return next
    })
  }

  // 加購品加入購物車
  const handleAddSa = (categoryKey, saItem, qty) => {
    const uid = `sa-${saItem.pid}-${saItem.pdid}`
    setCart(prev => prev.map(cat => {
      if (cat.categoryKey !== categoryKey) return cat
      const existing = cat.items.find(it => it.uid === uid)
      if (existing) {
        return {
          ...cat,
          items: cat.items.map(it => it.uid === uid ? { ...it, quantity: it.quantity + qty } : it),
        }
      }
      const newItem = {
        uid,
        pid: saItem.pid,
        pdid: saItem.pdid,
        name: saItem.name,
        spec: '1 包',
        specSuffix: '',
        nameWarning: '',
        image: saItem.image,
        deliveryTime: '2026/04/22 ~',
        price: saItem.discountPrice,
        quantity: qty,
        maxQty: 12,
        temperatureLabel: saItem.temperatureLabel,
      }
      return { ...cat, items: [...cat.items, newItem] }
    }))
  }

  // 贈品狀態機 B：每次 cart / declinedIds 變動就重算
  const giftEvaluations = useMemo(
    () => evaluateGifts(cart, GIFT_RULES, declinedIds),
    [cart, declinedIds]
  )

  // 總金額（贈品不計入）
  const total = cart.reduce((s, cat) =>
    s + cat.items.reduce((cs, it) => cs + it.price * it.quantity, 0)
  , 0)

  return (
    <section id="pd-area">
      {cart.map(({ categoryKey, items }) => {
        const category = CATEGORIES[categoryKey]
        if (!category || items.length === 0) return null
        const saEntry = Object.values(SA_AREAS).find(s => s.categoryKey === categoryKey)
        const saItems = saEntry?.items ?? []
        const giftEvals = giftEvaluations.filter(g => g.rule.categoryKey === categoryKey)

        return (
          <OrderCategory
            key={categoryKey}
            category={category}
            items={items}
            saItems={saItems}
            giftEvals={giftEvals}
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
