import { CATEGORIES } from '../data/fakeData'

// 快達門檻的提示列：「[產線名] 還差 XXX 元即可獲得贈品「xxx」」
export default function GiftHintRow({ evaluated }) {
  const { rule, remaining } = evaluated
  const gift = rule.gift
  const categoryTitle = CATEGORIES[rule.categoryKey]?.title ?? ''
  return (
    <section className="col-xs-12 order-field-basc gift-hint-row">
      <span className="gift-hint-text">
        {categoryTitle} 還差 <strong>${remaining.toLocaleString()}</strong> 元即可獲得贈品
        <span className="gift-hint-name">「{gift.name}」</span>
      </span>
    </section>
  )
}
