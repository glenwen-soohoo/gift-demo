import { useState } from 'react'
import { CATEGORIES, initialCart, SA_AREAS } from '../data/fakeData'
import OrderCategory from '../components/OrderCategory'
import TotalBar from '../components/TotalBar'

export default function ConfirmOrder() {
  // cart 結構：[{ categoryKey, items: [...] }, ...]
  const [cart, setCart] = useState(initialCart)

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

  // 把加購品加入對應分類的購物車
  const handleAddSa = (categoryKey, saItem, qty) => {
    const uid = `sa-${saItem.pid}-${saItem.pdid}`
    setCart(prev => {
      const next = prev.map(cat => {
        if (cat.categoryKey !== categoryKey) return cat
        // 已存在就 +qty，否則新增
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
      })
      return next
    })
  }

  // 總金額
  const total = cart.reduce((s, cat) =>
    s + cat.items.reduce((cs, it) => cs + it.price * it.quantity, 0)
  , 0)

  return (
    <section id="pd-area">
      {cart.map(({ categoryKey, items }) => {
        const category = CATEGORIES[categoryKey]
        if (!category || items.length === 0) return null  // 分類被全部刪光就不顯示
        const saEntry = Object.values(SA_AREAS).find(s => s.categoryKey === categoryKey)
        const saItems = saEntry?.items ?? []
        return (
          <OrderCategory
            key={categoryKey}
            category={category}
            items={items}
            saItems={saItems}
            onChangeQty={handleChangeQty}
            onDelete={handleDelete}
            onAddSa={handleAddSa}
          />
        )
      })}

      <TotalBar total={total} />
    </section>
  )
}
